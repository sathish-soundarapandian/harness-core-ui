/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useRef } from 'react'
import { Layout, Button, Text, Container, ButtonVariation, ButtonSize, Icon } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { get, isEmpty, noop, set, unset } from 'lodash-es'
import { useParams } from 'react-router-dom'
import produce from 'immer'
import {
  DockerProviderType,
  buildDockerPayload,
  DelegateTypes,
  buildArtifactoryPayload,
  buildAWSPayload
} from '@connectors/pages/connectors/utils/ConnectorUtils'
import { useStrings } from 'framework/strings'
import { AuthTypes } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { ErrorHandler, ResponseMessage } from '@common/components/ErrorHandler/ErrorHandler'
import { TestStatus } from '@common/components/TestConnectionWidget/TestConnectionWidget'
import useCreateEditConnector, { BuildPayloadProps } from '@connectors/hooks/useCreateEditConnector'
import { ConnectivityModeType } from '@common/components/ConnectivityMode/ConnectivityMode'
import { ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import StepDockerAuthentication, {
  DockerFormInterface
} from '@connectors/components/CreateConnector/DockerConnector/StepAuth/StepDockerAuthentication'
import StepArtifactoryAuthentication, {
  ArtifactoryFormInterface
} from '@connectors/components/CreateConnector/ArtifactoryConnector/StepAuth/StepArtifactoryAuthentication'
import { CONNECTOR_CREDENTIALS_STEP_IDENTIFIER } from '@connectors/constants'
import { ModalViewFor } from '@connectors/components/CreateConnector/CreateConnectorUtils'
import StepAWSAuthentication, {
  AWSFormInterface
} from '@connectors/components/CreateConnector/AWSConnector/StepAuth/StepAWSAuthentication'
import { regionValues } from '@connectors/components/CreateConnector/AWSConnector/StepAuth/StepAuthConstants'
import type { ArtifactType } from '@pipeline/components/ArtifactsSelection/ArtifactInterface'
import { ArtifactoryGenericFormInterface, getUniqueEntityIdentifier, ServiceDataType } from '../../CDOnboardingUtils'
import { StepStatus } from '../../DeployProvisioningWizard/Constants'
import { useCDOnboardingContext } from '../../CDOnboardingStore'
import moduleCss from './DockerArtifactory.module.scss'
import css from '../../DeployProvisioningWizard/DeployProvisioningWizard.module.scss'

export type ArtifactoryGenericInterface<T> = T & ArtifactoryGenericFormInterface

const commonFields = {
  name: 'sample_docker_connector',
  identifier: '',
  connectivityMode: ConnectivityModeType.Delegate,
  delegateSelectors: []
}
const dockerInitialFormData: ArtifactoryGenericInterface<DockerFormInterface> = {
  ...commonFields,
  dockerRegistryUrl: 'https://hub.docker.com/r/',
  authType: AuthTypes.ANNONYMOUS,
  dockerProviderType: DockerProviderType.DOCKERHUB,
  username: undefined,
  password: undefined
}
const artifactoryInitialFormData: ArtifactoryGenericInterface<ArtifactoryFormInterface> = {
  ...commonFields,
  artifactoryServerUrl: 'https://harness.jfrog.io/artifactory/',
  authType: AuthTypes.ANNONYMOUS,
  username: undefined,
  password: undefined
}
const ecrInitialFormData: ArtifactoryGenericInterface<AWSFormInterface> = {
  ...commonFields,
  delegateType: DelegateTypes.DELEGATE_IN_CLUSTER,
  accessKey: undefined,
  secretKeyRef: undefined,
  crossAccountAccess: false,
  crossAccountRoleArn: '',
  externalId: '',
  region: regionValues[0].value
}
interface DelegateSelectorStepData extends BuildPayloadProps {
  delegateSelectors: Array<string>
  connectivityMode: ConnectivityModeType | undefined
}

export function useArtifactAuthentication(params: any): JSX.Element {
  const { selectedArtifactType, authenticationStepProps } = params
  switch (selectedArtifactType) {
    case ENABLED_ARTIFACT_TYPES.DockerRegistry:
      return <StepDockerAuthentication {...authenticationStepProps} />
    case ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry:
      return <StepArtifactoryAuthentication {...authenticationStepProps} />
    case ENABLED_ARTIFACT_TYPES.Ecr:
    case ENABLED_ARTIFACT_TYPES.AmazonS3:
      return <StepAWSAuthentication {...authenticationStepProps} />
    default:
      return <StepDockerAuthentication {...authenticationStepProps} />
  }
}

const getInitialValues = (artifactSelected: ArtifactType) => {
  switch (artifactSelected) {
    case ENABLED_ARTIFACT_TYPES.DockerRegistry:
      return dockerInitialFormData
    case ENABLED_ARTIFACT_TYPES.Ecr:
    case ENABLED_ARTIFACT_TYPES.AmazonS3:
      return ecrInitialFormData
    case ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry:
      return artifactoryInitialFormData
    default:
      return commonFields
  }
}

const getBuildPayload = (artifactSelected: ArtifactType) => {
  switch (artifactSelected) {
    case ENABLED_ARTIFACT_TYPES.DockerRegistry:
      return buildDockerPayload
    case ENABLED_ARTIFACT_TYPES.Ecr:
    case ENABLED_ARTIFACT_TYPES.AmazonS3:
      return buildAWSPayload
    case ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry:
      return buildArtifactoryPayload
    default:
      return <></>
  }
}

const ArtifactoryAuthStep = ({
  onSuccess,
  selectedArtifact
}: {
  onSuccess: (status: StepStatus) => void
  selectedArtifact: ArtifactType
}): JSX.Element => {
  const { getString } = useStrings()
  const [artifactAuthData, setArtifactAuthData] = React.useState<any>()

  const {
    state: { service: serviceData },
    saveServiceData
  } = useCDOnboardingContext()

  const [testConnectionStatus, setTestConnectionStatus] = useState<TestStatus>(
    get(serviceData, 'data.artifactData.connectorResponse.status') === 'SUCCESS'
      ? TestStatus.SUCCESS
      : TestStatus.NOT_INITIATED
  )
  const [testConnectionErrors, setTestConnectionErrors] = useState<ResponseMessage[]>()
  const [editMode, setIsEditMode] = useState(Boolean(serviceData?.data?.artifactData?.connectorResponse) || false) // connector edit mode

  const scrollRef = useRef<Element>()

  const { accountId, projectIdentifier, orgIdentifier } = useParams<Record<string, string>>()

  const TestConnection = (): React.ReactElement => {
    switch (testConnectionStatus) {
      case TestStatus.FAILED:
      case TestStatus.NOT_INITIATED:
        return (
          <Layout.Vertical>
            <Button
              variation={ButtonVariation.PRIMARY}
              text={getString('common.smtp.testConnection')}
              size={ButtonSize.SMALL}
              type="submit"
              onClick={() => {
                validateDockerAuthentication()
              }}
              className={css.testConnectionBtn}
              id="test-connection-btn"
            />
            {testConnectionStatus === TestStatus.FAILED &&
            Array.isArray(testConnectionErrors) &&
            testConnectionErrors.length > 0 ? (
              <Container padding={{ top: 'medium' }} ref={scrollRef}>
                <ErrorHandler responseMessages={testConnectionErrors || []} />
              </Container>
            ) : null}
          </Layout.Vertical>
        )
      case TestStatus.IN_PROGRESS:
        return (
          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="small">
            <Icon name="steps-spinner" color={Color.PRIMARY_7} />
            <Text font={{ variation: FontVariation.BODY2 }} color={Color.PRIMARY_7}>
              {getString('common.test.inProgress')}
            </Text>
          </Layout.Horizontal>
        )
      case TestStatus.SUCCESS:
        return (
          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="small">
            <Icon name="success-tick" />
            <Text font={{ variation: FontVariation.BODY2 }} color={Color.GREEN_700}>
              {getString('common.test.connectionSuccessful')}
            </Text>
          </Layout.Horizontal>
        )
      default:
        return <></>
    }
  }

  const onErrorHandler = (_response: ResponseMessage): void => {
    setTestConnectionStatus(TestStatus.FAILED)
  }
  const { onInitiate, connectorResponse } = useCreateEditConnector<DelegateSelectorStepData>({
    accountId,
    isEditMode: editMode,
    isGitSyncEnabled: false,
    afterSuccessHandler: noop,
    onErrorHandler,
    skipGoveranceCheck: true
  })

  useEffect(() => {
    // reset test connection
    if (isEmpty(connectorResponse)) {
      setTestConnectionStatus(TestStatus.NOT_INITIATED)
    }
    // save data to context
    const updatedContextService = produce(serviceData as ServiceDataType, draft => {
      set(draft, 'data.artifactData', { ...artifactAuthData, connectorResponse })
    })

    saveServiceData(updatedContextService)
    if (connectorResponse?.status === 'SUCCESS') {
      setIsEditMode(true)
      onSuccess(StepStatus.Success)
      setTestConnectionStatus(TestStatus.SUCCESS)
    } else {
      setTestConnectionStatus(TestStatus.FAILED)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectorResponse])

  useEffect(() => {
    // reset editMode for new connector type
    if (isEmpty(serviceData?.data?.artifactData?.connectorResponse)) {
      if (isEmpty(connectorResponse)) {
        setIsEditMode(false)
        onSuccess(StepStatus.ToDo)
        setTestConnectionStatus(TestStatus.NOT_INITIATED)
      }
    } else {
      setIsEditMode(true)
      onSuccess(StepStatus.Success)
      setTestConnectionStatus(TestStatus.SUCCESS)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectorResponse, serviceData?.data])

  const validateDockerAuthentication = React.useCallback(async (): Promise<void> => {
    setTestConnectionStatus(TestStatus.IN_PROGRESS)
    setTestConnectionErrors([])
    const connectorData: DelegateSelectorStepData = {
      ...artifactAuthData,
      projectIdentifier: projectIdentifier,
      orgIdentifier: orgIdentifier
    }

    onInitiate({
      connectorFormData: connectorData,
      buildPayload: getBuildPayload(selectedArtifact) as any
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onInitiate, orgIdentifier, projectIdentifier])

  const getArtifactInitialValues = React.useCallback(
    (artifactSelected: ArtifactType): DockerFormInterface => {
      const contextArtifactData = get(serviceData, 'data.artifactData')
      const initialVal = getInitialValues(artifactSelected)
      return isEmpty(contextArtifactData)
        ? {
            ...initialVal,
            identifier: getUniqueEntityIdentifier(initialVal.name)
          }
        : contextArtifactData
    },
    [serviceData]
  )
  const resetContextConnectorData = (): void => {
    const updatedContextService = produce(serviceData as ServiceDataType, draft => {
      if (draft) unset(draft, 'data.artifactData.connectorResponse')
    })
    saveServiceData(updatedContextService)
    setTestConnectionStatus(TestStatus.NOT_INITIATED)
    onSuccess(StepStatus.ToDo)
  }
  const authenticationStepProps = React.useMemo(() => {
    const prevStepData = getArtifactInitialValues(selectedArtifact)
    setArtifactAuthData(prevStepData)
    return {
      identifier: CONNECTOR_CREDENTIALS_STEP_IDENTIFIER,
      editMode,
      setIsEditMode,
      accountId,
      orgIdentifier,
      projectIdentifier,
      connectorInfo: undefined,
      prevStepData,
      nextStep: (data: any) => {
        //StepDockerAuthenticationProps
        setTestConnectionErrors([])
        setArtifactAuthData(data)
        // on field change, reset Test Connection
        resetContextConnectorData()
      },
      context: ModalViewFor.CD_Onboarding,
      formClassName: moduleCss.artifactAuthFormOverride
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, editMode, orgIdentifier, projectIdentifier, selectedArtifact])

  return (
    <Layout.Vertical margin={{ bottom: 'large' }} padding={{ left: 'small' }}>
      {useArtifactAuthentication({
        selectedArtifactType: selectedArtifact,
        authenticationStepProps
      })}
      <Layout.Horizontal>
        <Container>
          <TestConnection />
        </Container>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default ArtifactoryAuthStep
