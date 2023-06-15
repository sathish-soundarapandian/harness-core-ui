/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React from 'react'
import { StepWizard } from '@harness/uicore'

import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import {
  Connectors,
  CONNECTOR_CREDENTIALS_STEP_IDENTIFIER,
  CreateConnectorModalProps,
  TESTCONNECTION_STEP_INDEX
} from '@connectors/constants'
import { useStrings } from 'framework/strings'
import ConnectorTestConnection from '@connectors/common/ConnectorTestConnection/ConnectorTestConnection'
import DelegateSelectorStep from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import { buildTerraformCloudPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { ConnectivityModeType } from '@common/components/ConnectivityMode/ConnectivityMode'
import ConnectorDetailsStep from '../commonSteps/ConnectorDetailsStep'
import ConnectivityModeStep from '../commonSteps/ConnectivityModeStep/ConnectivityModeStep'
import StepTerraformCloudAuthentication from './StepAuth/StepTerraformCloudAuthentication'
import terraformCloudDelegate from './ConnectivityModeStepImage/terraformCloudDelegate.svg'
import terraformCloudPlatform from './ConnectivityModeStepImage/terraformCloudPlatform.svg'

const TerraformCloudConnector: React.FC<CreateConnectorModalProps> = props => {
  const { onClose, onSuccess } = props
  const { getString } = useStrings()
  return (
    <StepWizard
      icon={getConnectorIconByType(Connectors.TERRAFORM_CLOUD)}
      iconProps={{ size: 37 }}
      title={getString(getConnectorTitleIdByType(Connectors.TERRAFORM_CLOUD))}
    >
      <ConnectorDetailsStep
        type={Connectors.TERRAFORM_CLOUD}
        name={getString('overview')}
        isEditMode={props.isEditMode}
        connectorInfo={props.connectorInfo}
        mock={props.mock}
        gitDetails={props.gitDetails}
        disableGitSync={true}
      />
      <StepTerraformCloudAuthentication
        name={getString('credentials')}
        identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
        {...props}
        connectorInfo={props.connectorInfo}
      />
      <ConnectivityModeStep
        name={getString('connectors.selectConnectivityMode')}
        type={Connectors.TERRAFORM_CLOUD}
        gitDetails={props.gitDetails}
        connectorInfo={props.connectorInfo}
        isEditMode={props.isEditMode}
        setIsEditMode={props.setIsEditMode}
        buildPayload={buildTerraformCloudPayload}
        connectivityMode={props.connectivityMode}
        setConnectivityMode={props.setConnectivityMode}
        hideModal={props.onClose}
        onConnectorCreated={props.onSuccess}
        helpPanelReferenceId="ConnectorConnectToTheProvider"
        platformImage={terraformCloudPlatform}
        delegateImage={terraformCloudDelegate}
      />
      {props.connectivityMode === ConnectivityModeType.Delegate ? (
        <DelegateSelectorStep
          name={getString('delegate.DelegateselectionLabel')}
          isEditMode={props.isEditMode}
          setIsEditMode={props.setIsEditMode}
          buildPayload={buildTerraformCloudPayload}
          hideModal={onClose}
          onConnectorCreated={onSuccess}
          connectorInfo={props.connectorInfo}
          gitDetails={props.gitDetails}
          disableGitSync={true}
          helpPanelReferenceId="ConnectorDelegatesSetup"
        />
      ) : null}
      <ConnectorTestConnection
        name={getString('connectors.stepThreeName')}
        connectorInfo={props.connectorInfo}
        isStep={true}
        isLastStep={true}
        type={Connectors.TERRAFORM_CLOUD}
        onClose={onClose}
        stepIndex={TESTCONNECTION_STEP_INDEX}
        helpPanelReferenceId="ConnectorTest"
      />
    </StepWizard>
  )
}

export default TerraformCloudConnector
