/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { StepWizard } from '@wings-software/uicore'
import { Connectors, CreateConnectorModalProps } from '@connectors/constants'
import { getConnectorIconByType, getConnectorTitleIdByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { useStrings } from 'framework/strings'
import DialogExtention from '@connectors/common/ConnectorExtention/DialogExtention'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { CCM_CONNECTOR_SAVE_EVENT, CCM_CONNECTOR_SAVE_SUCCESS } from '@connectors/trackingConstants'
import OverviewStep, { CEAwsConnectorDTO } from './steps/OverviewStep'
import CostUsageStep from './steps/CostUsageReport'
import CrossAccountRoleStep1 from './steps/CrossAccountRoleStep1'
import CrossAccountRoleStep2 from './steps/CrossAccountRoleStep2'
import css from './CreateCeAwsConnector.module.scss'

const CreateCeAwsConnector: React.FC<CreateConnectorModalProps> = props => {
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  return (
    <DialogExtention dialogStyles={{ width: 1190 }}>
      <StepWizard
        icon={getConnectorIconByType(Connectors.CEAWS)}
        iconProps={{ size: 40 }}
        title={getString(getConnectorTitleIdByType(Connectors.CEAWS))}
        className={css.awsConnector}
      >
        <OverviewStep
          name={getString('connectors.ceAws.steps.overview')}
          connectorInfo={props.connectorInfo as CEAwsConnectorDTO}
          isEditMode={props.isEditMode}
        />
        <CostUsageStep name={getString('connectors.ceAws.steps.cur')} />
        <CrossAccountRoleStep1 name={getString('connectors.ceAws.steps.req')} />
        <CrossAccountRoleStep2 name={getString('connectors.ceAws.steps.roleARN')} />
        <VerifyOutOfClusterDelegate
          name={getString('connectors.ceAws.testConnection.heading')}
          connectorInfo={props.connectorInfo}
          isStep={true}
          isLastStep={true}
          type={Connectors.CEAWS}
          onClose={() => {
            trackEvent(CCM_CONNECTOR_SAVE_EVENT, { type: Connectors.CEAWS })
            props.onClose?.()
          }}
          onTestConnectionSuccess={() => trackEvent(CCM_CONNECTOR_SAVE_SUCCESS, { type: Connectors.CEAWS })}
        />
      </StepWizard>
    </DialogExtention>
  )
}

export default CreateCeAwsConnector
