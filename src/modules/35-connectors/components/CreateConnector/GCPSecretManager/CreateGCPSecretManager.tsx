/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React from 'react'
import { StepWizard } from '@wings-software/uicore'

import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import {
  Connectors,
  CONNECTOR_CREDENTIALS_STEP_IDENTIFIER,
  CreateConnectorModalProps,
  TESTCONNECTION_STEP_INDEX
} from '@connectors/constants'
import { useStrings } from 'framework/strings'
import type { ConnectorInfoDTO } from 'services/cd-ng'

import ConnectorTestConnection from '@connectors/common/ConnectorTestConnection/ConnectorTestConnection'
import DelegateSelectorStep from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import { buildGcpSMPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import ConnectorDetailsStep from '../commonSteps/ConnectorDetailsStep'
import GCPSecretManagerConfig from './views/GCPSecretManagerConfig'

export interface StepSecretManagerProps extends ConnectorInfoDTO {
  isEdit: boolean
  spec: any
}

const CreateGCPSecretManager: React.FC<CreateConnectorModalProps> = props => {
  const { onClose, onSuccess } = props
  const { getString } = useStrings()
  return (
    <StepWizard
      icon={getConnectorIconByType(Connectors.GcpSecretManager)}
      iconProps={{ size: 37 }}
      title={getString(getConnectorTitleIdByType(Connectors.GcpSecretManager))}
    >
      <ConnectorDetailsStep
        type={Connectors.GcpSecretManager}
        name={getString('overview')}
        isEditMode={props.isEditMode}
        connectorInfo={props.connectorInfo}
        mock={props.mock}
        gitDetails={props.gitDetails}
        disableGitSync={true}
      />
      <GCPSecretManagerConfig
        name={getString('details')}
        identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
        {...props}
        connectorInfo={props.connectorInfo}
      />
      <DelegateSelectorStep
        name={getString('delegate.DelegateselectionLabel')}
        isEditMode={props.isEditMode}
        setIsEditMode={props.setIsEditMode}
        buildPayload={buildGcpSMPayload}
        hideModal={onClose}
        onConnectorCreated={onSuccess}
        connectorInfo={props.connectorInfo}
        gitDetails={props.gitDetails}
        disableGitSync={true}
        helpPanelReferenceId="ConnectorDelegatesSetup"
      />
      <ConnectorTestConnection
        name={getString('connectors.stepThreeName')}
        connectorInfo={props.connectorInfo}
        isStep
        onClose={onClose}
        isLastStep={true}
        type={Connectors.GcpSecretManager}
        stepIndex={TESTCONNECTION_STEP_INDEX}
        helpPanelReferenceId="ConnectorTest"
      />
    </StepWizard>
  )
}

export default CreateGCPSecretManager
