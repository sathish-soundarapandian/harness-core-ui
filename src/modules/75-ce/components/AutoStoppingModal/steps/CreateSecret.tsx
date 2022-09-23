/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonVariation, Layout, StepProps, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'

import { useStepLoadTelemetry } from '@connectors/common/useTrackStepLoad/useStepLoadTelemetry'
import { CE_K8S_CONNECTOR_CREATION_EVENTS } from '@connectors/trackingConstants'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import CopyCodeSection from '@connectors/components/CreateConnector/CEK8sConnector/components/CopyCodeSection'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { ConnectorInfoDTO, useUpdateConnector } from 'services/cd-ng'
import EnableAutoStoppingHeader from '@ce/components/CloudVisibilityModal/steps/EnableAutoStoppingStep'

import css from '../AutoStoppingModal.module.scss'

interface CreateSecretProps {
  isCloudReportingModal?: boolean
  name: string
  connector?: ConnectorInfoDTO
  isEditMode?: boolean
  closeModal?: () => void
}

const CreateSecret: React.FC<StepProps<ConnectorInfoDTO> & CreateSecretProps> = ({
  gotoStep,
  prevStepData,
  connector,
  nextStep,
  isCloudReportingModal,
  isEditMode,
  closeModal
}) => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()

  useStepLoadTelemetry(CE_K8S_CONNECTOR_CREATION_EVENTS.LOAD_SECRET_CREATION)

  const ccmConnector = isCloudReportingModal ? prevStepData : connector

  const secretYaml = yamlStringify({
    apiVersion: 'v1',
    data: {
      token: '<*paste token here*>'
    },
    kind: 'Secret',
    metadata: {
      name: 'harness-api-key',
      namespace: 'harness-autostopping'
    }
  })

  const { mutate: updateConnector } = useUpdateConnector({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const disableAutoStopping = async (): Promise<void> => {
    if (ccmConnector) {
      await updateConnector({
        connector: {
          ...ccmConnector,
          spec: {
            ...ccmConnector.spec,
            featuresEnabled: ['VISIBILITY']
          }
        }
      })
    }
  }

  return (
    <Layout.Vertical height={'100%'} spacing={'medium'}>
      {isCloudReportingModal ? <EnableAutoStoppingHeader /> : null}
      <Text font={{ variation: FontVariation.H4 }} color={Color.GREY_800}>
        {getString('secrets.createSecret')}
      </Text>
      <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
        {getString('ce.cloudIntegration.autoStoppingModal.createSecret.desc')}
      </Text>
      <div className={css.steps}>
        <div className={css.stepContainer}>
          <Text className={css.stepLabel}>{`${getString('step')} 1`}</Text>
          <div className={css.step1}>
            <Text color={Color.GREY_900} margin={{ right: 'medium' }}>
              {getString('ce.cloudIntegration.autoStoppingModal.createSecret.step1')}
            </Text>
            <Button
              rightIcon="launch"
              variation={ButtonVariation.SECONDARY}
              text={getString('ce.cloudIntegration.autoStoppingModal.createSecret.createKey')}
              onClick={() => {
                window.open(`${window.location.origin}/#/account/${accountId}/access-management/api-keys`, '_blank')
              }}
            />
          </div>
        </div>
        <div className={css.stepContainer}>
          <Text className={css.stepLabel}>{`${getString('step')} 2`}</Text>
          <Text color={Color.GREY_900}>{getString('connectors.ceK8.secretCreationStep.step2')}</Text>
        </div>
        <div className={css.copyCodeSection}>
          <CopyCodeSection snippet={getString('connectors.ceK8.secretCreationStep.namespaceCommand')} />
        </div>
        <div className={css.stepContainer}>
          <Text className={css.stepLabel}>{`${getString('step')} 3`}</Text>
          <Text color={Color.GREY_900}>{getString('connectors.ceK8.secretCreationStep.step3')}</Text>
        </div>
        <div className={css.copyCodeSection}>
          <CopyCodeSection snippet={secretYaml} />
        </div>
        <div className={css.stepContainer}>
          <Text className={css.stepLabel}>{`${getString('step')} 4`}</Text>
          <Text color={Color.GREY_900}>{getString('connectors.ceK8.secretCreationStep.step4')}</Text>
        </div>
        <div className={css.copyCodeSection}>
          <CopyCodeSection snippet={getString('connectors.ceK8.secretCreationStep.creationCommand')} />
        </div>
      </div>
      <div>
        {isCloudReportingModal ? (
          <Button
            icon="chevron-left"
            text={getString('back')}
            variation={ButtonVariation.SECONDARY}
            margin={{ right: 'medium' }}
            onClick={
              /* istanbul ignore next */ () => {
                gotoStep?.({ stepNumber: 1 })
              }
            }
          />
        ) : null}
        <Button
          rightIcon="chevron-right"
          text={getString('continue')}
          variation={ButtonVariation.PRIMARY}
          onClick={() => nextStep?.(ccmConnector)}
        />
        {isEditMode && ccmConnector?.spec?.featuresEnabled?.includes('OPTIMIZATION') ? (
          <Button
            text={getString('ce.cloudIntegration.disableAutoStopping')}
            variation={ButtonVariation.SECONDARY}
            className={css.disable}
            onClick={async () => {
              await disableAutoStopping()
              closeModal?.()
            }}
          />
        ) : null}
      </div>
    </Layout.Vertical>
  )
}

export default CreateSecret
