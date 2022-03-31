/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { StepWizard } from '@wings-software/uicore'

import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import {
  Connectors,
  CONNECTOR_CREDENTIALS_STEP_IDENTIFIER,
  CreateConnectorModalProps,
  GIT_TESTCONNECTION_STEP_INDEX
} from '@connectors/constants'
import { useStrings } from 'framework/strings'
import { buildAzureKeyVaultPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import DelegateSelectorStep from '../commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import ConnectorDetailsStep from '../commonSteps/ConnectorDetailsStep'
import AzureKeyVaultForm from '../CreateAzureKeyConnector/views/AzureKeyVaultForm'
import SetupVault from '../CreateAzureKeyConnector/views/SetupVault'
import css from './CreateAzureBlobConnector.module.scss'

const CreateAzureBlobConnector: React.FC<CreateConnectorModalProps> = props => {
  const { onClose, onSuccess } = props
  const { getString } = useStrings()
  return (
    <StepWizard
      icon={getConnectorIconByType(Connectors.AZURE_BLOB)}
      iconProps={{ size: 37 }}
      title={getString(getConnectorTitleIdByType(Connectors.AZURE_BLOB))}
      className={css.wizardNav}
    >
      <ConnectorDetailsStep
        type={Connectors.AZURE_BLOB}
        name={getString('overview')}
        isEditMode={props.isEditMode}
        connectorInfo={props.connectorInfo}
        mock={props.mock}
        disableGitSync={true}
      />
      <AzureKeyVaultForm
        type={Connectors.AZURE_BLOB}
        name={getString('details')}
        identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
        connectorInfo={props.connectorInfo}
        isEditMode={props.isEditMode}
        setIsEditMode={props.setIsEditMode}
        accountId={props.accountId}
        orgIdentifier={props.orgIdentifier}
        projectIdentifier={props.projectIdentifier}
      />
      <DelegateSelectorStep
        name={getString('delegate.DelegateselectionLabel')}
        isEditMode={props.isEditMode}
        setIsEditMode={props.setIsEditMode}
        buildPayload={buildAzureKeyVaultPayload}
        hideModal={onClose}
        connectorInfo={props.connectorInfo}
        gitDetails={props.gitDetails}
        disableGitSync={true}
        submitOnNextStep
      />
      <SetupVault
        type={Connectors.AZURE_BLOB}
        name={getString('connectors.azureKeyVault.labels.setupVault')}
        onConnectorCreated={onSuccess}
        connectorInfo={props.connectorInfo}
        isEditMode={props.isEditMode}
        setIsEditMode={props.setIsEditMode}
        accountId={props.accountId}
        orgIdentifier={props.orgIdentifier}
        projectIdentifier={props.projectIdentifier}
      />
      <VerifyOutOfClusterDelegate
        name={getString('connectors.stepThreeName')}
        connectorInfo={props.connectorInfo}
        isStep
        onClose={onClose}
        isLastStep={true}
        type={Connectors.AZURE_KEY_VAULT}
        stepIndex={GIT_TESTCONNECTION_STEP_INDEX}
      />
    </StepWizard>
  )
}

export default CreateAzureBlobConnector
