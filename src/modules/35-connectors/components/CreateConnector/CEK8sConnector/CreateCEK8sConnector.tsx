/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { StepWizard } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { getConnectorIconByType } from '@connectors/pages/connectors/utils/ConnectorHelper'
import { Connectors, CreateConnectorModalProps } from '@connectors/constants'
import VerifyOutOfClusterDelegate from '@connectors/common/VerifyOutOfClusterDelegate/VerifyOutOfClusterDelegate'
import DialogExtention from '@connectors/common/ConnectorExtention/DialogExtention'
import { CCM_CONNECTOR_SAVE_EVENT, CCM_CONNECTOR_SAVE_SUCCESS } from '@connectors/trackingConstants'
import { useTelemetry } from '@common/hooks/useTelemetry'
import OverviewStep from './OverviewStep'
import ProvidePermissions from './ProvidePermissions'
import FeatureSelectionStep from './FeatureSelectionStep'
import SecretCreationStep from './SecretCreationStep'
import css from './CEK8sConnector.module.scss'

const CreateCEK8sConnector: React.FC<CreateConnectorModalProps> = props => {
  const { getString } = useStrings()
  const { trackEvent } = useTelemetry()
  const [isOptimizationSelected, setIsOptimizationSelected] = useState<boolean>(false)
  return (
    <DialogExtention dialogStyles={{ width: 1159 }}>
      <StepWizard
        icon={getConnectorIconByType(Connectors.CE_KUBERNETES)}
        iconProps={{ size: 40 }}
        title={getString('pipelineSteps.kubernetesInfraStep.kubernetesConnector')}
        className={css.ceK8SConnector}
      >
        <OverviewStep
          type={Connectors.CE_KUBERNETES}
          name={getString('overview')}
          isEditMode={props.isEditMode}
          connectorInfo={props.connectorInfo}
        />
        <FeatureSelectionStep
          name="Feature Selection"
          isEditMode={props.isEditMode}
          handleOptimizationSelection={setIsOptimizationSelected}
        />
        {isOptimizationSelected ? <SecretCreationStep name="Secret Creation" /> : null}
        <ProvidePermissions {...props} name={'Provide permissions'} />
        <VerifyOutOfClusterDelegate
          name={getString('connectors.verifyConnection')}
          onClose={() => {
            trackEvent(CCM_CONNECTOR_SAVE_EVENT, { type: Connectors.CE_KUBERNETES })
            props.onClose()
          }}
          onTestConnectionSuccess={() => trackEvent(CCM_CONNECTOR_SAVE_SUCCESS, { type: Connectors.CE_KUBERNETES })}
          isStep
          isLastStep
          type={Connectors.CE_KUBERNETES}
          connectorInfo={props.connectorInfo}
        />
      </StepWizard>
    </DialogExtention>
  )
}

export default CreateCEK8sConnector
