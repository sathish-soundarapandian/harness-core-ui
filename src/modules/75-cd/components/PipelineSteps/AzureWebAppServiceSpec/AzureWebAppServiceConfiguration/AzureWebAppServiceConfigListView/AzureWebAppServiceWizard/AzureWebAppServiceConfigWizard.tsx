/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { StepWizard } from '@wings-software/uicore'
import AzureWebAppServiceStepOne from './AzureWebAppServiceStepOne'
import type { ConnectorTypes, AzureWebAppServiceConfigWizardStepsProps } from '../../AzureWebAppServiceConfig.types'

import css from '../../AzureWebAppServiceConfig.module.scss'

export function AzureWebAppServiceConfigWizard<T>({
  handleConnectorViewChange,
  handleStoreChange,
  initialValues,
  expressions,
  allowableTypes,
  connectorTypes,
  newConnectorView,
  newConnectorSteps,
  lastSteps,
  isReadonly,
  labels
}: AzureWebAppServiceConfigWizardStepsProps<T>): React.ReactElement {
  /* istanbul ignore next */
  const handleStoreChangeRef = (arg: ConnectorTypes): void => {
    handleStoreChange?.(arg as unknown as T)
  }

  const firstStepName = labels?.firstStepName

  return (
    <StepWizard className={css.serviceConfigWizard} icon={'docs'} iconProps={{ size: 37 }} title={labels?.wizardName}>
      <AzureWebAppServiceStepOne
        name={firstStepName}
        key={firstStepName}
        title={labels.firstStepTitle}
        subtitle={labels.firstStepSubtitle}
        stepName={firstStepName}
        expressions={expressions}
        allowableTypes={allowableTypes}
        isReadonly={isReadonly}
        connectorTypes={connectorTypes}
        handleConnectorViewChange={() => handleConnectorViewChange(true)}
        handleStoreChange={handleStoreChangeRef}
        initialValues={initialValues}
      />
      {newConnectorView ? newConnectorSteps : null}

      {lastSteps ? lastSteps : null}
    </StepWizard>
  )
}
