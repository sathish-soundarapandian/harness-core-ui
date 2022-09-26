/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { StepWizard } from '@wings-software/uicore'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import {
  Connectors,
  CONNECTOR_CREDENTIALS_STEP_IDENTIFIER,
  CreateConnectorModalProps,
  TESTCONNECTION_STEP_INDEX
} from '@connectors/constants'
import { useStrings } from 'framework/strings'
import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import type { ConnectorInfoDTO } from 'services/cd-ng'
import { buildAWSCodeCommitPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import ConnectorTestConnection from '@connectors/common/ConnectorTestConnection/ConnectorTestConnection'
import AWSCCAuthStep from './AWSCCAuthStep'
import AWSCCDetailsStep from './AWSCCDetailsStep'
import DelegateSelectorStep from '../commonSteps/DelegateSelectorStep/DelegateSelectorStep'

export default function CreateAWSCodeCommitConnector(props: CreateConnectorModalProps) {
  const { getString } = useStrings()
  return (
    <StepWizard
      icon={getConnectorIconByType(Connectors.AWS_CODECOMMIT)}
      iconProps={{ size: 37 }}
      title={getString(getConnectorTitleIdByType(Connectors.AWS_CODECOMMIT))}
    >
      <ConnectorDetailsStep
        type={Connectors.AWS_CODECOMMIT}
        name={getString('overview')}
        isEditMode={props.isEditMode}
        connectorInfo={props.connectorInfo}
        gitDetails={props.gitDetails}
        helpPanelReferenceId="CodeCommitConnectorOverviewId"
      />
      <AWSCCDetailsStep
        name={getString('details')}
        isEditMode={props.isEditMode}
        connectorInfo={props.connectorInfo as ConnectorInfoDTO}
        helpPanelReferenceId="CodeCommitConnectorDetails"
      />
      <AWSCCAuthStep
        name={getString('credentials')}
        identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
        isEditMode={props.isEditMode}
        connectorInfo={props.connectorInfo as ConnectorInfoDTO}
        onSuccess={props.onSuccess}
        setIsEditMode={props.setIsEditMode}
        helpPanelReferenceId="CodeCommitConnectorCredentials"
      />

      <DelegateSelectorStep
        name={getString('delegate.DelegateselectionLabel')}
        isEditMode={props.isEditMode}
        setIsEditMode={props.setIsEditMode}
        buildPayload={buildAWSCodeCommitPayload}
        hideModal={props.onClose}
        onConnectorCreated={props.onSuccess}
        connectorInfo={props.connectorInfo}
        gitDetails={props.gitDetails}
        helpPanelReferenceId="ConnectorDelegatesSetup"
      />
      <ConnectorTestConnection
        name={getString('connectors.stepThreeName')}
        connectorInfo={props.connectorInfo}
        isStep
        isLastStep
        type={Connectors.AWS_CODECOMMIT}
        onClose={props.onClose}
        stepIndex={TESTCONNECTION_STEP_INDEX}
        helpPanelReferenceId="ConnectorTest"
      />
    </StepWizard>
  )
}
