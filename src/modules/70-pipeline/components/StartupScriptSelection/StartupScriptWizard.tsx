/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { StepWizard, StepProps, MultiTypeInputType } from '@wings-software/uicore'
import type { IconProps } from '@harness/icons'
import { useStrings } from 'framework/strings'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import type { ConnectorTypes } from './StartupScriptInterface.types'
import StartupScriptWizardStepOne from './StartupScriptWizardStepOne'
import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'

import css from '../ManifestSelection/ManifestWizard/ManifestWizard.module.scss'

interface StepChangeData<SharedObject> {
  prevStep?: number
  nextStep?: number
  prevStepData: SharedObject
}

interface StartupScriptWizardInitData {
  connectorRef: string | undefined | ConnectorSelectedValue
  store: ConnectorTypes | string
}

interface ManifestWizardStepsProps<T> {
  handleConnectorViewChange: (isConnectorView: boolean) => void
  initialValues: StartupScriptWizardInitData
  newConnectorView: boolean
  expressions: string[]
  allowableTypes: MultiTypeInputType[]
  newConnectorSteps?: any
  lastSteps: Array<React.ReactElement<StepProps<ConnectorConfigDTO>>> | null
  iconsProps: IconProps
  isReadonly: boolean
  handleStoreChange: (store?: T) => void
  connectorTypes: any
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
  isReadonly
}: ManifestWizardStepsProps<T>): React.ReactElement {
  const { getString } = useStrings()
  const onStepChange = (arg: StepChangeData<any>): void => {
    if (arg?.prevStep && arg?.nextStep && arg.prevStep > arg.nextStep && arg.nextStep <= 2) {
      handleConnectorViewChange(false)
      handleStoreChange()
    }
  }

  /* istanbul ignore next */
  const handleStoreChangeRef = (arg: ConnectorTypes): void => {
    handleStoreChange?.(arg as unknown as T)
  }

  return (
    <StepWizard
      className={css.manifestWizard}
      subtitle={'Subtitle'}
      onStepChange={onStepChange}
    >
      <StartupScriptWizardStepOne
        name={getString('pipeline.startupScript.fileSource')}
        stepName={getString('pipeline.startupScript.fileSource')}
        expressions={expressions}
        allowableTypes={allowableTypes}
        isReadonly={isReadonly}
        connectorTypes={connectorTypes}
        handleConnectorViewChange={() => handleConnectorViewChange(true)}
        handleStoreChange={handleStoreChangeRef}
        initialValues={initialValues}
      />
      {newConnectorView ? newConnectorSteps : null}

      {lastSteps?.length ? lastSteps?.map(step => step) : null}
    </StepWizard>
  )
}
