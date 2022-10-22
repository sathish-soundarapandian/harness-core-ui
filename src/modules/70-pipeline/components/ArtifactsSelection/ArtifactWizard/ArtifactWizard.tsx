/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { StepWizard, Icon, AllowedTypes } from '@wings-software/uicore'
import type { IconProps } from '@harness/icons'
import { String, StringKeys, useStrings } from 'framework/strings'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import ConnectorTestConnection from '@connectors/common/ConnectorTestConnection/ConnectorTestConnection'
import DelegateSelectorStep from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import StepDockerAuthentication from '@connectors/components/CreateConnector/DockerConnector/StepAuth/StepDockerAuthentication'
import StepAWSAuthentication from '@connectors/components/CreateConnector/AWSConnector/StepAuth/StepAWSAuthentication'
import StepNexusAuthentication from '@connectors/components/CreateConnector/NexusConnector/StepAuth/StepNexusAuthentication'
import GcrAuthentication from '@connectors/components/CreateConnector/GcrConnector/StepAuth/GcrAuthentication'
import StepArtifactoryAuthentication from '@connectors/components/CreateConnector/ArtifactoryConnector/StepAuth/StepArtifactoryAuthentication'
import AzureAuthentication from '@connectors/components/CreateConnector/AzureConnector/StepAuth/AzureAuthentication'
import GcpAuthentication from '@connectors/components/CreateConnector/GcpConnector/StepAuth/GcpAuthentication'
import {
  buildArtifactoryPayload,
  buildAWSPayload,
  buildAzurePayload,
  buildDockerPayload,
  buildGcpPayload,
  buildNexusPayload
} from '@connectors/pages/connectors/utils/ConnectorUtils'
import ConnectivityModeStep from '@connectors/components/CreateConnector/commonSteps/ConnectivityModeStep/ConnectivityModeStep'
import { ConnectivityModeType } from '@common/components/ConnectivityMode/ConnectivityMode'
import { ArtifactoryRepoType } from '../ArtifactRepository/ArtifactoryRepoType'
import { ArtifactConnector } from '../ArtifactRepository/ArtifactConnector'
import type { InitialArtifactDataType, ConnectorRefLabelType, ArtifactType } from '../ArtifactInterface'
import { ArtifactTitleIdByType, ArtifactToConnectorMap, ENABLED_ARTIFACT_TYPES } from '../ArtifactHelper'

import css from './ArtifactWizard.module.scss'

interface StepChangeData<SharedObject> {
  prevStep?: number
  nextStep?: number
  prevStepData: SharedObject
}
interface ArtifactWizardProps {
  handleViewChange: (isConnectorView: boolean) => void
  artifactInitialValue: InitialArtifactDataType
  types: Array<ArtifactType>
  lastSteps: JSX.Element
  getOptionalConfigurationSteps?: JSX.Element | null
  newConnectorSteps?: any
  expressions: string[]
  labels: ConnectorRefLabelType
  selectedArtifact: ArtifactType | null
  changeArtifactType: (data: ArtifactType | null) => void
  newConnectorView: boolean
  iconsProps: IconProps | undefined
  isReadonly: boolean
  allowableTypes: AllowedTypes
  showConnectorStep: boolean
  newConnectorProps: any
}

