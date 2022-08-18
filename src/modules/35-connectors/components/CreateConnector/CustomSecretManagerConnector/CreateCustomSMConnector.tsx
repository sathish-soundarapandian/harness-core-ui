/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { StepWizard } from '@wings-software/uicore'
import { pick } from 'lodash-es'
import type {
  GetTemplateProps,
  GetTemplateResponse
} from 'framework/Templates/TemplateSelectorContext/useTemplateSelector'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import { Connectors, CreateConnectorModalProps, TESTCONNECTION_STEP_INDEX } from '@connectors/constants'
import { getConnectorTitleIdByType, getConnectorIconByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { buildCustomSMPayload } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { useStrings } from 'framework/strings'
import ConnectorDetailsStep from '../commonSteps/ConnectorDetailsStep'
import DelegateSelectorStep from '../commonSteps/DelegateSelectorStep/DelegateSelectorStep'
import CustomSMConfigStep from './views/CustomSMConfigStep'

const CreateCustomSMConnector: React.FC<CreateConnectorModalProps> = props => {
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
      icon={getConnectorIconByType(Connectors.CUSTOM_SECRET_MANAGER)}
      iconProps={{ size: 50, color: 'white' }}
      title={getString(getConnectorTitleIdByType(Connectors.CUSTOM_SECRET_MANAGER))}
    >
      <ConnectorDetailsStep
        type={Connectors.CUSTOM_SECRET_MANAGER}
        name={getString('overview')}
        isEditMode={props.isEditMode}
        connectorInfo={props.connectorInfo}
        gitDetails={props.gitDetails}
        mock={props.mock}
        helpPanelReferenceId="CustomSecretManagerOverview"
      />
      <CustomSMConfigStep
        name={getString('details')}
        hideModal={props.onClose}
        getTemplate={props.getTemplate as (data: GetTemplateProps) => Promise<GetTemplateResponse>}
        {...commonProps}
      />

      <DelegateSelectorStep
        name={getString('delegate.DelegateselectionLabel')}
        isEditMode={props.isEditMode}
        setIsEditMode={props.setIsEditMode}
        buildPayload={buildCustomSMPayload}
        onConnectorCreated={props.onSuccess}
        connectorInfo={props.connectorInfo}
        gitDetails={props.gitDetails}
        hideModal={props.onClose}
        helpPanelReferenceId="ConnectorDelegatesSetup"
      />
      <VerifyOutOfClusterDelegate
        name={getString('connectors.stepThreeName')}
        connectorInfo={props.connectorInfo}
        isStep
        isLastStep={true}
        type={Connectors.CUSTOM_SECRET_MANAGER}
        onClose={props.onClose}
        setIsEditMode={props.setIsEditMode}
        stepIndex={TESTCONNECTION_STEP_INDEX}
        helpPanelReferenceId="ConnectorTest"
      />
    </StepWizard>
  )
}

export default CreateCustomSMConnector
