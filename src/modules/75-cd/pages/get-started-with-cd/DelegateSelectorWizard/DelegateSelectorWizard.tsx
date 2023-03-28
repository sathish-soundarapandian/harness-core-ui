/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Container, HarnessDocTooltip, Layout, Text, useToaster } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import produce from 'immer'
import { capitalize, defaultTo, get, isEmpty, noop, set } from 'lodash-es'
import { HelpPanel } from '@harness/help-panel'
import { useStrings } from 'framework/strings'
import {
  EnvironmentRequestDTO,
  InfrastructureRequestDTO,
  InfrastructureRequestDTORequestBody,
  useCreateEnvironmentV2,
  useCreateInfrastructure,
  useUpdateInfrastructure,
  useUpsertEnvironmentV2
} from 'services/cd-ng'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import useCreateEditConnector, { BuildPayloadProps } from '@connectors/hooks/useCreateEditConnector'
import { buildKubPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { DelegateTypes } from '@delegates/constants'
import { StringUtils } from '@common/exports'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { CDOnboardingActions } from '@common/constants/TrackingConstants'
import { CreateDockerDelegate } from '../CreateDockerDelegateWizard/CreateDockerDelegate'
import {
  cleanEnvironmentDataUtil,
  DelegateSuccessHandler,
  EnvironmentEntities,
  getUniqueEntityIdentifier,
  newDelegateState,
  newEnvironmentState
} from '../CDOnboardingUtils'
import { useCDOnboardingContext } from '../CDOnboardingStore'
import InfoContainer from '../InfoContainer/InfoContainer'
import { CreateK8sDelegateV2 } from '../CreateKubernetesDelegateWizard/CreateK8sDelegateV2'
import css from '../CreateKubernetesDelegateWizard/CreateK8sDelegate.module.scss'
import moduleCss from '../DeployProvisioningWizard/DeployProvisioningWizard.module.scss'

export interface DelegateSelectorRefInstance {
  isDelegateInstalled?: boolean
}
export type DelegateSelectorForwardRef =
  | ((instance: DelegateSelectorRefInstance | null) => void)
  | React.MutableRefObject<DelegateSelectorRefInstance | null>
  | null
export interface DelegateTypeSelectorProps {
  disableNextBtn: () => void
  enableNextBtn: () => void
}

interface DelegateSelectorStepData extends BuildPayloadProps {
  delegateSelectors: Array<string>
}

const ENV_ID = 'dev'
const INFRASTRUCTURE_ID = 'dev-cluster'
const INFRASTRUCTURE_TYPE = 'KubernetesDirect'
const NAMESPACE = 'default'

const DelegateSelectorWizardRef = (
  { enableNextBtn, disableNextBtn }: DelegateTypeSelectorProps,
  forwardRef: DelegateSelectorForwardRef
): JSX.Element => {
  const {
    saveEnvironmentData,
    saveInfrastructureData,
    saveDelegateData,
    state: {
      delegate: delegateData,
      service: serviceData,
      environment: environmentData,
      infrastructure: infrastructureData
    }
  } = useCDOnboardingContext()

  const { trackEvent } = useTelemetry()
  const { getString } = useStrings()
  const { showError, clear } = useToaster()
  const { getRBACErrorMessage } = useRBACError()

  const { accountId, projectIdentifier, orgIdentifier } = useParams<Record<string, string>>()
  const successRefHandler = useRef<(() => void) | null>(null)
  const delegateName = useRef<string>()
  const isEditMode = !isEmpty(delegateData?.delegateIdentifier)
  const delegateType = delegateData?.delegateType || DelegateTypes.KUBERNETES_CLUSTER
  const [disableBtn, setDisableBtn] = React.useState<boolean>(true)
  const [isDelegateInstalled, setIsDelegateInstalled] = React.useState<boolean>(
    defaultTo(delegateData?.delegateInstalled, false)
  )
  const [helpPanelVisible, setHelpPanelVisible] = React.useState<boolean>(false)

  const [environmentEntities, setEnvironmentEntities] = React.useState<EnvironmentEntities>(
    defaultTo(delegateData?.environmentEntities, {})
  )

  useEffect(() => {
    if (!forwardRef) {
      return
    }
    if (typeof forwardRef === 'function') {
      return
    }
    forwardRef.current = { isDelegateInstalled }
  }, [isDelegateInstalled, forwardRef])

  const onSuccessHandler = React.useCallback(
    ({ delegateCreated, delegateInstalled }: DelegateSuccessHandler): void => {
      setDisableBtn(!delegateCreated) // not created, verifying started
      setIsDelegateInstalled(Boolean(delegateInstalled))

      if (delegateInstalled) {
        // if delegate flow already created, proceed to next
        enableNextBtn()
      } else {
        handleSubmit()
      }
    },
    [delegateType]
  )

  useEffect(() => {
    if (!disableBtn && isDelegateInstalled) {
      enableNextBtn()
    } else {
      disableNextBtn()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disableBtn])

  const isHelpPanelVisible = (): void => {
    !helpPanelVisible && trackEvent(CDOnboardingActions.PreviewHelpAndTroubleshooting, {})
    setHelpPanelVisible(!helpPanelVisible)
  }

  const conditionalContent = (): JSX.Element => {
    switch (delegateType) {
      case DelegateTypes.KUBERNETES_CLUSTER:
        return (
          <CreateK8sDelegateV2
            onSuccessHandler={onSuccessHandler}
            handleHelpPanel={isHelpPanelVisible}
            successRef={successRefHandler}
            delegateNameRef={delegateName}
            disableNextBtn={disableNextBtn}
            enableNextBtn={enableNextBtn}
          />
        )
      case DelegateTypes.DOCKER:
        return (
          <CreateDockerDelegate
            onSuccessHandler={onSuccessHandler}
            successRef={successRefHandler}
            delegateNameRef={delegateName}
          />
        )
      default:
        return <></>
    }
  }

  const { mutate: createEnvironment } = useCreateEnvironmentV2({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { mutate: updateEnvironment } = useUpsertEnvironmentV2({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { mutate: createInfrastructure } = useCreateInfrastructure({
    queryParams: {
      accountIdentifier: accountId
    }
  })
  const { mutate: updateInfrastructure } = useUpdateInfrastructure({
    queryParams: {
      accountIdentifier: accountId
    }
  })
  const { onInitiate } = useCreateEditConnector<DelegateSelectorStepData>({
    accountId,
    isEditMode: isEditMode,
    isGitSyncEnabled: false,
    afterSuccessHandler: noop,
    skipGovernanceCheck: true,
    hideSuccessToast: true
  })

  React.useEffect(() => {
    const updatedContextDelegate = produce(
      delegateData?.environmentEntities?.delegate ? delegateData : newDelegateState.delegate,
      draft => {
        set(draft, 'delegateType', delegateType)
        set(draft, 'delegateInstalled', isDelegateInstalled)
      }
    )
    saveDelegateData(updatedContextDelegate)
  }, [delegateType, isDelegateInstalled, saveDelegateData])

  const handleSubmit = React.useCallback(async (): Promise<void> => {
    const connectorIdentifier = !isEmpty(infrastructureData?.infrastructureDefinition?.spec?.connectorRef)
      ? infrastructureData?.infrastructureDefinition?.spec?.connectorRef
      : getUniqueEntityIdentifier(newEnvironmentState.connector.name)
    const environmentIdentifier = !isEmpty(environmentData?.identifier)
      ? environmentData?.identifier
      : getUniqueEntityIdentifier(ENV_ID)
    const infraIdentifier = !isEmpty(infrastructureData?.identifier)
      ? infrastructureData?.identifier
      : getUniqueEntityIdentifier(INFRASTRUCTURE_ID)
    const updatedContextEnvironment = produce(newEnvironmentState.environment, draft => {
      set(draft, 'name', ENV_ID)
      set(draft, 'identifier', environmentIdentifier)
    })
    try {
      // Connector Creation
      const connectorData = {
        ...newEnvironmentState.connector,
        identifier: connectorIdentifier,
        projectIdentifier: projectIdentifier,
        orgIdentifier: orgIdentifier,
        delegateSelectors: [delegateName.current as string]
      }

      onInitiate({
        connectorFormData: connectorData,
        buildPayload: buildKubPayload
      })

      const cleanEnvironmentData = cleanEnvironmentDataUtil(updatedContextEnvironment as EnvironmentRequestDTO)
      // Environment Creation
      const environmentRequest = isEditMode ? updateEnvironment : createEnvironment
      const response = await environmentRequest({ ...cleanEnvironmentData, orgIdentifier, projectIdentifier })
      if (response.status === 'SUCCESS') {
        clear()
        ENV_ID && saveEnvironmentData(updatedContextEnvironment)
        const updatedContextInfra = produce(newEnvironmentState.infrastructure, draft => {
          set(draft, 'name', INFRASTRUCTURE_ID)
          set(draft, 'identifier', infraIdentifier)
          set(draft, 'type', INFRASTRUCTURE_TYPE)
          set(draft, 'environmentRef', ENV_ID)
          set(draft, 'infrastructureDefinition.spec.namespace', NAMESPACE)
          set(draft, 'infrastructureDefinition.spec.connectorRef', connectorIdentifier)
        })

        const body: InfrastructureRequestDTORequestBody = {
          name: INFRASTRUCTURE_ID,
          identifier: infraIdentifier,
          description: '',
          tags: {},
          orgIdentifier,
          projectIdentifier,
          type: INFRASTRUCTURE_TYPE as InfrastructureRequestDTO['type'],
          environmentRef: environmentIdentifier
        }
        // Infrastructure Creation/Updation
        const infrastructureRequest = isEditMode ? updateInfrastructure : createInfrastructure
        infrastructureRequest({
          ...body,
          yaml: yamlStringify({
            infrastructureDefinition: {
              ...body,
              deploymentType: get(serviceData, 'serviceDefinition.type'),
              spec: get(updatedContextInfra, 'infrastructureDefinition.spec'),
              allowSimultaneousDeployments: false
            }
          })
        })
          .then(infraResponse => {
            if (infraResponse.status === 'SUCCESS') {
              return Promise.resolve()
            } else {
              throw infraResponse
            }
          })
          .catch(e => {
            throw e
          })
        const envEntites = {
          connector: newEnvironmentState.connector.name,
          delegate: delegateName.current as string,
          environment: ENV_ID,
          infrastructure: INFRASTRUCTURE_ID,
          namespace: NAMESPACE
        }
        setEnvironmentEntities(envEntites)

        const updatedContextDelegate = produce(newDelegateState.delegate, draft => {
          set(draft, 'delegateType', delegateType)
          set(draft, 'delegateInstalled', isDelegateInstalled)
          set(draft, 'environmentEntities.connector', newEnvironmentState.connector.name)
          set(draft, 'environmentEntities.delegate', delegateName.current as string)
          set(draft, 'environmentEntities.environment', ENV_ID)
          set(draft, 'environmentEntities.infrastructure', INFRASTRUCTURE_ID)
          set(draft, 'environmentEntities.namespace', NAMESPACE)
          set(draft, 'delegateIdentifier', StringUtils.getIdentifierFromName(delegateName.current as string))
        })
        saveInfrastructureData(updatedContextInfra)
        saveDelegateData(updatedContextDelegate)
        trackEvent(CDOnboardingActions.EnvironmentEntitiesCreation, envEntites)
        enableNextBtn()
        return Promise.resolve()
      } else {
        throw response
      }
    } catch (error: any) {
      showError(getRBACErrorMessage(error))
      return Promise.resolve()
    }
  }, [
    clear,
    createEnvironment,
    createInfrastructure,
    delegateType,
    enableNextBtn,
    environmentData?.identifier,
    getRBACErrorMessage,
    infrastructureData,
    isDelegateInstalled,
    isEditMode,
    onInitiate,
    orgIdentifier,
    projectIdentifier,
    saveDelegateData,
    saveEnvironmentData,
    saveInfrastructureData,
    serviceData,
    showError,
    trackEvent,
    updateEnvironment,
    updateInfrastructure
  ])

  const environmentEntitiesData = React.useMemo(() => {
    return (
      <Layout.Vertical padding={{ top: 'large' }}>
        <Text
          font={{ variation: FontVariation.H4, weight: 'semi-bold' }}
          padding={{ bottom: 'small' }}
          data-tooltip-id="cdOnboardingEnvironmentDetails"
        >
          {getString('cd.getStartedWithCD.environmentDetails')}
          <HarnessDocTooltip tooltipId="cdOnboardingEnvironmentDetails" useStandAlone={true} />
        </Text>
        <Text font={{ weight: 'light', size: 'normal' }} color={Color.GREY_600} padding={{ top: 'small' }}>
          {getString('cd.getStartedWithCD.entityCreationTitle')}
        </Text>

        <Layout.Vertical padding={{ top: 'small', bottom: 'small' }}>
          {Object.entries(environmentEntities).map(([key, value]) => (
            <Text key={key} style={{ lineHeight: '28px' }} font={{ size: 'normal' }}>
              {`${capitalize(key)}: ${value}`}
            </Text>
          ))}
        </Layout.Vertical>
      </Layout.Vertical>
    )
  }, [environmentEntities, getString])

  return (
    <Layout.Vertical width={'100%'} margin={{ left: 'small' }}>
      <Layout.Horizontal>
        <Layout.Vertical width={'55%'}>
          <Container>
            <Text
              font={{ variation: FontVariation.H3, weight: 'semi-bold' }}
              margin={{ bottom: 'small' }}
              color={Color.GREY_600}
              data-tooltip-id="cdOnboardingEnvironment"
            >
              {getString('cd.getStartedWithCD.connectHarnessEnv')}
              <HarnessDocTooltip tooltipId="cdOnboardingEnvironment" useStandAlone={true} />
            </Text>
            <InfoContainer label="cd.getStartedWithCD.delegateDescription" />

            <div className={css.marginTopClass} />
          </Container>
          <Layout.Vertical>
            <div className={css.marginTop} />
            {conditionalContent()}
          </Layout.Vertical>

          {delegateName?.current && !isEmpty(delegateData?.delegateType) && (
            <>
              <Container className={css.borderBottomClass} />
              {!isEmpty(environmentEntities?.connector) ? environmentEntitiesData : null}
            </>
          )}
        </Layout.Vertical>

        <Container className={moduleCss.helpPanelContainer}>
          <HelpPanel referenceId="cdOnboardConnecttoEnvironment" />
        </Container>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export const DelegateSelectorWizard = React.forwardRef(DelegateSelectorWizardRef)
