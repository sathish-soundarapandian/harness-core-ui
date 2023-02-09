/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
// import { pick } from 'lodash-es'
import { StepWizard } from '@harness/uicore'
import { pick } from 'lodash-es'

import type { IGitContextFormProps } from '@common/components/GitContextForm/GitContextForm'
import type { ConnectorRequestBody, ResponseBoolean, ConnectorInfoDTO } from 'services/cd-ng'
import { Connectors, CONNECTOR_CREDENTIALS_STEP_IDENTIFIER, TESTCONNECTION_STEP_INDEX } from '@connectors/constants'
import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { useStrings } from 'framework/strings'
import { buildBambooPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'

import ConnectorTestConnection from '@connectors/common/ConnectorTestConnection/ConnectorTestConnection'

import ConnectorDetailsStep from '../commonSteps/ConnectorDetailsStep'
import StepBambooAuthentication from './StepAuth/StepBambooAuthentication'
import DelegateSelectorStep from '../commonSteps/DelegateSelectorStep/DelegateSelectorStep'

interface CreateBambooConnectorProps {
  onClose: () => void
  onSuccess?: (data?: ConnectorRequestBody) => void | Promise<void>
  mock?: ResponseBoolean
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  connectorInfo?: ConnectorInfoDTO | void
  gitDetails?: IGitContextFormProps
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
}

const CreateBambooConnector: React.FC<CreateBambooConnectorProps> = props => {
  const { getString } = useStrings()
  const commonProps = pick(props, ['isEditMode', 'setIsEditMode', 'accountId', 'orgIdentifier', 'projectIdentifier'])

  return (
    <StepWizard
      icon={getConnectorIconByType(Connectors.Bamboo)}
      iconProps={{ size: 37 }}
      title={getString(getConnectorTitleIdByType(Connectors.Bamboo))}
    >
      <ConnectorDetailsStep
        type={Connectors.Bamboo}
        name={getString('overview')}
        isEditMode={props.isEditMode}
        connectorInfo={props.connectorInfo}
        gitDetails={props.gitDetails}
        mock={props.mock}
      />
      <StepBambooAuthentication
        name={getString('details')}
        identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
        {...commonProps}
        onConnectorCreated={props.onSuccess}
        connectorInfo={props.connectorInfo}
      />
      <DelegateSelectorStep
        name={getString('delegate.DelegateselectionLabel')}
        isEditMode={props.isEditMode}
        setIsEditMode={props.setIsEditMode}
        buildPayload={buildBambooPayload}
        hideModal={props.onClose}
        onConnectorCreated={props.onSuccess}
        connectorInfo={props.connectorInfo}
        gitDetails={props.gitDetails}
      />
      <ConnectorTestConnection
        name={getString('connectors.stepThreeName')}
        connectorInfo={props.connectorInfo}
        isStep={true}
        isLastStep={true}
        type={Connectors.Bamboo}
        onClose={props.onClose}
        stepIndex={TESTCONNECTION_STEP_INDEX}
      />
    </StepWizard>
  )
}

export default CreateBambooConnector
