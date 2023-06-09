/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import stableStringify from 'fast-json-stable-stringify'
import type { PipelineStageWrapper } from '@pipeline/utils/pipelineTypes'
import type { PipelineInfoConfig, StageElementConfig, StageElementWrapperConfig } from 'services/pipeline-ng'

export function getStageFromPipeline<T extends StageElementConfig = StageElementConfig>(
  stageId: string,
  localPipeline: PipelineInfoConfig
): PipelineStageWrapper<T> {
  let stage: StageElementWrapperConfig | undefined = undefined
  let parent: StageElementWrapperConfig | undefined = undefined
  const stages = localPipeline?.template
    ? (localPipeline.template.templateInputs as PipelineInfoConfig)?.stages
    : localPipeline?.stages
  if (stages) {
    stages.some?.(item => {
      if (item?.stage && item.stage.identifier === stageId) {
        stage = item
        return true
      } else if (item?.parallel) {
        stage = getStageFromPipeline(stageId, { stages: item.parallel } as unknown as PipelineInfoConfig).stage
        if (stage) {
          parent = item
          return true
        }
      }
    })
  }
  return { stage, parent }
}

export function getStagePathFromPipeline(stageId: string, prefix: string, pipeline: PipelineInfoConfig): string {
  if (Array.isArray(pipeline.stages)) {
    for (let i = 0; i < pipeline.stages.length; i++) {
      const item = pipeline.stages[i]

      if (item?.stage?.identifier === stageId) {
        return `${prefix}.${i}`
      }

      if (item.parallel) {
        const parallelIndex = item.parallel.findIndex(parallelStage => parallelStage.stage?.identifier === stageId)
        if (parallelIndex !== -1) {
          return `${prefix}.${i}.parallel.${parallelIndex}`
        }
      }

      if (item.stage) {
        const stagePath = getStagePathFromPipeline(stageId, `${prefix}.${i}`, item.stage)
        if (stagePath !== `${prefix}.${i}`) {
          return stagePath
        }
      }
    }
  }

  return prefix
}

export function comparePipelines(
  pipeline1: PipelineInfoConfig | undefined,
  pipeline2: PipelineInfoConfig | undefined
): boolean {
  return stableStringify(pipeline1) !== stableStringify(pipeline2)
}
