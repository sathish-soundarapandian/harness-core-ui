/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Container, HarnessDocTooltip, Layout, Tabs, Text, useToaster } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import cx from 'classnames'
import produce from 'immer'
import { capitalize, defaultTo, get, isEmpty, noop, set } from 'lodash-es'
import { useStrings } from 'framework/strings'
import {
  EnvironmentRequestDTO,
  InfrastructureRequestDTO,
  InfrastructureRequestDTORequestBody,
  useCreateEnvironmentV2,
  useCreateInfrastructure
} from 'services/cd-ng'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import useCreateEditConnector, { BuildPayloadProps } from '@connectors/hooks/useCreateEditConnector'
import { buildKubPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { DelegateTypes } from '@delegates/constants'
import type { RestResponseDelegateSetupDetails } from 'services/portal'
import { CreateK8sDelegate } from '../CreateKubernetesDelegateWizard/CreateK8sDelegate'
import { CreateDockerDelegate } from '../CreateDockerDelegateWizard/CreateDockerDelegate'
import { GoogleK8sService } from '../HelpTexts/GoogleK8sService'
import { AmazonElasticK8sService } from '../HelpTexts/AmazonElasticK8sService'
import { AzureK8sService } from '../HelpTexts/AzureK8sService'
import { Minikube } from '../HelpTexts/Minikube'
import {
  cleanEnvironmentDataUtil,
  DelegateSuccessHandler,
  EnvironmentEntities,
  getUniqueEntityIdentifier,
  newDelegateState,
  newEnvironmentState
} from '../CDOnboardingUtils'
import { useCDOnboardingContext } from '../CDOnboardingStore'
import DelegateDetailsCard from './DelegateDetailsCard'
import css from '../CreateKubernetesDelegateWizard/CreateK8sDelegate.module.scss'

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

export const DelegateSelectorWizard = ({ enableNextBtn, disableNextBtn }: DelegateTypeSelectorProps): JSX.Element => {
  const {
    saveEnvironmentData,
    saveInfrastructureData,
    saveDelegateData,
    state: { delegate: delegateData, service: serviceData }
  } = useCDOnboardingContext()

  const [delegateType, setDelegateType] = React.useState<string | undefined>(
    delegateData?.delegateType || DelegateTypes.KUBERNETES_CLUSTER
  )
  const [disableBtn, setDisableBtn] = React.useState<boolean>(true)
  const [isDelegateInstalled, setIsDelegateInstalled] = React.useState<boolean>(
    defaultTo(delegateData?.delegateInstalled, false)
  )
  const [helpPanelVisible, setHelpPanelVisible] = React.useState<boolean>(false)
  const [showDelegateOverview, setShowDelegateOverview] = React.useState<boolean>(false)
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<Record<string, string>>()
  const successRefHandler = useRef<(() => void) | null>(null)
  const delegateName = useRef<string>()
  const { showError, clear } = useToaster()
  const { getRBACErrorMessage } = useRBACError()

  const [environmentEntities, setEnvironmentEntities] = React.useState<EnvironmentEntities>(
    defaultTo(delegateData?.environmentEntities, {})
  )

  const onSuccessHandler = React.useCallback(
    ({ delegateCreated, delegateInstalled, delegateYamlResponse }: DelegateSuccessHandler): void => {
      setDisableBtn(!delegateCreated)
      setIsDelegateInstalled(Boolean(delegateInstalled))

      if (delegateData?.delegateYAMLResponse) {
        // if delegate flow already created, proceed to next
        enableNextBtn()
      } else {
        handleSubmit(delegateYamlResponse)
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
    setHelpPanelVisible(!helpPanelVisible)
  }

  const conditionalContent = (): JSX.Element => {
    switch (delegateType) {
      case DelegateTypes.KUBERNETES_CLUSTER:
        return (
          <CreateK8sDelegate
            onSuccessHandler={onSuccessHandler}
            handleHelpPanel={isHelpPanelVisible}
            successRef={successRefHandler}
            delegateNameRef={delegateName}
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

  const { mutate: createInfrastructure } = useCreateInfrastructure({
    queryParams: {
      accountIdentifier: accountId
    }
  })
  const { onInitiate } = useCreateEditConnector<DelegateSelectorStepData>({
    accountId,
    isEditMode: false,
    isGitSyncEnabled: false,
    afterSuccessHandler: noop,
    skipGoveranceCheck: true
  })

  const handleSubmit = React.useCallback(
    async (yamlResponse?: RestResponseDelegateSetupDetails): Promise<void> => {
      const connectorIdentifier = getUniqueEntityIdentifier(newEnvironmentState.connector.name)
      const environmentIdentifier = getUniqueEntityIdentifier(ENV_ID)
      const infraIdentifier = getUniqueEntityIdentifier(INFRASTRUCTURE_ID)
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
        const response = await createEnvironment({ ...cleanEnvironmentData, orgIdentifier, projectIdentifier })
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
          // Infrastructure Creation
          createInfrastructure({
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
          setEnvironmentEntities({
            connector: newEnvironmentState.connector.name,
            delegate: delegateName.current as string,
            environment: ENV_ID,
            infrastructure: INFRASTRUCTURE_ID,
            namespace: NAMESPACE
          })

          const updatedContextDelegate = produce(newDelegateState.delegate, draft => {
            set(draft, 'delegateType', delegateType)
            set(draft, 'delegateInstalled', isDelegateInstalled)
            set(draft, 'environmentEntities.connector', newEnvironmentState.connector.name)
            set(draft, 'environmentEntities.delegate', delegateName.current as string)
            set(draft, 'environmentEntities.environment', ENV_ID)
            set(draft, 'environmentEntities.infrastructure', INFRASTRUCTURE_ID)
            set(draft, 'environmentEntities.namespace', NAMESPACE)
            set(draft, 'delegateYAMLResponse', yamlResponse)
          })

          saveInfrastructureData(updatedContextInfra)
          saveDelegateData(updatedContextDelegate)
          enableNextBtn()
          return Promise.resolve()
        } else {
          throw response
        }
      } catch (error: any) {
        showError(getRBACErrorMessage(error))
        return Promise.resolve()
      }
    },
    [
      clear,
      createEnvironment,
      createInfrastructure,
      delegateType,
      enableNextBtn,
      getRBACErrorMessage,
      isDelegateInstalled,
      onInitiate,
      orgIdentifier,
      projectIdentifier,
      saveDelegateData,
      saveEnvironmentData,
      saveInfrastructureData,
      serviceData,
      showError
    ]
  )

  const environmentEntitiesData = React.useMemo(() => {
    return (
      <Layout.Vertical padding={{ top: 'large' }}>
        <Text font={{ variation: FontVariation.H4, weight: 'semi-bold' }} padding={{ bottom: 'small' }}>
          {getString('cd.getStartedWithCD.environmentDetails')}
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

  const resetContextDelegateData = (type: string): void => {
    const updatedContextDelegate = produce(newDelegateState.delegate, draft => {
      set(draft, 'delegateType', type)
    })
    saveDelegateData(updatedContextDelegate)
  }

  const handleDelegateTypeChange = (type: string): void => {
    setDelegateType(type)
    setHelpPanelVisible(false)
    disableNextBtn()
    // reset context data and environmentEntities
    resetContextDelegateData(type)
    setEnvironmentEntities({})
    delegateName.current = undefined
  }

  return (
    <Layout.Vertical width={'100%'} margin={{ left: 'small' }}>
      <Layout.Horizontal>
        <Layout.Vertical width={'55%'}>
          <Container>
            <Text font={{ variation: FontVariation.H3, weight: 'semi-bold' }} data-tooltip-id="cdOnboardingEnvironment">
              {getString('cd.getStartedWithCD.configureEnvironment')}
              <HarnessDocTooltip tooltipId="cdOnboardingEnvironment" useStandAlone={true} />
            </Text>
            <div className={css.borderBottomClass} />
            <Text
              font={{ variation: FontVariation.H4, weight: 'semi-bold' }}
              className={css.marginBottomClass}
              data-tooltip-id="cdOnboardingInstallDelegate"
            >
              {getString('cd.runDelegate')}
              <HarnessDocTooltip tooltipId="cdOnboardingInstallDelegate" useStandAlone={true} />
            </Text>

            <Button
              onClick={() => handleDelegateTypeChange(DelegateTypes.KUBERNETES_CLUSTER)}
              className={cx(css.kubernetes, delegateType === DelegateTypes.KUBERNETES_CLUSTER ? css.active : undefined)}
            >
              {getString('kubernetesText')}
            </Button>
            <Button
              onClick={() => {
                handleDelegateTypeChange(DelegateTypes.DOCKER)
              }}
              className={cx(css.docker, delegateType === DelegateTypes.DOCKER ? css.active : undefined)}
            >
              {getString('delegate.cardData.docker.name')}
            </Button>
            <div className={css.marginTopClass} />
          </Container>
          <Layout.Vertical>
            <div className={css.marginTop} />
            {conditionalContent()}
          </Layout.Vertical>

          {delegateName?.current && !isEmpty(delegateData?.delegateType) && (
            <>
              <Text
                color={Color.PRIMARY_7}
                font={{ size: 'normal' }}
                padding={{ top: 'medium', bottom: 'medium' }}
                onClick={() => setShowDelegateOverview(!showDelegateOverview)}
                icon={showDelegateOverview ? 'minus' : 'plus'}
                iconProps={{ color: Color.PRIMARY_7 }}
                className={css.cursor}
              >
                {showDelegateOverview
                  ? getString('cd.getStartedWithCD.hideDelegateDetails')
                  : getString('cd.getStartedWithCD.viewDelegateDetails')}
              </Text>
              {showDelegateOverview && delegateName?.current && (
                <Layout.Vertical padding={{ bottom: 'xlarge', right: 'large' }}>
                  <DelegateDetailsCard
                    delegateIdentifier={delegateName.current || (delegateData?.environmentEntities?.delegate as string)}
                  />
                </Layout.Vertical>
              )}
              <Container className={css.borderBottomClass} style={{ width: '55%' }} />
              {!isEmpty(environmentEntities?.connector) && !isDelegateInstalled ? environmentEntitiesData : null}
            </>
          )}
        </Layout.Vertical>
        {helpPanelVisible && (
          <Layout.Vertical width={'45%'} padding={'large'} background={Color.PRIMARY_1} flex={{ alignItems: 'center' }}>
            <div className={css.tabs}>
              <Text font={{ variation: FontVariation.H4, weight: 'semi-bold' }} className={css.marginBottomClass}>
                {getString('cd.instructionsCluster')}
              </Text>
              <Tabs
                id={'horizontalTabs'}
                defaultSelectedTabId={'googleK8sService'}
                tabList={[
                  { id: 'googleK8sService', title: getString('cd.googleK8sService'), panel: <GoogleK8sService /> },
                  {
                    id: 'amazonElasticK8sService',
                    title: getString('cd.amazonElasticK8sService'),
                    panel: <AmazonElasticK8sService />
                  },
                  { id: 'azureK8sService', title: getString('cd.azureK8sService'), panel: <AzureK8sService /> },
                  { id: 'minikube', title: getString('cd.minikube'), panel: <Minikube /> }
                ]}
              />
            </div>
          </Layout.Vertical>
        )}
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}
