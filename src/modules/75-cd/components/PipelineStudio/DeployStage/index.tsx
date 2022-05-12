/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { UseStringsReturn } from 'framework/strings'
import { StageType } from '@pipeline/utils/stageHelpers'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import type { StageAttributes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { DeployStage } from './DeployStage'

export const getStageAttributes = (getString: UseStringsReturn['getString']): StageAttributes => ({
  name: getString('pipelineSteps.deploy.create.deployStageName'),
  type: StageType.DEPLOY,
  icon: 'cd-main',
  iconColor: 'var(--pipeline-deploy-stage-color)',
  isApproval: false,
  openExecutionStrategy: true
})

export const getStageEditorImplementation = (isEnabled: boolean, getString: UseStringsReturn['getString']) => (
  <DeployStage
    icon={'cd-main'}
    hoverIcon={'deploy-stage'}
    iconsStyle={{ color: 'var(--pipeline-deploy-stage-color)' }}
    name={getString('pipelineSteps.deploy.create.deployStageName')}
    type={StageType.DEPLOY}
    title={getString('pipelineSteps.deploy.create.deployStageName')}
    description={getString('pipeline.pipelineSteps.deployStageDescription')}
    isHidden={!isEnabled}
    isDisabled={false}
    isApproval={false}
    isTemplateSupported={true}
  />
)

stagesCollection.registerStageFactory(StageType.DEPLOY, getStageAttributes, getStageEditorImplementation)
