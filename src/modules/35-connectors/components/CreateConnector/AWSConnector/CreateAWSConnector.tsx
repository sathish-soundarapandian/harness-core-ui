/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { StepWizard } from '@harness/uicore'
import { pick } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import ConnectorTestConnection from '@connectors/common/ConnectorTestConnection/ConnectorTestConnection'
import {
  Connectors,
  CONNECTOR_CREDENTIALS_STEP_IDENTIFIER,
  CreateConnectorModalProps,
  TESTCONNECTION_STEP_INDEX
} from '@connectors/constants'
import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import DelegateSelectorStep from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import { buildAWSPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { ConnectivityModeType } from '@common/components/ConnectivityMode/ConnectivityMode'
import StepAWSAuthentication from './StepAuth/StepAWSAuthentication'
import ConnectivityModeStep from '../commonSteps/ConnectivityModeStep/ConnectivityModeStep'
import awsPlatform from './ConnectivityModeStepImages/awsPlatform.svg'
import awsDelegate from './ConnectivityModeStepImages/awsDelegate.svg'
import StepBackOffStrategy from './StepBackOffStrategy/StepBackOffStrategy'

const CreateAWSConnector: React.FC<CreateConnectorModalProps> = props => {
  const { getString } = useStrings()
  const commonProps = pick(props, [
    'isEditMode',
    'setIsEditMode',
    'connectorInfo',
    'gitDetails',
    'accountId',
    'orgIdentifier',
    'projectIdentifier',
    'connectivityMode',
    'setConnectivityMode'
  ])

  const { CDS_AWS_BACKOFF_STRATEGY } = useFeatureFlags()

  return (
    <>
      <StepWizard
        icon={getConnectorIconByType(Connectors.AWS)}
        iconProps={{ size: 37 }}
        title={getString(getConnectorTitleIdByType(Connectors.AWS))}
      >
        <ConnectorDetailsStep
          type={Connectors.AWS}
          name={getString('overview')}
          isEditMode={props.isEditMode}
          connectorInfo={props.connectorInfo}
          gitDetails={props.gitDetails}
          mock={props.mock}
          helpPanelReferenceId="AwsConnectorOverview"
        />
        <StepAWSAuthentication
          name={getString('credentials')}
          identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
          {...commonProps}
          onConnectorCreated={props.onSuccess}
          connectorInfo={props.connectorInfo}
          helpPanelReferenceId="AwsConnectorCredentials"
        />
        {CDS_AWS_BACKOFF_STRATEGY ? (
          <StepBackOffStrategy
            name={getString('connectors.aws.awsBackOffStrategy')}
            {...commonProps}
            connectorInfo={props.connectorInfo}
            helpPanelReferenceId="AwsConnectorBackOffStrategy"
          />
        ) : null}
        <ConnectivityModeStep
          name={getString('connectors.selectConnectivityMode')}
          type={Connectors.AWS}
          gitDetails={props.gitDetails}
          connectorInfo={props.connectorInfo}
          isEditMode={props.isEditMode}
          setIsEditMode={props.setIsEditMode}
          buildPayload={buildAWSPayload}
          connectivityMode={props.connectivityMode}
          setConnectivityMode={props.setConnectivityMode}
          hideModal={props.onClose}
          onConnectorCreated={props.onSuccess}
          helpPanelReferenceId="ConnectorConnectToTheProvider"
          delegateImage={awsDelegate}
          platformImage={awsPlatform}
        />
        {props.connectivityMode === ConnectivityModeType.Delegate ? (
          <DelegateSelectorStep
            name={getString('delegate.DelegateselectionLabel')}
            isEditMode={props.isEditMode}
            setIsEditMode={props.setIsEditMode}
            buildPayload={buildAWSPayload}
            hideModal={props.onClose}
            onConnectorCreated={props.onSuccess}
            connectorInfo={props.connectorInfo}
            gitDetails={props.gitDetails}
            helpPanelReferenceId="ConnectorDelegatesSetup"
          />
        ) : null}
        <ConnectorTestConnection
          name={getString('connectors.stepThreeName')}
          connectorInfo={props.connectorInfo}
          isStep={true}
          isLastStep={true}
          type={Connectors.AWS}
          onClose={props.onClose}
          helpPanelReferenceId="ConnectorTest"
          stepIndex={TESTCONNECTION_STEP_INDEX}
        />
      </StepWizard>
    </>
  )
}

export default CreateAWSConnector
