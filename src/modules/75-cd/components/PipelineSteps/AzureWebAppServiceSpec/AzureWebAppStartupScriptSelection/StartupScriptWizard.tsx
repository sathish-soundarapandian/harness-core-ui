/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { StepWizard } from '@harness/uicore'
import { useStrings, UseStringsReturn } from 'framework/strings'
import { ServiceDeploymentType } from '@pipeline/utils/stageHelpers'
import type { ServiceDefinition } from 'services/cd-ng'
import type { ConnectorTypes, StartupScriptWizardStepsProps } from './StartupScriptInterface.types'
import StartupScriptWizardStepOne from './StartupScriptWizardStepOne'
import css from './StartupScriptSelection.module.scss'

const getDeploymentTypeStrings = (
  deploymentType: ServiceDefinition['type'],
  getString: UseStringsReturn['getString']
): Record<string, string> => {
  switch (deploymentType) {
    case ServiceDeploymentType.Elastigroup:
      return {
        title: getString('pipeline.startup.script.name'),
        stepName: getString('pipeline.startup.script.fileSource'),
        stepSubtitle: getString('pipeline.startup.script.subtitle', {
          deploymentType: getString('pipeline.serviceDeploymentTypes.spotElastigroup')
        })
      }
    default:
      return {
        title: getString('pipeline.startup.command.name'),
        stepName: getString('pipeline.startup.command.fileSource'),
        stepSubtitle: getString('pipeline.startup.command.subtitle', {
          deploymentType: getString('cd.steps.azureWebAppInfra.azureWebApp')
        })
      }
  }
}

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
  deploymentType,
  isReadonly
}: StartupScriptWizardStepsProps<T>): React.ReactElement {
  const { getString } = useStrings()

  const handleStoreChangeRef = (arg: ConnectorTypes): void => {
    handleStoreChange?.(arg as unknown as T)
  }

  const { title, stepName, stepSubtitle } = getDeploymentTypeStrings(deploymentType, getString)

  return (
    <StepWizard
      className={css.startupScriptWizard}
      icon={'docs'}
      iconProps={{
        size: 37
      }}
      title={title}
    >
      <StartupScriptWizardStepOne
        name={getString('pipeline.fileSource')}
        stepName={stepName}
        stepSubtitle={stepSubtitle}
        key={stepSubtitle}
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
