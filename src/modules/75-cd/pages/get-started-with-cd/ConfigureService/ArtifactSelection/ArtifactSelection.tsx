/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get, isEmpty, unset } from 'lodash-es'
import cx from 'classnames'
import { IconName, Intent } from '@blueprintjs/core'
import { Button, Container, HarnessDocTooltip, Icon, Layout, Text } from '@harness/uicore'
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
import type { StringsMap } from 'stringTypes'
import { useCDOnboardingContext } from '../../CDOnboardingStore'

import type { ConfigureServiceInterface } from '../ConfigureService'
import {
  allowedArtifactTypesForOnboarding,
  ArtifactIconByType,
  BinaryValue,
  ServiceDataType,
  CustomType,
  DeploymentType
} from '../../CDOnboardingUtils'
import ArtifactoryAuthStep from './ArtifactAuthStep'
import { StepStatus } from '../../DeployProvisioningWizard/Constants'
import ArtifactImagePath from './ArtifactImagePath'
import SampleArtifact from './SampleArtifact'
import css from '../../DeployProvisioningWizard/DeployProvisioningWizard.module.scss'
import moduleCss from '../ConfigureService.module.scss'

interface ArtifactSelectionProps {
  isStepComplete: React.Dispatch<React.SetStateAction<boolean>>
}

const DefaultArtifactStepStatus = new Map<string, StepStatus>([
  ['Authentication', StepStatus.InProgress],
  ['ImagePath', StepStatus.ToDo]
])

export const ArtifactOptions = [
  { label: 'yes', value: BinaryValue.YES },
  { label: 'cd.getStartedWithCD.artifactInManifest', value: BinaryValue.NO },
  { label: 'cd.getStartedWithCD.giveSample', value: CustomType.Custom }
]

