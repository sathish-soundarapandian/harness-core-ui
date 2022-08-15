/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { StepWizard } from '@wings-software/uicore'
import { pick } from 'lodash-es'
import ConnectorDetailsStep from '@connectors/components/CreateConnector/commonSteps/ConnectorDetailsStep'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import {
  Connectors,
  CONNECTOR_CREDENTIALS_STEP_IDENTIFIER,
  CreateConnectorModalProps,
  TESTCONNECTION_STEP_INDEX
} from '@connectors/constants'
import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { buildArtifactoryPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { useStrings } from 'framework/strings'
import { ConnectivityModeType } from '@common/components/ConnectivityMode/ConnectivityMode'
import StepArtifactoryAuthentication from './StepAuth/StepArtifactoryAuthentication'
import DelegateSelectorStep from '../commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import ConnectivityModeStep from '../commonSteps/ConnectivityModeStep/ConnectivityModeStep'

const CreateArtifactoryConnector: React.FC<CreateConnectorModalProps> = props => {
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
  return (
    <>
      <StepWizard
        icon={getConnectorIconByType(Connectors.ARTIFACTORY)}
        iconProps={{ size: 45 }}
        title={getString(getConnectorTitleIdByType(Connectors.ARTIFACTORY))}
      >
        <ConnectorDetailsStep
          type={Connectors.ARTIFACTORY}
          name={getString('overview')}
          isEditMode={props.isEditMode}
          connectorInfo={props.connectorInfo}
          gitDetails={props.gitDetails}
          mock={props.mock}
          helpPanelReferenceId="AritfactoryOverview"
        />
        <StepArtifactoryAuthentication
          name={getString('details')}
          identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
          {...commonProps}
          onConnectorCreated={props.onSuccess}
        />
        <ConnectivityModeStep
          name={getString('connectors.selectConnectivityMode')}
          type={Connectors.ARTIFACTORY}
          gitDetails={props.gitDetails}
          connectorInfo={props.connectorInfo}
          isEditMode={props.isEditMode}
          setIsEditMode={props.setIsEditMode}
          buildPayload={buildArtifactoryPayload}
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
            buildPayload={buildArtifactoryPayload}
            hideModal={props.onClose}
            onConnectorCreated={props.onSuccess}
            connectorInfo={props.connectorInfo}
            gitDetails={props.gitDetails}
            helpPanelReferenceId="ConnectorDelegatesSetup"
          />
        ) : null}
        <VerifyOutOfClusterDelegate
          name={getString('connectors.stepThreeName')}
          connectorInfo={props.connectorInfo}
          isStep={true}
          isLastStep={true}
          type={Connectors.ARTIFACTORY}
          onClose={props.onClose}
          setIsEditMode={props.setIsEditMode}
          stepIndex={TESTCONNECTION_STEP_INDEX}
          helpPanelReferenceId="ConnectorTest"
        />
      </StepWizard>
    </>
  )
}

export default CreateArtifactoryConnector
