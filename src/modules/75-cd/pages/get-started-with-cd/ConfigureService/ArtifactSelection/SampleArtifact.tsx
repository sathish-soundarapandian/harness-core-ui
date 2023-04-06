/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, HarnessDocTooltip, Icon, Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { get, isEmpty, noop, set } from 'lodash-es'
import produce from 'immer'
import { useFormikContext } from 'formik'
import useCreateEditConnector from '@connectors/hooks/useCreateEditConnector'
import { buildDockerPayload, DockerProviderType } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { StringKeys, useStrings } from 'framework/strings'
import type { ConnectivityModeType } from '@common/components/ConnectivityMode/ConnectivityMode'
import { FeatureFlag } from '@common/featureFlags'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import type { DelegateSelectorStepData } from './ArtifactAuthStep'
import { useCDOnboardingContext } from '../../CDOnboardingStore'
import {
  ServiceDataType,
  SAMPLE_DOCKER_CONNECTOR_NAME,
  getUniqueEntityIdentifier,
  SAMPLE_ARTIFACT_NAME
} from '../../CDOnboardingUtils'
import type { ConfigureServiceInterface } from '../ConfigureService'
import css from './DockerArtifactory.module.scss'

const SAMPLE_TO_DO_ARTIFACT_VALUES = {
  providerType: DockerProviderType.DOCKERHUB,
  registryURL: 'https://registry.hub.docker.com/v2/',
  authType: 'Anonymous (no credentials required)',
  imagePath: 'harness/todolist-sample',
  tag: 'latest'
}

const sampleToDoListFieldKeyLabelMap: Record<string, StringKeys> = {
  providerType: 'connectors.docker.dockerProvideType',
  registryURL: 'connectors.docker.dockerRegistryURL',
  authType: 'authentication',
  imagePath: 'pipeline.imagePathLabel',
  tag: 'tagLabel'
}

const sampleArtifactAuthData = {
  name: 'sample_docker_connector',
  identifier: 'sample_docker_connector',
  connectivityMode: 'Delegate' as ConnectivityModeType,
  delegateSelectors: [],
  dockerRegistryUrl: 'https://registry.hub.docker.com/v2/',
  authType: 'Anonymous',
  dockerProviderType: 'DockerHub'
}

function SampleArtifact(): JSX.Element {
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<Record<string, string>>()
  const {
    state: { service: serviceData },
    saveServiceData
  } = useCDOnboardingContext()
  const { values: formValues, setFieldValue } = useFormikContext<ConfigureServiceInterface>()
  const isSvcEnvEnabled = useFeatureFlag(FeatureFlag.NG_SVC_ENV_REDESIGN)
  const artifactPath = isSvcEnvEnabled
    ? 'serviceDefinition.spec.artifacts.primary.sources[0]'
    : 'serviceDefinition.spec.artifacts.primary'

  const [artifactAuthData, setArtifactAuthData] = React.useState({
    ...sampleArtifactAuthData,
    identifier: get(serviceData, 'data.sampleArtifactData.identifier') || SAMPLE_DOCKER_CONNECTOR_NAME
  })

  const { onInitiate, connectorResponse } = useCreateEditConnector<DelegateSelectorStepData>({
    accountId,
    isEditMode: !!formValues?.artifactConfig?.connectorRef || false,
    isGitSyncEnabled: false,
    afterSuccessHandler: noop,
    skipGovernanceCheck: true,
    hideSuccessToast: true
  })

  React.useEffect(() => {
    if (isEmpty(connectorResponse)) {
      return
    }
    const artifactIdentifier = getUniqueEntityIdentifier(
      get(serviceData, `${artifactPath}.identifier`) || SAMPLE_ARTIFACT_NAME
    )

    const artifactConfig = {
      spec: {
        connectorRef: (connectorResponse as any)?.data?.connector?.identifier,
        imagePath: 'harness/todolist-sample',
        tag: 'latest'
      },
      identifier: artifactIdentifier
    }
    // saving data in context
    const updatedContextService = produce(serviceData as ServiceDataType, draft => {
      set(draft, 'data.artifactData', { ...artifactAuthData, connectorResponse })
      set(draft, artifactPath, artifactConfig)
    })
    setFieldValue('artifactConfig', artifactConfig)
    saveServiceData(updatedContextService)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectorResponse, artifactAuthData])

  React.useEffect(() => {
    const connectorIdentifier =
      formValues?.artifactConfig?.connectorRef || getUniqueEntityIdentifier(SAMPLE_DOCKER_CONNECTOR_NAME)
    const updatedArtifactAuthData = { ...artifactAuthData, identifier: connectorIdentifier }

    const connectorData: DelegateSelectorStepData = {
      ...updatedArtifactAuthData,
      projectIdentifier: projectIdentifier,
      orgIdentifier: orgIdentifier
    }

    onInitiate({
      connectorFormData: connectorData,
      buildPayload: buildDockerPayload
    })
    setArtifactAuthData(updatedArtifactAuthData)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Container padding={{ bottom: 'large', left: 'xlarge' }}>
      <Layout.Vertical>
        <Layout.Horizontal flex={{ justifyContent: 'flex-start' }}>
          <Icon name={'todo-list-harness'} size={55} padding={{ right: 'medium' }} />
          <Text
            font={{ size: 'medium', weight: 'semi-bold' }}
            padding={{ bottom: 'small' }}
            color={Color.GREY_600}
            data-tooltip-id="cdOnboardingSampleToDoListArtifact"
          >
            {getString('cd.getStartedWithCD.sampleToDoListApp')}
            <HarnessDocTooltip tooltipId="cdOnboardingSampleToDoListArtifact" useStandAlone={true} />
          </Text>
        </Layout.Horizontal>
        <Layout.Vertical padding={{ top: 'large' }}>
          <Text font={{ variation: FontVariation.H5, weight: 'semi-bold' }} padding={{ bottom: 'small' }}>
            {getString('common.configDetails')}
          </Text>

          <Layout.Vertical padding={{ top: 'small', bottom: 'small' }}>
            {Object.entries(SAMPLE_TO_DO_ARTIFACT_VALUES).map(([key, value]) => {
              const label = getString(
                sampleToDoListFieldKeyLabelMap[key as keyof typeof sampleToDoListFieldKeyLabelMap]
              )
              return (
                <Layout.Horizontal key={key}>
                  <Text className={css.label} font={{ size: 'normal', weight: 'bold' }}>
                    {label}
                  </Text>
                  <Text className={css.label} font={{ size: 'normal' }}>
                    {`: ${value}`}
                  </Text>
                </Layout.Horizontal>
              )
            })}
          </Layout.Vertical>
        </Layout.Vertical>
      </Layout.Vertical>
    </Container>
  )
}

export default SampleArtifact
