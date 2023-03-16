/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StepWhenCondition } from 'services/cd-ng'

export type WhenConditionStatus = StepWhenCondition['stageStatus']

export enum PipelineOrStageStatus {
  SUCCESS = 'Success',
  ALL = 'All',
  FAILURE = 'Failure'
}

export interface ConditionalExecutionConfig {
  status: WhenConditionStatus
  condition: string
}

export const ModeEntityNameMap = {
  STAGE: 'stage',
  STEP_GROUP: 'step group',
  STEP: 'step'
}

export const ParentModeEntityNameMap = {
  STAGE: 'pipeline',
  STEP_GROUP: 'stage',
  STEP: 'stage'
}

export const statusToStatusMapping: any = {
  OnPipelineSuccess: PipelineOrStageStatus.SUCCESS,
  OnStageSuccess: PipelineOrStageStatus.SUCCESS,
  OnPipelineFailure: PipelineOrStageStatus.FAILURE,
  OnStageFailure: PipelineOrStageStatus.FAILURE,
  Always: PipelineOrStageStatus.ALL
}
