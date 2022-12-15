/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { capitalize, get, isEmpty, unset } from 'lodash-es'
import type { IconName } from '@blueprintjs/core'
import { Container, Icon, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useFormikContext } from 'formik'
import produce from 'immer'
import { ArtifactTitleIdByType, ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { useStrings } from 'framework/strings'
import type { ServiceDefinition } from 'services/cd-ng'
import type { ArtifactType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { CDOnboardingActions } from '@common/constants/TrackingConstants'
import { ManifestStoreMap } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { useCDOnboardingContext } from '../../CDOnboardingStore'

import type { ConfigureServiceInterface } from '../ConfigureService'
import {
  allowedArtifactTypesForOnboiarding,
  ArtifactIconByType,
  BinaryLabels,
  BinaryOptions,
  ServiceDataType
} from '../../CDOnboardingUtils'
import ArtifactoryAuthStep from './ArtifactoryAuthStep'
import { StepStatus } from '../../DeployProvisioningWizard/Constants'
import ArtifactImagePath from './ArtifactImagePath'
import ButtonWrapper from '../../ButtonWrapper/ButtonWrapper'
import css from '../../DeployProvisioningWizard/DeployProvisioningWizard.module.scss'
import moduleCss from '../ConfigureService.module.scss'

interface ArtifactSelectionProps {
  disableNextBtn: () => void
  enableNextBtn: () => void
}

const DefaultArtifactStepStatus = new Map<string, StepStatus>([
  ['Authentication', StepStatus.InProgress],
  ['ImagePath', StepStatus.ToDo]
])

const ArtifactSelection = ({ enableNextBtn, disableNextBtn }: ArtifactSelectionProps): JSX.Element => {
  const {
    state: { service: serviceData },
    saveServiceData
  } = useCDOnboardingContext()
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const { values, setFieldValue } = useFormikContext<ConfigureServiceInterface>()
  const [artifactStepStatus, setArtifactStepStatus] = React.useState<Map<string, StepStatus>>(DefaultArtifactStepStatus)
  const [selectedArtifact, setSelectedArtifact] = React.useState<ArtifactType>(
    values?.artifactType || ENABLED_ARTIFACT_TYPES.DockerRegistry
  )

  const serviceDefinitionType =
    (get(serviceData, 'serviceDefinition.type') as ServiceDefinition['type']) || 'Kubernetes'
  const artifactTypes = allowedArtifactTypesForOnboiarding[serviceDefinitionType]
  const supportedArtifactTypes = React.useMemo(
    () =>
      (artifactTypes || [])?.map(artifact => ({
        label: getString(ArtifactTitleIdByType[artifact]),
        icon: ArtifactIconByType[artifact] as IconName,
        value: artifact,
        disabled: ![ENABLED_ARTIFACT_TYPES.DockerRegistry, ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry].includes(
          artifact
        )
      })),
    [artifactTypes, getString]
  )

  React.useEffect(() => {
    if (selectedArtifact) {
      setFieldValue('artifactType', selectedArtifact)
      setFieldValue('artifactData', {})
    }
    // reset existing artifact Data
    if (selectedArtifact !== serviceData?.data?.artifactType) {
      const updatedContextService = produce(serviceData as ServiceDataType, draft => {
        if (draft) unset(draft, 'data.artifactData')
      })

      saveServiceData(updatedContextService)
    }
    trackEvent(CDOnboardingActions.SelectArtifactType, { artifactType: selectedArtifact })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArtifact])

  React.useEffect(() => {
    if (values?.artifactToDeploy === BinaryLabels.NO) {
      enableNextBtn()
      return
    }
    artifactStepStatus.get('ImagePath') !== StepStatus.ToDo ? enableNextBtn() : disableNextBtn()
  }, [artifactStepStatus, disableNextBtn, enableNextBtn, values])

  return (
    <>
      {/* ARTIFACT SELECTION */}
      {values?.manifestStoreType !== ManifestStoreMap.Harness && (
        <>
          <Layout.Vertical padding={{ top: 'xxlarge' }}>
            <Text font={{ variation: FontVariation.H4 }} padding={{ bottom: 'large' }} color={Color.GREY_600}>
              {getString('cd.getStartedWithCD.artifactToDeploy')}
            </Text>
            <Layout.Horizontal>
              {BinaryOptions.map(option => {
                return (
                  <ButtonWrapper
                    key={option.label}
                    option={option}
                    label={capitalize(option.label)}
                    onClick={(value: string) => {
                      setFieldValue('artifactToDeploy', value)
                    }}
                    intent={values?.artifactToDeploy === option.label ? 'primary' : 'none'}
                    margin={{ bottom: 'small' }}
                    className={css.radioButton}
                  />
                )
              })}
            </Layout.Horizontal>
          </Layout.Vertical>
          <Container className={css.borderBottomClass} padding={{ top: 'large' }} />
        </>
      )}
      {values?.artifactToDeploy === BinaryLabels.YES && (
        <>
          {/* ARTIFACT TYPE SELECTION */}
          <Layout.Vertical padding={{ top: 'xxlarge' }}>
            <Text font={{ variation: FontVariation.H4 }} padding={{ bottom: 'xxlarge' }} color={Color.GREY_600}>
              {getString('cd.getStartedWithCD.selectArtifactRepo')}
            </Text>
            <Layout.Horizontal>
              {supportedArtifactTypes.map(option => {
                return (
                  <ButtonWrapper
                    key={option.label}
                    option={option}
                    label={option.label}
                    onClick={(value: string) => {
                      setSelectedArtifact(value as ArtifactType)
                    }}
                    intent={values?.artifactType === option.value ? 'primary' : 'none'}
                    margin={{ bottom: 'small' }}
                    className={css.radioButton}
                  />
                )
              })}
            </Layout.Horizontal>
          </Layout.Vertical>
          <Container className={css.borderBottomClass} padding={{ top: 'large' }} />
          {!isEmpty(values?.artifactType) && (
            <Container padding="large" className={moduleCss.connectorContainer}>
              <Layout.Vertical margin={{ bottom: 'large' }}>
                <Layout.Horizontal margin={{ bottom: 'large', top: 'large' }}>
                  <Icon name={ArtifactIconByType[values?.artifactType as ArtifactType]} size={28} flex />
                  <Text font={{ variation: FontVariation.H5 }} padding={{ left: 'large' }}>
                    {`${getString('cd.getStartedWithCD.connectTo')} ${getString(
                      ArtifactTitleIdByType[values?.artifactType as ArtifactType]
                    )}`}
                  </Text>
                </Layout.Horizontal>
                <ul className={moduleCss.progress}>
                  <li className={`${moduleCss.progressItem} ${moduleCss.progressItemActive}`}>
                    <Text font={{ variation: FontVariation.H5 }} padding={{ left: 'small', bottom: 'small' }}>
                      {getString('cd.getStartedWithCD.selectAuthMethod')}
                    </Text>
                    <ArtifactoryAuthStep
                      onSuccess={status => {
                        setArtifactStepStatus(
                          new Map<string, StepStatus>([
                            ['Authentication', status],
                            ['ImagePath', status !== StepStatus.Success ? StepStatus.ToDo : StepStatus.InProgress]
                          ])
                        )
                      }}
                      selectedArtifact={selectedArtifact}
                    />
                  </li>

                  {artifactStepStatus.get('Authentication') === StepStatus.Success && (
                    <li className={`${moduleCss.progressItem} ${moduleCss.progressItemActive}`}>
                      <Text font={{ variation: FontVariation.H5 }} padding={{ left: 'small', bottom: 'small' }}>
                        {getString('pipeline.imagePathLabel')}
                      </Text>
                      <ArtifactImagePath />
                    </li>
                  )}
                </ul>
              </Layout.Vertical>
            </Container>
          )}
        </>
      )}
    </>
  )
}

export default ArtifactSelection
