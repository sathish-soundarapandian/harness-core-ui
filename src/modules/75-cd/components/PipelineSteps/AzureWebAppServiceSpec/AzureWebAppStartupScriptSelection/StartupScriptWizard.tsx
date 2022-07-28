/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { StepWizard } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { ConnectorTypes, StartupScriptWizardStepsProps } from './StartupScriptInterface.types'
import StartupScriptWizardStepOne from './StartupScriptWizardStepOne'

import css from './StartupScriptSelection.module.scss'

export function StartupScriptWizard<T>({
  handleConnectorViewChange,
  handleStoreChange,
  initialValues,
  expressions,
  allowableTypes,
  connectorTypes,
  newConnectorView,
  newConnectorSteps,
  lastSteps,
  isReadonly
}: StartupScriptWizardStepsProps<T>): React.ReactElement {
  const { getString } = useStrings()

  const handleStoreChangeRef = (arg: ConnectorTypes): void => {
    handleStoreChange?.(arg as unknown as T)
  }

  return (
    <StepWizard
      className={css.startupScriptWizard}
      icon={'docs'}
      iconProps={{
        size: 37
      }}
      title={getString('pipeline.startupCommand.name')}
    >
      <StartupScriptWizardStepOne
        name={getString('pipeline.fileSource')}
        stepName={getString('pipeline.startupCommand.fileSource')}
        key={getString('pipeline.startupCommand.fileSource')}
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
