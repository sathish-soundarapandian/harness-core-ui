/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { StepWizard } from '@wings-software/uicore'
import { pick } from 'lodash-es'
import {
  Connectors,
  CONNECTOR_CREDENTIALS_STEP_IDENTIFIER,
  CreateConnectorModalProps,
  GIT_TESTCONNECTION_STEP_INDEX
} from '@connectors/constants'
import ConnectorTestConnection from '@connectors/common/ConnectorTestConnection/ConnectorTestConnection'
import { useStrings } from 'framework/strings'
import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import DelegateSelectorStep from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import { buildBitbucketPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { ConnectivityModeType } from '@common/components/ConnectivityMode/ConnectivityMode'
import ConnectorDetailsStep from '../commonSteps/ConnectorDetailsStep'
import GitDetailsStep from '../commonSteps/GitDetailsStep'
import StepBitbucketAuthentication from './StepAuth/StepBitbucketAuthentication'
import ConnectivityModeStep from '../commonSteps/ConnectivityModeStep/ConnectivityModeStep'
import css from './CreateBitbucketConnector.module.scss'
const CreateBitbucketConnector = (props: CreateConnectorModalProps): JSX.Element => {
  const { getString } = useStrings()
  const commonProps = pick(props, [
    'isEditMode',
    'connectorInfo',
    'gitDetails',
    'setIsEditMode',
    'accountId',
    'orgIdentifier',
    'projectIdentifier',
    'connectivityMode',
    'setConnectivityMode'
  ])

  return (
    <StepWizard
      icon={getConnectorIconByType(Connectors.BITBUCKET)}
      iconProps={{ size: 50 }}
      className={css.bitbucketConnector}
      title={getString(getConnectorTitleIdByType(Connectors.BITBUCKET))}
    >
      <ConnectorDetailsStep
        type={Connectors.BITBUCKET}
        name={getString('overview')}
        isEditMode={props.isEditMode}
        connectorInfo={props.connectorInfo}
        gitDetails={props.gitDetails}
        mock={props.mock}
        helpPanelReferenceId="BitbucketConnectorOverview"
      />
      <GitDetailsStep
        type={Connectors.BITBUCKET}
        name={getString('details')}
        isEditMode={props.isEditMode}
        connectorInfo={props.connectorInfo}
        mock={props.mock}
        helpPanelReferenceId="BitbucketConnectorDetails"
      />
      <StepBitbucketAuthentication
        name={getString('credentials')}
        identifier={CONNECTOR_CREDENTIALS_STEP_IDENTIFIER}
        {...commonProps}
        onConnectorCreated={props.onSuccess}
        helpPanelReferenceId="BitbucketConnectorCredentials"
      />
      <ConnectivityModeStep
        name={getString('connectors.selectConnectivityMode')}
        type={Connectors.BITBUCKET}
        gitDetails={props.gitDetails}
        connectorInfo={props.connectorInfo}
        isEditMode={props.isEditMode}
        setIsEditMode={props.setIsEditMode}
        buildPayload={buildBitbucketPayload}
        connectivityMode={props.connectivityMode}
        setConnectivityMode={props.setConnectivityMode}
        hideModal={props.onClose}
        onConnectorCreated={props.onSuccess}
        helpPanelReferenceId="ConnectorConnectToTheProvider"
      />
      {props.connectivityMode === ConnectivityModeType.Delegate ? (
        <DelegateSelectorStep
          name={getString('delegate.DelegateselectionLabel')}
          isEditMode={props.isEditMode}
          setIsEditMode={props.setIsEditMode}
          buildPayload={buildBitbucketPayload}
          hideModal={props.onClose}
          onConnectorCreated={props.onSuccess}
          connectorInfo={props.connectorInfo}
          gitDetails={props.gitDetails}
          helpPanelReferenceId="ConnectorDelegatesSetup"
        />
      ) : null}
      <ConnectorTestConnection
        type={Connectors.BITBUCKET}
        name={getString('connectors.stepThreeName')}
        connectorInfo={props.connectorInfo}
        isStep={true}
        isLastStep={true}
        onClose={props.onClose}
        stepIndex={GIT_TESTCONNECTION_STEP_INDEX}
        helpPanelReferenceId="ConnectorTest"
      />
    </StepWizard>
  )
}

export default CreateBitbucketConnector
