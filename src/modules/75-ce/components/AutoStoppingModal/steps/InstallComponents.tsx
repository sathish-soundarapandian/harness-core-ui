/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useMemo, useState } from 'react'
import {
  Button,
  ButtonVariation,
  getErrorInfoFromErrorObject,
  Layout,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  StepProps,
  Text
} from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'

import { useStepLoadTelemetry } from '@connectors/common/useTrackStepLoad/useStepLoadTelemetry'
import { CE_K8S_CONNECTOR_CREATION_EVENTS } from '@connectors/trackingConstants'
import { downloadYamlAsFile } from '@common/utils/downloadYamlUtils'
import { useTelemetry } from '@common/hooks/useTelemetry'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { DialogExtensionContext } from '@connectors/common/ConnectorExtention/DialogExtention'
import EnableAutoStoppingHeader from '@ce/components/CloudVisibilityModal/steps/EnableAutoStoppingStep'

import { ConnectorInfoDTO, useUpdateConnector } from 'services/cd-ng'
import { useMutateAsGet } from '@common/hooks'
import { useCloudCostK8sClusterSetup } from 'services/ce'
import PermissionYAMLPreview from '@connectors/components/CreateConnector/CEK8sConnector/PermissionYAMLPreview'
import CopyCodeSection from '@connectors/components/CreateConnector/CEK8sConnector/components/CopyCodeSection'

import css from '../AutoStoppingModal.module.scss'

interface InstallComponentsProps {
  name: string
  isCloudReportingModal?: boolean
  closeModal: () => void
  isEditMode?: boolean
}

const yamlFileName = 'ccm-kubernetes.yaml'

const InstallComponents: React.FC<StepProps<ConnectorInfoDTO> & InstallComponentsProps> = ({
  previousStep,
  prevStepData,
  closeModal,
  isCloudReportingModal,
  isEditMode
}) => {
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const { triggerExtension } = useContext(DialogExtensionContext)
  const { accountId } = useParams<AccountPathProps>()

  useStepLoadTelemetry(CE_K8S_CONNECTOR_CREATION_EVENTS.LOAD_SECRET_CREATION)

  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const [ccmConnector, setCCMConnector] = useState<ConnectorInfoDTO | undefined>(prevStepData)

  const { data: permissionsYaml, loading: yamlLoading } = useMutateAsGet(useCloudCostK8sClusterSetup, {
    queryParams: {
      accountIdentifier: accountId
    },
    body: {
      connectorIdentifier: ccmConnector?.spec?.connectorRef,
      featuresEnabled: ['VISIBILITY', 'OPTIMIZATION'],
      ccmConnectorIdentifier: ccmConnector?.identifier
    }
  })

  const { mutate: updateConnector } = useUpdateConnector({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const enableAutoStopping = async (): Promise<void> => {
    try {
      if (ccmConnector) {
        const res = await updateConnector({
          connector: {
            ...ccmConnector,
            spec: {
              ...ccmConnector.spec,
              featuresEnabled: ['VISIBILITY', 'OPTIMIZATION']
            }
          }
        })

        setCCMConnector(res.data?.connector)
      }
    } catch (error) {
      /* istanbul ignore next */
      modalErrorHandler?.showDanger(getErrorInfoFromErrorObject(error))
    }
  }

  const disableAutoStopping = async (): Promise<void> => {
    try {
      if (ccmConnector) {
        const res = await updateConnector({
          connector: {
            ...ccmConnector,
            spec: {
              ...ccmConnector.spec,
              featuresEnabled: ['VISIBILITY']
            }
          }
        })

        setCCMConnector(res.data?.connector)
      }
    } catch (error) {
      /* istanbul ignore next */
      modalErrorHandler?.showDanger(getErrorInfoFromErrorObject(error))
    }
  }

  const handleDownload = async (): Promise<void> => {
    trackEvent(CE_K8S_CONNECTOR_CREATION_EVENTS.DOWNLOAD_YAML, {})
    await downloadYamlAsFile(permissionsYaml, yamlFileName)
  }

  const infoSteps = useMemo(
    () => [
      getString('connectors.ceK8.providePermissionsStep.fileDescription.info1'),
      getString('connectors.ceK8.providePermissionsStep.fileDescription.info2'),
      getString('connectors.ceK8.providePermissionsStep.fileDescription.info3'),
      getString('connectors.ceK8.providePermissionsStep.fileDescription.info4')
    ],
    []
  )

  return (
    <Layout.Vertical height={'100%'} spacing={'medium'}>
      <ModalErrorHandler bind={setModalErrorHandler} />
      {isCloudReportingModal ? <EnableAutoStoppingHeader /> : null}
      <Text font={{ variation: FontVariation.H4 }} color={Color.GREY_800}>
        {getString('ce.cloudIntegration.autoStoppingModal.installComponents.title')}
      </Text>
      <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
        {getString('ce.cloudIntegration.autoStoppingModal.installComponents.desc')}
      </Text>
      {infoSteps.map((step, index) => (
        <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600} key={step}>
          {`${index + 1}. ${step}`}
        </Text>
      ))}
      <div className={cx(css.steps, css.marginTop)}>
        <div className={css.stepContainer}>
          <Text className={css.stepLabel}>{`${getString('step')} 1`}</Text>
          <div className={css.step1}>
            <Text color={Color.GREY_900} margin={{ right: 'xlarge' }}>
              {getString('ce.cloudIntegration.autoStoppingModal.installComponents.step1')}
            </Text>
            <Button
              disabled={yamlLoading}
              rightIcon="launch"
              variation={ButtonVariation.SECONDARY}
              margin={{ right: 'medium' }}
              text={getString('connectors.ceK8.providePermissionsStep.downloadYamlBtnText')}
              onClick={handleDownload}
            />
            <Button
              disabled={yamlLoading}
              rightIcon="launch"
              variation={ButtonVariation.SECONDARY}
              text={getString('ce.cloudIntegration.autoStoppingModal.installComponents.previewYaml')}
              onClick={() =>
                triggerExtension(<PermissionYAMLPreview yamlContent={permissionsYaml as unknown as string} />)
              }
            />
          </div>
        </div>
        <div className={css.stepContainer}>
          <Text className={css.stepLabel}>{`${getString('step')} 2`}</Text>
          <Text color={Color.GREY_900}>
            {getString('ce.cloudIntegration.autoStoppingModal.installComponents.step2')}
          </Text>
        </div>
        <div className={css.copyCodeSection}>
          <CopyCodeSection snippet={'kubectl apply -f ccm-kubernetes.yaml'} />
        </div>
      </div>
      <div>
        <Button
          icon="chevron-left"
          text={getString('back')}
          variation={ButtonVariation.SECONDARY}
          margin={{ right: 'medium' }}
          onClick={/* istanbul ignore next */ () => previousStep?.(ccmConnector)}
        />
        <Button
          rightIcon="chevron-right"
          text={getString('finish')}
          variation={ButtonVariation.PRIMARY}
          onClick={async () => {
            await enableAutoStopping()
            closeModal()
          }}
        />
        {isEditMode && ccmConnector?.spec?.featuresEnabled?.includes('OPTIMIZATION') ? (
          <Button
            text={getString('ce.cloudIntegration.disableAutoStopping')}
            variation={ButtonVariation.SECONDARY}
            className={css.disable}
            onClick={async () => {
              await disableAutoStopping()
              closeModal()
            }}
          />
        ) : null}
      </div>
    </Layout.Vertical>
  )
}

export default InstallComponents
