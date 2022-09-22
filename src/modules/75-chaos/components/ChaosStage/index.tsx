/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import type { UseStringsReturn } from 'framework/strings'
import { StageType } from '@pipeline/utils/stageHelpers'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import type { StageAttributes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import ChaosStage from './ChaosStage'

/* istanbul ignore next */
const getStageAttributes = (getString: UseStringsReturn['getString']): StageAttributes => ({
  name: getString('common.chaosText'),
  type: StageType.CHAOS,
  icon: 'chaos-main',
  iconColor: 'var(--pipeline-build-stage-color)',
  isApproval: false,
  openExecutionStrategy: false
})

/* istanbul ignore next */
const getStageEditorImplementation = (isEnabled: boolean, getString: UseStringsReturn['getString']): ReactElement => (
  <ChaosStage
    icon={'chaos-main'}
    hoverIcon={'chaos-main'}
    // iconsStyle={{ color: 'var(--pipeline-chaos-stage-color)' }}
    name={getString('common.chaosText')}
    type={StageType.CHAOS}
    title={getString('common.chaosText')}
    description={getString('pipeline.pipelineSteps.chaosStageDescription')}
    isDisabled={false}
    isHidden={!isEnabled}
    isApproval={false}
  />
)

export function registerChaosPipelineStage(): void {
  stagesCollection.registerStageFactory(StageType.FEATURE, getStageAttributes, getStageEditorImplementation)
}
