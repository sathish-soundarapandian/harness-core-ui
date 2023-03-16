import React, { useState } from 'react'
import { get, set } from 'lodash-es'

import { AllowedTypesWithRunTime, MultiTypeInputType } from '@harness/uicore'
import type { DeploymentStageConfig } from 'services/cd-ng'

import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { getTemplatePath } from '@pipeline/components/PipelineStudio/StepUtil'
import { StageFormContextProvider } from '@pipeline/context/StageFormContext'

import SingleEnvironmentInputSetForm from '../../SingleEnvironmentInputSetForm'

const allowableTypes = [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION, MultiTypeInputType.EXECUTION_TIME]

export interface StageFormContextTestWrapperProps {
  path: string
  deploymentStage: DeploymentStageConfig
  deploymentStageTemplate: DeploymentStageConfig
  viewType: StepViewType
  stageIdentifier: string
}

export function StageFormContextTestWrapper({
  path,
  deploymentStage,
  deploymentStageTemplate,
  viewType,
  stageIdentifier
}: StageFormContextTestWrapperProps): React.ReactElement {
  const [stageFormTemplate, setStageFormTemplate] = useState<DeploymentStageConfig>(
    deploymentStageTemplate as DeploymentStageConfig
  )

  function getStageFormTemplate(pathToGet: string): DeploymentStageConfig {
    const templatePath = getTemplatePath(pathToGet, path)
    return get(stageFormTemplate, templatePath)
  }

  function updateStageFormTemplate(updatedData: DeploymentStageConfig, pathToUpdate: string): void {
    const templatePath = getTemplatePath(pathToUpdate, path)
    setStageFormTemplate(set(stageFormTemplate, templatePath, updatedData))
  }

  return (
    <StageFormContextProvider
      getStageFormTemplate={getStageFormTemplate as any}
      updateStageFormTemplate={updateStageFormTemplate as any}
    >
      <SingleEnvironmentInputSetForm
        deploymentStage={deploymentStage}
        deploymentStageTemplate={stageFormTemplate}
        path={path}
        allowableTypes={allowableTypes as AllowedTypesWithRunTime[]}
        viewType={viewType}
        stageIdentifier={stageIdentifier}
      />
    </StageFormContextProvider>
  )
}