const ArtifactSelection = ({ isStepComplete }: ArtifactSelectionProps): JSX.Element => {
  const {
    state: { service: serviceData },
    saveServiceData
  } = useCDOnboardingContext()
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const { values, setFieldValue } = useFormikContext<ConfigureServiceInterface>()
  const [artifactStepStatus, setArtifactStepStatus] = React.useState<Map<string, StepStatus>>(DefaultArtifactStepStatus)
  const [selectedArtifact, setSelectedArtifact] = React.useState<ArtifactType | CustomType>(
    values?.artifactType || CustomType.Custom
  )

  const serviceDefinitionType =
    (get(serviceData, 'serviceDefinition.type') as ServiceDefinition['type']) || 'Kubernetes'
  const artifactTypes = allowedArtifactTypesForOnboarding[serviceDefinitionType]
  const supportedArtifactTypes = React.useMemo(
    () =>
      (artifactTypes || [])?.map(artifact => ({
        label: getString(ArtifactTitleIdByType[artifact]),
        icon: ArtifactIconByType[artifact] as IconName,
        value: artifact
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
    trackEvent(CDOnboardingActions.SelectArtifactType, {
      artifactType: selectedArtifact,
      deployment_type: DeploymentType.K8s
    })

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArtifact])

  React.useEffect(() => {
    values?.artifactType && setSelectedArtifact(values?.artifactType)
  }, [values])

  React.useEffect(() => {
    if (values?.artifactToDeploy === BinaryValue.YES) {
      isStepComplete(artifactStepStatus.get('ImagePath') !== StepStatus.ToDo)
    } else {
      isStepComplete(true)
    }
    if (selectedArtifact === CustomType.Custom) {
      isStepComplete(true)
    }
  }, [isStepComplete, values?.artifactToDeploy, artifactStepStatus, selectedArtifact])

  return (
    <>
      {/* ARTIFACT HEADERS */}
      <Layout.Vertical padding={{ top: 'xxlarge' }}>
        <Text
          font={{ variation: FontVariation.H4 }}
          color={Color.GREY_600}
          data-tooltip-id="cdOnboardingSelectArtifactRepo"
        >
          {getString('pipeline.artifactTriggerConfigPanel.artifact')}
          <HarnessDocTooltip tooltipId="cdOnboardingSelectArtifactRepo" useStandAlone={true} />
        </Text>
        <Text font="normal" padding={{ top: 'medium', bottom: 'xxlarge' }}>
          {getString('cd.getStartedWithCD.artifactDescription')}
        </Text>
      </Layout.Vertical>

      {/* ARTIFACT SELECTION */}
      {values?.manifestStoreType !== ManifestStoreMap.Harness && (
        <Layout.Vertical padding={{ top: 'xsmall', bottom: 'medium' }}>
          <Text font={{ variation: FontVariation.H4 }} padding={{ bottom: 'large' }} color={Color.GREY_600}>
            {getString('cd.getStartedWithCD.artifactToDeploy')}
          </Text>
          <Layout.Horizontal>
            {ArtifactOptions.map(option => {
              return (
                <Button
                  key={option.value}
                  className={cx(css.buttonWrapper, css.radioButton)}
                  text={getString(option.label as keyof StringsMap)}
                  onClick={_e => {
                    isStepComplete(option.value !== BinaryValue.YES)
                    setFieldValue('artifactToDeploy', option.value)
                  }}
                  intent={values?.artifactToDeploy === option.value ? Intent.PRIMARY : Intent.NONE}
                  round
                  inline
                />
              )
            })}
          </Layout.Horizontal>
        </Layout.Vertical>
      )}
      {values?.artifactToDeploy === BinaryValue.YES ? (
        <>
          {/* ARTIFACT TYPE SELECTION */}
          <Layout.Vertical padding={{ bottom: 'medium' }}>
            <Text font={{ size: 'medium', weight: 'semi-bold' }} padding={{ bottom: 'large' }} color={Color.GREY_600}>
              {getString('cd.azureArm.location')}
            </Text>
            <Layout.Horizontal>
              {values?.manifestStoreType === ManifestStoreMap.Harness && (
                <>
                  <Button
                    className={css.authMethodBtn}
                    round
                    text={getString('cd.getStartedWithCD.sampleAppOnDockerRegistry')}
                    onClick={() => {
                      setSelectedArtifact(CustomType.Custom)
                    }}
                    padding="large"
                    intent={values?.artifactType === CustomType.Custom ? Intent.PRIMARY : Intent.NONE}
                  />

                  <Container className={css.verticalSeparation} margin={{ left: 'medium' }} />
                  <Text
                    font={{ variation: FontVariation.BODY2 }}
                    color={Color.GREY_500}
                    className={moduleCss.manifestLabel}
                  >
                    {getString('cd.getStartedWithCD.connectOwnArtifact')}
                  </Text>
                </>
              )}
              {supportedArtifactTypes.map(option => {
                return (
                  <Button
                    key={option.label}
                    className={cx(css.buttonWrapper, css.radioButton)}
                    text={option.label}
                    onClick={_e => {
                      setSelectedArtifact(option.value)
                    }}
                    intent={values?.artifactType === option.value ? Intent.PRIMARY : Intent.NONE}
                    margin={{ bottom: 'small' }}
                    round
                    inline
                  />
                )
              })}
            </Layout.Horizontal>
          </Layout.Vertical>
          {!isEmpty(values?.artifactType) && (
            <Container padding="large" className={moduleCss.connectorContainer}>
              <Layout.Vertical margin={{ top: 'large', bottom: 'large' }}>
                {selectedArtifact === CustomType.Custom ? (
                  <SampleArtifact />
                ) : (
                  <>
                    <Layout.Horizontal margin={{ bottom: 'large', top: 'large' }}>
                      <Icon name={ArtifactIconByType[selectedArtifact as ArtifactType]} size={28} flex />
                      <Text font={{ variation: FontVariation.H5 }} padding={{ left: 'large' }}>
                        {getString('cd.getStartedWithCD.connectTo', {
                          entity: getString(ArtifactTitleIdByType[selectedArtifact as ArtifactType])
                        })}
                      </Text>
                    </Layout.Horizontal>
                    <ul className={moduleCss.progress}>
                      <li className={`${moduleCss.progressItem} ${moduleCss.progressItemActive}`}>
                        <Text font={{ variation: FontVariation.H5 }} padding={{ left: 'small', bottom: 'small' }}>
                          {values?.artifactType === ENABLED_ARTIFACT_TYPES.DockerRegistry
                            ? getString('cd.getStartedWithCD.registryDetails')
                            : getString('cd.getStartedWithCD.repoDetails')}
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
                          selectedArtifact={selectedArtifact as ArtifactType}
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
                  </>
                )}
              </Layout.Vertical>
            </Container>
          )}
        </>
      ) : (
        <Container padding="large" className={moduleCss.connectorContainer}>
          <Layout.Vertical margin={{ top: 'large', bottom: 'large' }}>
            {values?.artifactToDeploy === BinaryValue.NO ? (
              <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} padding={{ bottom: 'large', left: 'xlarge' }}>
                <Icon name={'coverage-status-success'} size={24} padding={{ right: 'medium' }} />
                <Text font={{ size: 'medium', variation: FontVariation.BODY2 }}>
                  {getString('cd.getStartedWithCD.artifactReferencedInManifest')}
                </Text>
              </Layout.Horizontal>
            ) : (
              <SampleArtifact />
            )}
          </Layout.Vertical>
        </Container>
      )}
    </>
  )
}

export default ArtifactSelection
