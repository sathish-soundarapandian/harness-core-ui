/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { PipelineContextType } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'

export const isContextTypeNotStageTemplate = (contextType?: string) => contextType !== PipelineContextType.StageTemplate
export const isContextTypeNotStepGroupTemplate = (contextType?: string) =>
  contextType !== PipelineContextType.StepGroupTemplate

export const isContextTypeStageOrStepGroupTemplate = (contextType?: string) =>
  contextType === PipelineContextType.StageTemplate || contextType === PipelineContextType.StepGroupTemplate

export const isContextTypeTemplateType = (contextType?: string) =>
  contextType === PipelineContextType.PipelineTemplate || contextType === PipelineContextType.StageTemplate
