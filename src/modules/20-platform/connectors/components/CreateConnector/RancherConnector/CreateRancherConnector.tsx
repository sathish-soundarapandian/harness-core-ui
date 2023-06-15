import React from 'react'
import { StepWizard } from '@harness/uicore'
import { pick } from 'lodash-es'
import ConnectorTestConnection from '@connectors/common/ConnectorTestConnection/ConnectorTestConnection'
import {
  Connectors,
  CONNECTOR_CREDENTIALS_STEP_IDENTIFIER,
  CreateConnectorModalProps,
  TESTCONNECTION_STEP_INDEX
} from '@connectors/constants'
import { useStrings } from 'framework/strings'
import { buildRancherPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'

import { getConnectorTitleIdByType, getConnectorIconByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import ConnectorDetailsStep from '../commonSteps/ConnectorDetailsStep'
import StepRancherClusterDetails from './StepAuth/StepRancherClusterDetails'
import DelegateSelectorStep from '../commonSteps/DelegateSelectorStep/DelegateSelectorStep'

const CreateRancherConnector: React.FC<CreateConnectorModalProps> = props => {
  const { getString } = useStrings()

  const commonProps = pick(props, [
    'isEditMode',
    'connectorInfo',
    'gitDetails',
    'setIsEditMode',
    'accountId',
    'orgIdentifier',
    'projectIdentifier'
  ])
  return (
    <StepWizard
      icon={getConnectorIconByType(Connectors.Rancher)}
      iconProps={{ size: 50 }}
      title={getString(getConnectorTitleIdByType(Connectors.Rancher))}
    >
      <ConnectorDetailsStep
        type={Connectors.Rancher}
        name={getString('overview')}
        isEditMode={props.isEditMode}
        connectorInfo={props.connectorInfo}
        gitDetails={props.gitDetails}
        mock={props.mock}
        helpPanelReferenceId="RancherConnectorOverview"
      />
      <StepRancherClusterDetails
        name={getString('details')}
        identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
        onConnectorCreated={props.onSuccess}
        hideModal={props.onClose}
        {...commonProps}
      />
      <DelegateSelectorStep
        name={getString('delegate.DelegateselectionLabel')}
        isEditMode={props.isEditMode}
        setIsEditMode={props.setIsEditMode}
        buildPayload={buildRancherPayload}
        onConnectorCreated={props.onSuccess}
        connectorInfo={props.connectorInfo}
        gitDetails={props.gitDetails}
        hideModal={props.onClose}
        helpPanelReferenceId="ConnectorDelegatesSetup"
      />
      <ConnectorTestConnection
        name={getString('connectors.stepThreeName')}
        connectorInfo={props.connectorInfo}
        isStep
        isLastStep={true}
        type={Connectors.Rancher}
        onClose={props.onClose}
        setIsEditMode={props.setIsEditMode}
        stepIndex={TESTCONNECTION_STEP_INDEX}
        helpPanelReferenceId="ConnectorTest"
      />
    </StepWizard>
  )
}

export default CreateRancherConnector
