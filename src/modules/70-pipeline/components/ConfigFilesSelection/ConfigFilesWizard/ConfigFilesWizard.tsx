/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { StepWizard } from '@harness/uicore'

import { useStrings } from 'framework/strings'
import type { ServiceDefinition } from 'services/cd-ng'
import { deploymentTypeIcon, deploymentTypeLabel, ServiceTypes } from '@pipeline/utils/DeploymentTypeUtils'
import ConfigFilesStore from './ConfigFilesSteps/ConfigFilesStore'
import css from './ConfigFilesWizard.module.scss'

interface StepChangeData<SharedObject> {
  prevStep?: number
  nextStep?: number
  prevStepData: SharedObject
}

export function ConfigFilesWizard(props: any): React.ReactElement {
  const {
    handleConnectorViewChange,
    handleStoreChange,
    initialValues,
    stores,
    expressions,
    allowableTypes,
    firstStep,
    lastSteps,
    deploymentType,
    configFileIndex,
    newConnectorView,
    newConnectorSteps,
    isEditMode
  } = props

  const { getString } = useStrings()

  const onStepChange = (arg: StepChangeData<any>): void => {
    if (arg.prevStepData?.store === 'Harness') {
      handleStoreChange?.(arg.prevStepData?.store)
      return
    }
    if (arg?.prevStep && arg?.nextStep && arg.prevStep > arg.nextStep && arg.nextStep <= 1) {
      handleStoreChange?.(arg.prevStepData?.store)
    }
  }

  const getInitialStepNumber = (): number | undefined => {
    if (isEditMode && !firstStep) {
      return 2
    }
  }

  return (
    <StepWizard
      className={css.configFileWizard}
      onStepChange={onStepChange}
      icon={deploymentTypeIcon[deploymentType as ServiceTypes]}
      iconProps={{ size: 50, inverse: true }}
      title={`${
        deploymentType && getString(deploymentTypeLabel[deploymentType as ServiceDefinition['type']])
      } ${getString('pipeline.configFiles.title', { type: 'Source' })}`}
      initialStep={getInitialStepNumber()}
    >
      {firstStep}
      <ConfigFilesStore
        configFilesStoreTypes={stores}
        name={getString('pipeline.configFiles.source')}
        stepName={getString('pipeline.configFiles.source')}
        allowableTypes={allowableTypes}
        initialValues={initialValues}
        handleStoreChange={handleStoreChange}
        expressions={expressions}
        handleConnectorViewChange={handleConnectorViewChange}
        isReadonly={false}
        configFileIndex={configFileIndex}
      />
      {newConnectorView ? newConnectorSteps : null}
      {lastSteps?.length ? lastSteps?.map((step: any) => step) : null}
    </StepWizard>
  )
}
