/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { StepWizard } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { deploymentTypeIcon, deploymentTypeLabel, ServiceTypes } from '@pipeline/utils/DeploymentTypeUtils'
import type { ServiceDefinition } from 'services/cd-ng'
import ServiceHooksStore from './ServiceHooksSteps/ServiceHooksStore'

import css from '../ServiceHooks.module.scss'

interface StepChangeData<SharedObject> {
  prevStep?: number
  nextStep?: number
  prevStepData: SharedObject
}

export function ServiceHooksWizard({
  handleConnectorViewChange,
  handleStoreChange,
  initialValues,
  stores,
  expressions,
  allowableTypes,
  firstStep,
  lastSteps,
  deploymentType,
  isNewServiceHook,
  serviceHookIndex
}: any): React.ReactElement {
  const { getString } = useStrings()
  const onStepChange = /* istanbul ignore next */ (arg: StepChangeData<any>): void => {
    /* istanbul ignore next */
    if (arg?.prevStep && arg?.nextStep && arg.prevStep > arg.nextStep && arg.nextStep <= 1) {
      handleConnectorViewChange?.(false)
      handleStoreChange?.()
    }
  }

  return (
    <StepWizard
      className={css.serviceHooksWizard}
      onStepChange={onStepChange}
      icon={deploymentTypeIcon[deploymentType as ServiceTypes]}
      iconProps={{ size: 50, inverse: true }}
      title={`${
        deploymentType && getString(deploymentTypeLabel[deploymentType as ServiceDefinition['type']])
      } ${getString('pipeline.serviceHooks.label')}`}
    >
      {firstStep}
      <ServiceHooksStore
        serviceHooksStoreTypes={stores}
        name={getString('pipeline.serviceHooks.store')}
        stepName={getString('pipeline.serviceHooks.store')}
        allowableTypes={allowableTypes}
        initialValues={initialValues}
        handleStoreChange={handleStoreChange}
        expressions={expressions}
        handleConnectorViewChange={handleConnectorViewChange}
        isReadonly={false}
        isNewServiceHook={isNewServiceHook}
        serviceHookIndex={serviceHookIndex}
      />

      {/* istanbul ignore next */ lastSteps?.length && lastSteps.map((step: any) => step)}
    </StepWizard>
  )
}
