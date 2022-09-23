/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useEffect, useState } from 'react'
import {
  Button,
  ButtonVariation,
  getErrorInfoFromErrorObject,
  Layout,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  StepProps,
  StepsProgress,
  Text,
  useConfirmationDialog
} from '@harness/uicore'
import { FontVariation, Color, Intent } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'

import { useStrings } from 'framework/strings'
import {
  ConnectorInfoDTO,
  ResponseConnectorValidationResult,
  useCreateConnector,
  useDeleteConnector,
  useGetTestConnectionResult
} from 'services/cd-ng'
import type { StepDetails } from '@connectors/interfaces/ConnectorInterface'
import { DialogExtensionContext } from '@connectors/common/ConnectorExtention/DialogExtention'
import { Connectors } from '@connectors/constants'
import { useMutateAsGet } from '@common/hooks'
import { useCloudCostK8sClusterSetup } from 'services/ce'
import PermissionYAMLPreview from '@connectors/components/CreateConnector/CEK8sConnector/PermissionYAMLPreview'
import CopyCodeSection from '@connectors/components/CreateConnector/CEK8sConnector/components/CopyCodeSection'
import { downloadYamlAsFile } from '@common/utils/downloadYamlUtils'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { CE_K8S_CONNECTOR_CREATION_EVENTS } from '@connectors/trackingConstants'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacButton from '@rbac/components/Button/Button'
import CostReportingPopover from '../popovers/CostReportingPopover'

import css from '../CloudVisibilityModal.module.scss'

interface Props {
  name: string
  isEditMode?: boolean
  connector: ConnectorInfoDTO
  closeModal: () => void
}

const Step1: React.FC<{ onRetry: () => void; stepFailed: boolean }> = ({ onRetry, stepFailed }) => {
  const { getString } = useStrings()

  return (
    <Layout.Horizontal style={{ alignItems: 'center' }} spacing={'small'}>
      <Text color={Color.GREY_800} font={{ variation: FontVariation.BODY2 }}>
        {getString('ce.cloudIntegration.costVisibilityDialog.step1.step1')}
      </Text>
      {stepFailed ? (
        <Button icon={'repeat'} variation={ButtonVariation.SECONDARY} text={getString('retry')} onClick={onRetry} />
      ) : null}
    </Layout.Horizontal>
  )
}

const yamlFileName = 'ccm-kubernetes.yaml'

