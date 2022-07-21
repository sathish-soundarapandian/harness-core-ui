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
import type { PipelineStageProps } from '@pipeline/components/PipelineStages/PipelineStage'
import { ApprovalStage } from './ApprovalStage'

const getStageAttributes = (_getString: UseStringsReturn['getString']): StageAttributes => ({
  name: 'Approval',
  type: StageType.APPROVAL,
  icon: 'approval-stage-icon',
  iconColor: 'var(--pipeline-approval-stage-color)',
  isApproval: true,
  openExecutionStrategy: false
})

const getStageEditorImplementation = (
  isEnabled: boolean,
  _getString: UseStringsReturn['getString']
): React.ReactElement<PipelineStageProps> => (
  <ApprovalStage
    icon={'approval-stage-icon'}
    name={'Approval'}
    hoverIcon={'approval-stage'}
    title={_getString('approvalStage.title')}
    description={_getString('pipeline.pipelineSteps.approvalStageDescription')}
    type={StageType.APPROVAL}
    iconsStyle={{ color: 'var(--pipeline-approval-stage-color)' }}
    isDisabled={!isEnabled}
    isApproval={true}
  />
)

stagesCollection.registerStageFactory(StageType.APPROVAL, getStageAttributes, getStageEditorImplementation)
