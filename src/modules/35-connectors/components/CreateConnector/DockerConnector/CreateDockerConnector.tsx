/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { StepWizard } from '@harness/uicore'
import { pick } from 'lodash-es'
import { Color } from '@harness/design-system'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import ConnectorTestConnection from '@connectors/common/ConnectorTestConnection/ConnectorTestConnection'
import { Connectors, CONNECTOR_CREDENTIALS_STEP_IDENTIFIER, TESTCONNECTION_STEP_INDEX } from '@connectors/constants'
import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { buildDockerPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { useStrings } from 'framework/strings'
import type { ConnectorRequestBody, ConnectorInfoDTO, ResponseBoolean } from 'services/cd-ng'
import type { IGitContextFormProps } from '@common/components/GitContextForm/GitContextForm'
import { ConnectivityModeType } from '@common/components/ConnectivityMode/ConnectivityMode'
import StepDockerAuthentication from './StepAuth/StepDockerAuthentication'
import DelegateSelectorStep from '../commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import ConnectivityModeStep from '../commonSteps/ConnectivityModeStep/ConnectivityModeStep'
import type { ModalViewFor } from '../CreateConnectorUtils'

interface CreateDockerConnectorProps {
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
  connectivityMode?: ConnectivityModeType
  setConnectivityMode?: (val: ConnectivityModeType) => void
  context?: ModalViewFor
  formClassName?: string
}
const CreateDockerConnector: React.FC<CreateDockerConnectorProps> = props => {
  const { getString } = useStrings()
  const commonProps = pick(props, [
    'isEditMode',
    'setIsEditMode',
    'accountId',
    'orgIdentifier',
    'projectIdentifier',
    'connectivityMode',
    'setConnectivityMode',
    'context',
    'formClassName'
  ])
  return (
    <>
      <StepWizard
        icon={getConnectorIconByType(Connectors.DOCKER)}
        iconProps={{ size: 37, color: Color.WHITE }}
        title={getString(getConnectorTitleIdByType(Connectors.DOCKER))}
      >
        <ConnectorDetailsStep
          type={Connectors.DOCKER}
          name={getString('overview')}
          isEditMode={props.isEditMode}
          connectorInfo={props.connectorInfo}
          gitDetails={props.gitDetails}
          mock={props.mock}
          helpPanelReferenceId="DockerConnectorOverview"
        />
        <StepDockerAuthentication
          name={getString('details')}
          identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
          {...commonProps}
          onConnectorCreated={props.onSuccess}
          connectorInfo={props.connectorInfo}
          helpPanelReferenceId="DockerConnectorDetails"
        />
        <ConnectivityModeStep
          name={getString('connectors.selectConnectivityMode')}
          type={Connectors.DOCKER}
          gitDetails={props.gitDetails}
          connectorInfo={props.connectorInfo}
          isEditMode={props.isEditMode}
          setIsEditMode={props.setIsEditMode}
          buildPayload={buildDockerPayload}
          connectivityMode={props.connectivityMode}
          setConnectivityMode={props.setConnectivityMode}
          hideModal={props.onClose}
          onConnectorCreated={props.onSuccess}
        />
        {props.connectivityMode === ConnectivityModeType.Delegate ? (
          <DelegateSelectorStep
            name={getString('delegate.DelegateselectionLabel')}
            isEditMode={props.isEditMode}
            setIsEditMode={props.setIsEditMode}
            buildPayload={buildDockerPayload}
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
          type={Connectors.DOCKER}
          onClose={props.onClose}
          stepIndex={TESTCONNECTION_STEP_INDEX}
          helpPanelReferenceId="ConnectorTest"
        />
      </StepWizard>
    </>
  )
}

export default CreateDockerConnector