const EnableCostVisibilityStep: React.FC<Props & StepProps<ConnectorInfoDTO>> = props => {
  const { closeModal, connector, gotoStep, isEditMode } = props
  const { trackEvent } = useTelemetry()

  const { accountId } = useParams<{ accountId: string }>()
  const { getString } = useStrings()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const [ccmConnector, setCCMConnector] = useState<ConnectorInfoDTO | undefined>(isEditMode ? connector : undefined)
  const { triggerExtension } = useContext(DialogExtensionContext)

  const [stepDetails, setStepDetails] = useState<StepDetails>({
    step: 1,
    intent: Intent.WARNING,
    status: 'PROCESS'
  })
  const [testConnectionRes, setTestConnectionRes] = useState<ResponseConnectorValidationResult>()

  const { mutate: createConnector } = useCreateConnector({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { mutate: testConnection, loading } = useGetTestConnectionResult({
    identifier: defaultTo(ccmConnector?.identifier, `${connector?.identifier}Costaccess`),
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { mutate: deleteConnector } = useDeleteConnector({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { data: permissionsYaml, loading: yamlLoading } = useMutateAsGet(useCloudCostK8sClusterSetup, {
    queryParams: {
      accountIdentifier: accountId
    },
    body: {
      connectorIdentifier: defaultTo(connector?.spec?.connectorRef, ''),
      featuresEnabled: ccmConnector?.spec?.featuresEnabled,
      ccmConnectorIdentifier: defaultTo(ccmConnector?.identifier, '')
    },
    lazy: !ccmConnector?.identifier || !testConnectionRes || testConnectionRes?.status === 'SUCCESS'
  })

  const handleDownload = /* istanbul ignore next */ async (): Promise<void> => {
    trackEvent(CE_K8S_CONNECTOR_CREATION_EVENTS.DOWNLOAD_YAML, {})
    await downloadYamlAsFile(permissionsYaml, yamlFileName)
  }

  const saveConnector = async (): Promise<void> => {
    try {
      const res = await createConnector({
        connector: {
          ...connector,
          name: `${connector.name}-Cost-access`,
          identifier: `${connector.identifier}Costaccess`,
          spec: {
            ...connector.spec,
            connectorRef: connector.identifier,
            featuresEnabled: ['VISIBILITY']
          },
          type: Connectors.CE_KUBERNETES
        }
      })

      setCCMConnector(res.data?.connector)
    } catch (error) {
      modalErrorHandler?.showDanger(getErrorInfoFromErrorObject(error))
    }
  }

  const verifyCcmK8sConnector = async (): Promise<void> => {
    setStepDetails({
      step: 1,
      intent: Intent.WARNING,
      status: 'PROCESS'
    })

    try {
      const result = await testConnection()
      setTestConnectionRes(result)
      if (result?.data?.status === 'SUCCESS') {
        setStepDetails({ step: 1, intent: Intent.SUCCESS, status: 'DONE' })
      } else {
        setStepDetails({ step: 1, intent: Intent.DANGER, status: 'ERROR' })
      }
    } catch (err) {
      setTestConnectionRes({ data: { errorSummary: getErrorInfoFromErrorObject(err) } })
      setStepDetails({ step: 1, intent: Intent.DANGER, status: 'ERROR' })
    }
  }

  const createAndVerifyCcmK8sConnector = async (): Promise<void> => {
    if (!isEditMode) {
      await saveConnector()
    }

    await verifyCcmK8sConnector()
  }

  const { openDialog } = useConfirmationDialog({
    titleText: getString('ce.cloudIntegration.disbaleReportingDialog.header'),
    contentText: getString('ce.cloudIntegration.disbaleReportingDialog.desc', { name: ccmConnector?.name }),
    confirmButtonText: getString('common.disable'),
    cancelButtonText: getString('common.ignore'),
    onCloseDialog: async isConfirmed => {
      if (isConfirmed) {
        await deleteConnector(ccmConnector?.identifier || '')
        closeModal()
      }
    },
    buttonIntent: Intent.DANGER,
    intent: Intent.DANGER
  })

  useEffect(() => {
    createAndVerifyCcmK8sConnector()
  }, [])

  const isAutoStoppingEnabled = ccmConnector?.spec?.featuresEnabled?.includes('OPTIMIZATION')

  return (
    <>
      <Layout.Vertical height={'100%'} spacing={'xlarge'}>
        <ModalErrorHandler bind={setModalErrorHandler} />
        <Layout.Horizontal spacing={'xsmall'} style={{ alignItems: 'center' }}>
          <Text font={{ variation: FontVariation.H3 }} color={Color.GREY_800}>
            {getString('ce.cloudIntegration.costVisibilityDialog.step1.title')}
          </Text>
          <CostReportingPopover />
        </Layout.Horizontal>
        <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_700}>
          {getString('ce.cloudIntegration.costVisibilityDialog.step1.desc', { connectorName: connector.name })}
        </Text>
        <div className={css.steps}>
          <StepsProgress
            steps={[<Step1 key={1} stepFailed={stepDetails.status === 'ERROR'} onRetry={verifyCcmK8sConnector} />]}
            intent={stepDetails.intent}
            current={stepDetails.step}
            currentStatus={stepDetails.status}
          />
          {stepDetails.status === 'ERROR' ? (
            <div className={css.errorContainer}>
              <Text font={{ variation: FontVariation.BODY }} color={Color.RED_800} margin={{ bottom: 'medium' }}>
                {testConnectionRes?.data?.errorSummary}{' '}
                {getString('ce.cloudIntegration.costVisibilityDialog.step1.permissionsError')}
              </Text>
              <div className={css.stepContainer}>
                <Text className={css.stepLabel}>{`${getString('step')} 1`}</Text>
                <Layout.Horizontal spacing={'small'} style={{ alignItems: 'center' }}>
                  <Text color={Color.GREY_900} margin={{ right: 'medium' }}>
                    {getString('ce.cloudIntegration.autoStoppingModal.installComponents.step1')}
                  </Text>
                  <Button
                    disabled={yamlLoading}
                    rightIcon="launch"
                    variation={ButtonVariation.SECONDARY}
                    text={getString('connectors.ceK8.providePermissionsStep.downloadYamlBtnText')}
                    onClick={handleDownload}
                  />
                  <Button
                    disabled={yamlLoading}
                    rightIcon="launch"
                    variation={ButtonVariation.LINK}
                    text={getString('ce.cloudIntegration.autoStoppingModal.installComponents.previewYaml')}
                    onClick={() =>
                      triggerExtension(<PermissionYAMLPreview yamlContent={permissionsYaml as unknown as string} />)
                    }
                  />
                </Layout.Horizontal>
              </div>
              <div className={css.stepContainer}>
                <Text className={css.stepLabel}>{`${getString('step')} 2`}</Text>
                <Text color={Color.GREY_900}>
                  {getString('ce.cloudIntegration.autoStoppingModal.installComponents.step2')}
                </Text>
              </div>
              <div className={css.copyCodeSection}>
                <CopyCodeSection snippet={`kubectl apply -f ${yamlFileName}`} />
              </div>
            </div>
          ) : null}
        </div>
        <div>
          <Button
            text={getString('finish')}
            variation={ButtonVariation.SECONDARY}
            margin={{ right: 'medium' }}
            onClick={closeModal}
          />
          <Button
            rightIcon="chevron-right"
            text={getString(
              isAutoStoppingEnabled
                ? 'ce.cloudIntegration.manageAutoStopping'
                : 'ce.cloudIntegration.enableAutoStopping'
            )}
            variation={ButtonVariation.PRIMARY}
            onClick={() => {
              gotoStep?.({ stepNumber: 3, prevStepData: ccmConnector })
            }}
            disabled={loading}
          />
          {isEditMode ? (
            <RbacButton
              text={getString('ce.cloudIntegration.disableReporting')}
              variation={ButtonVariation.SECONDARY}
              className={css.disable}
              permission={{
                permission: PermissionIdentifier.DELETE_CONNECTOR,
                resource: {
                  resourceType: ResourceType.CONNECTOR,
                  resourceIdentifier: ccmConnector?.identifier
                }
              }}
              onClick={openDialog}
            />
          ) : null}
        </div>
      </Layout.Vertical>
    </>
  )
}

export default EnableCostVisibilityStep
