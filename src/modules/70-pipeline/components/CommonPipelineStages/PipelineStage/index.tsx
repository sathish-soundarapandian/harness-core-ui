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
import { PipelineStage } from './PipelineStage'

const getStageAttributes = (_getString: UseStringsReturn['getString']): StageAttributes => ({
  name: 'Pipeline',
  type: StageType.PIPELINE,
  icon: 'pipeline',
  iconColor: 'var(--pipeline-blue-color)',
  isApproval: false,
  openExecutionStrategy: false
})

const getStageEditorImplementation = (isEnabled: boolean, _getString: UseStringsReturn['getString']): JSX.Element => (
  <PipelineStage
    icon={'chained-pipeline'}
    name={_getString('common.pipeline')}
    title={_getString('common.pipeline')}
    description={_getString('pipeline.pipelineSteps.chainedPipelineDescription')}
    type={StageType.PIPELINE}
    hoverIcon="chained-pipeline-hover"
    isDisabled={!isEnabled}
    isApproval={false}
  />
)

stagesCollection.registerStageFactory(StageType.PIPELINE, getStageAttributes, getStageEditorImplementation)
