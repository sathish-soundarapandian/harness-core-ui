/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { StepWizard } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { getIconAndTitleByDeploymentType } from '../ConfigFilesHelper'
import ConfigFilesStore from './ConfigFilesSteps/ConfigFilesStore'

import css from './ConfigFilesWizard.module.scss'

interface StepChangeData<SharedObject> {
  prevStep?: number
  nextStep?: number
  prevStepData: SharedObject
}

export function ConfigFilesWizard({
  handleConnectorViewChange,
  handleStoreChange,
  initialValues,
  types,
  expressions,
  allowableTypes,
  //   manifestStoreTypes,
  //   labels,
  selectedConfigFile,
  newConnectorView,
  newConnectorSteps,
  lastSteps,
  //   changeConfigFileType,
  //   iconsProps,
  //   isReadonly,
  deploymentType,
  isNewFile
}: any): React.ReactElement {
  const { getString } = useStrings()
  const onStepChange = (arg: StepChangeData<any>): void => {
    if (arg?.prevStep && arg?.nextStep && arg.prevStep > arg.nextStep && arg.nextStep <= 1) {
      handleConnectorViewChange(false)
      handleStoreChange()
    }
  }

  const ConfigWizard = getIconAndTitleByDeploymentType(deploymentType)

  return (
    <StepWizard
      className={css.configFileWizard}
      onStepChange={onStepChange}
      icon={ConfigWizard.icon}
      title={`${ConfigWizard.label} ${getString('pipeline.configFiles.title')}`}
      initialStep={1}
    >
      <ConfigFilesStore
        configFilesStoreTypes={types}
        name={getString('pipeline.configFiles.source')}
        stepName={getString('pipeline.configFiles.source')}
        // name={'Config File Details'}
        // stepName={'Config File Details'}
        // selectedConfigFile={selectedConfigFile}
        allowableTypes={allowableTypes}
        initialValues={initialValues}
        handleStoreChange={handleStoreChange}
        expressions={expressions}
        handleConnectorViewChange={handleConnectorViewChange}
        isReadonly={false}
        isNewFile={isNewFile}
      />

      {/* {newConnectorView ? newConnectorSteps : null} */}

      {lastSteps?.length ? lastSteps?.map((step: any) => step) : null}
    </StepWizard>
  )
}