function ArtifactWizard({
  types,
  labels,
  expressions,
  allowableTypes,
  selectedArtifact,
  changeArtifactType,
  getOptionalConfigurationSteps,
  handleViewChange,
  artifactInitialValue,
  newConnectorView,
  newConnectorProps,
  lastSteps,
  iconsProps,
  showConnectorStep,
  isReadonly
}: ArtifactWizardProps): React.ReactElement {
  const { getString } = useStrings()

  const [connectivityMode, setConnectivityMode] = React.useState<ConnectivityModeType>()

  const onStepChange = (arg: StepChangeData<any>): void => {
    if (arg?.prevStep && arg?.nextStep && arg.prevStep > arg.nextStep && arg.nextStep <= 3) {
      handleViewChange(false)
    }
  }

  const renderSubtitle = (): JSX.Element | undefined => {
    const stringId = selectedArtifact && ArtifactTitleIdByType[selectedArtifact]
    if (selectedArtifact) {
      return (
        <div className={css.subtitle} style={{ display: 'flex' }}>
          <Icon size={26} {...(iconsProps as IconProps)} />
          <String
            style={{ alignSelf: 'center', marginLeft: 'var(--spacing-small)' }}
            stringID={stringId as StringKeys}
          />
        </div>
      )
    }
    return undefined
  }

  const connectorAuthStep = (): JSX.Element => {
    switch (selectedArtifact) {
      case ENABLED_ARTIFACT_TYPES.DockerRegistry:
        return <StepDockerAuthentication name={getString('details')} {...newConnectorProps.auth} />
      case ENABLED_ARTIFACT_TYPES.Gcr:
        return <GcrAuthentication name={getString('details')} {...newConnectorProps.auth} />
      case ENABLED_ARTIFACT_TYPES.Ecr:
      case ENABLED_ARTIFACT_TYPES.AmazonS3:
        return <StepAWSAuthentication name={getString('credentials')} {...newConnectorProps.auth} />
      case ENABLED_ARTIFACT_TYPES.Nexus3Registry:
        return <StepNexusAuthentication name={getString('details')} {...newConnectorProps.auth} />
      case ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry:
        return <StepArtifactoryAuthentication name={getString('details')} {...newConnectorProps.auth} />
      case ENABLED_ARTIFACT_TYPES.Acr:
        return <AzureAuthentication name={getString('details')} {...newConnectorProps.auth} />
      case ENABLED_ARTIFACT_TYPES.GoogleArtifactRegistry:
        return <GcpAuthentication name={getString('details')} {...newConnectorProps.auth} />
      default:
        return <></>
    }
  }

  const getBuildPayload = () => {
    switch (selectedArtifact) {
      case ENABLED_ARTIFACT_TYPES.DockerRegistry:
        return buildDockerPayload
      case ENABLED_ARTIFACT_TYPES.GoogleArtifactRegistry:
      case ENABLED_ARTIFACT_TYPES.Gcr:
        return buildGcpPayload
      case ENABLED_ARTIFACT_TYPES.Ecr:
      case ENABLED_ARTIFACT_TYPES.AmazonS3:
        return buildAWSPayload
      case ENABLED_ARTIFACT_TYPES.Nexus3Registry:
        return buildNexusPayload
      case ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry:
        return buildArtifactoryPayload
      case ENABLED_ARTIFACT_TYPES.Acr:
        return buildAzurePayload
      default:
        return <></>
    }
  }

  const hasConnectivityModeStep = (): boolean => {
    switch (selectedArtifact) {
      case ENABLED_ARTIFACT_TYPES.DockerRegistry:
      case ENABLED_ARTIFACT_TYPES.GoogleArtifactRegistry:
      case ENABLED_ARTIFACT_TYPES.Ecr:
      case ENABLED_ARTIFACT_TYPES.AmazonS3:
      case ENABLED_ARTIFACT_TYPES.Acr:
      case ENABLED_ARTIFACT_TYPES.ArtifactoryRegistry:
        return true
      default:
        return false
    }
  }

  return (
    <StepWizard className={css.existingDocker} subtitle={renderSubtitle()} onStepChange={onStepChange}>
      <ArtifactoryRepoType
        artifactTypes={types}
        name={getString('connectors.artifactRepoType')}
        stepName={labels.firstStepName}
        selectedArtifact={selectedArtifact}
        artifactInitialValue={artifactInitialValue}
        changeArtifactType={changeArtifactType}
      />
      {showConnectorStep ? (
        <ArtifactConnector
          name={getString('connectors.artifactRepository')}
          stepName={labels.secondStepName}
          expressions={expressions}
          isReadonly={isReadonly}
          handleViewChange={() => handleViewChange(true)}
          initialValues={artifactInitialValue}
          selectedArtifact={selectedArtifact}
          allowableTypes={allowableTypes}
        />
      ) : null}

      {newConnectorView && selectedArtifact ? (
        <StepWizard title={getString('connectors.createNewConnector')}>
          <ConnectorDetailsStep type={ArtifactToConnectorMap[selectedArtifact]} {...newConnectorProps.connector} />
          {connectorAuthStep()}
          {hasConnectivityModeStep() ? (
            <ConnectivityModeStep
              name={getString('connectors.selectConnectivityMode')}
              type={ArtifactToConnectorMap[selectedArtifact]}
              {...newConnectorProps?.connectivity}
              buildPayload={getBuildPayload()}
              connectivityMode={connectivityMode}
              setConnectivityMode={setConnectivityMode}
            />
          ) : null}
          {connectivityMode === ConnectivityModeType.Delegate || !hasConnectivityModeStep() ? (
            <DelegateSelectorStep buildPayload={getBuildPayload()} {...newConnectorProps.delegate} />
          ) : null}
          <ConnectorTestConnection type={ArtifactToConnectorMap[selectedArtifact]} {...newConnectorProps.verify} />
        </StepWizard>
      ) : null}
      {lastSteps}
      {getOptionalConfigurationSteps ? getOptionalConfigurationSteps : null}
    </StepWizard>
  )
}

export default ArtifactWizard
