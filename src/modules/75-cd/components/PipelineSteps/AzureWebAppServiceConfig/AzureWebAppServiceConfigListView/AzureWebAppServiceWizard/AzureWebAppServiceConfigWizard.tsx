/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { StepWizard, StepProps, MultiTypeInputType } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import type { IconProps } from '@harness/icons'
import type { ConnectorConfigDTO } from 'services/cd-ng'
import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import AzureWebAppServiceStepOne from './AzureWebAppServiceStepOne'
import type { ConnectorTypes, WizardStepNames } from '../../AzureWebAppServiceConfig.types'

import css from '../../AzureWebAppServiceConfig.module.scss'

interface StepChangeData<SharedObject> {
  prevStep?: number
  nextStep?: number
  prevStepData: SharedObject
}

export interface AzureWebAppServiceConfigWizardInitData {
  connectorRef: string | undefined | ConnectorSelectedValue
  store: ConnectorTypes | string
}

interface ServiceConfigWizardStepsProps<T> {
  handleConnectorViewChange: (isConnectorView: boolean) => void
  initialValues: AzureWebAppServiceConfigWizardInitData
  newConnectorView: boolean
  expressions: string[]
  allowableTypes: MultiTypeInputType[]
  newConnectorSteps?: any
  lastSteps: Array<React.ReactElement<StepProps<ConnectorConfigDTO>>> | null
  iconsProps: IconProps
  isReadonly: boolean
  handleStoreChange: (store?: T) => void
  connectorTypes: any
  labels: WizardStepNames
}

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
}: ServiceConfigWizardStepsProps<T>): React.ReactElement {
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
      className={css.serviceConfigWizard}
      onStepChange={onStepChange}
      icon={'audit-trail'}
      iconProps={{
        color: Color.WHITE,
        size: 37
      }}
      title={labels?.wizardName}
    >
      <AzureWebAppServiceStepOne
        name={labels?.firstStepName}
        title={labels?.firstStepName}
        stepName={labels?.firstStepName}
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
