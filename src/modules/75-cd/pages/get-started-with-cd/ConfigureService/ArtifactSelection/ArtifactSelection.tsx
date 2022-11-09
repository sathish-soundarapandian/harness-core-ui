/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get, isEmpty } from 'lodash-es'
import type { IconName } from '@blueprintjs/core'
import { Color, Container, FontVariation, Icon, Layout, Text } from '@harness/uicore'
import type { FormikProps } from 'formik'
import { ArtifactTitleIdByType, ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { useStrings } from 'framework/strings'
import type { ServiceDefinition } from 'services/cd-ng'
import type { ArtifactType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { useCDOnboardingContext } from '../../CDOnboardingStore'

import type { ConfigureServiceInterface } from '../ConfigureService'
import {
  allowedArtifactTypesForOnboiarding,
  ArtifactIconByType,
  BinaryLabels,
  BinaryOptions
} from '../../CDOnboardingUtils'
import DockerArtifactory from './DockerArtifactory'
import { StepStatus } from '../../DeployProvisioningWizard/Constants'
import ArtifactImagePath from './ArtifactImagePath'
import ButtonWrapper from '../../ButtonWrapper/ButtonWrapper'
import css from '../../DeployProvisioningWizard/DeployProvisioningWizard.module.scss'
import moduleCss from '../ConfigureService.module.scss'

interface ArtifactSelectionProps {
  formikProps: FormikProps<ConfigureServiceInterface>
  disableNextBtn: () => void
  enableNextBtn: () => void
}

const DefaultArtifactStepStatus = new Map<string, StepStatus>([
  ['Authentication', StepStatus.InProgress],
  ['ImagePath', StepStatus.ToDo]
])

const ArtifactSelection = ({ formikProps, enableNextBtn, disableNextBtn }: ArtifactSelectionProps): JSX.Element => {
  const {
    state: { service: serviceData }
  } = useCDOnboardingContext()
  const { getString } = useStrings()
  const [artifactStepStatus, setArtifactStepStatus] = React.useState<Map<string, StepStatus>>(DefaultArtifactStepStatus)

  const serviceDefinitionType =
    'Kubernetes' || (get(serviceData, 'serviceDefinition.type') as ServiceDefinition['type'])
  const artifactTypes = allowedArtifactTypesForOnboiarding[serviceDefinitionType]
  const supportedArtifactTypes = React.useMemo(
    () =>
      (artifactTypes || [])?.map(artifact => ({
        label: getString(ArtifactTitleIdByType[artifact]),
        icon: ArtifactIconByType[artifact] as IconName,
        value: artifact,
        disabled: ![ENABLED_ARTIFACT_TYPES.DockerRegistry].includes(artifact)
      })),
    [artifactTypes, getString]
  )

  React.useEffect(() => {
    if (formikProps?.values?.artifactToDeploy === BinaryLabels.NO) {
      enableNextBtn()
      return
    }
    artifactStepStatus.get('ImagePath') !== StepStatus.ToDo ? enableNextBtn() : disableNextBtn()
  }, [artifactStepStatus, formikProps?.values])

  return (
    <>
      {/* ARTIFACT SELECTION */}
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
                onClick={(value: string) => {
                  formikProps?.setFieldValue('artifactToDeploy', value)
                }}
                intent={formikProps?.values?.artifactToDeploy === option.label ? 'primary' : 'none'}
                margin={{ bottom: 'small' }}
                className={css.radioButton}
              />
            )
          })}
        </Layout.Horizontal>
      </Layout.Vertical>
      <Container className={css.borderBottomClass} padding={{ top: 'large' }} />
      {formikProps?.values?.artifactToDeploy === BinaryLabels.YES && (
        <>
          {/* ARTIFACT TYPE SELECTION */}
          <Layout.Vertical padding={{ top: 'xxlarge' }}>
            <Text font={{ variation: FontVariation.H4 }} padding={{ bottom: 'large' }} color={Color.GREY_600}>
              {getString('cd.getStartedWithCD.selectArtifactRepo')}
            </Text>
            <Layout.Horizontal>
              {supportedArtifactTypes.map(option => {
                return (
                  <ButtonWrapper
                    key={option.label}
                    option={option}
                    onClick={(value: string) => {
                      formikProps?.setFieldValue('artifactType', value)
                    }}
                    intent={formikProps?.values?.artifactType === option.value ? 'primary' : 'none'}
                    margin={{ bottom: 'small' }}
                    className={css.radioButton}
                  />
                )
              })}
            </Layout.Horizontal>
          </Layout.Vertical>
          <Container className={css.borderBottomClass} padding={{ top: 'large' }} />
          {!isEmpty(formikProps?.values?.artifactType) && (
            <Container padding="large" className={moduleCss.connectorContainer}>
              <Layout.Vertical>
                <Layout.Horizontal margin={{ bottom: 'large', top: 'large' }}>
                  <Icon name={ArtifactIconByType[formikProps?.values?.artifactType as ArtifactType]} size={28} flex />
                  <Text font={{ variation: FontVariation.H5 }} padding={{ left: 'large' }}>
                    {`${getString('cd.getStartedWithCD.connectTo')} ${getString(
                      ArtifactTitleIdByType[formikProps?.values?.artifactType as ArtifactType]
                    )}`}
                  </Text>
                </Layout.Horizontal>
                <ul className={moduleCss.progress}>
                  <li className={`${moduleCss.progressItem} ${moduleCss.progressItemActive}`}>
                    <Text font={{ variation: FontVariation.H5 }} padding={{ left: 'small', bottom: 'small' }}>
                      {getString('common.getStarted.authMethod')}
                    </Text>
                    <DockerArtifactory
                      onSuccess={status => {
                        setArtifactStepStatus(
                          new Map<string, StepStatus>([
                            ['Authentication', status],
                            ['ImagePath', status !== StepStatus.Success ? StepStatus.ToDo : StepStatus.InProgress]
                          ])
                        )
                      }}
                    />
                  </li>

                  {artifactStepStatus.get('Authentication') === StepStatus.Success && (
                    <li className={`${moduleCss.progressItem} ${moduleCss.progressItemActive}`}>
                      <Text font={{ variation: FontVariation.H5 }} padding={{ left: 'small', bottom: 'small' }}>
                        {getString('pipeline.imagePathLabel')}
                      </Text>
                      <ArtifactImagePath formik={formikProps} />
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
