/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { SelectOption } from '@wings-software/uicore'
import { Intent } from '@harness/design-system'
import { defaultTo, keyBy } from 'lodash-es'
import { Tooltip } from '@blueprintjs/core'
import InfoStrip from '@common/components/InfoStrip/InfoStrip'
import { StageType } from '@pipeline/utils/stageHelpers'
import type {
  PipelineInfoConfig,
  ResponseInputSetTemplateWithReplacedExpressionsResponse,
  StageExecutionResponse
} from 'services/pipeline-ng'
import type { StringsMap } from 'stringTypes'
import { getFlattenedStages } from '../PipelineStudio/StageBuilder/StageBuilderUtil'
import css from './RunPipelineForm.module.scss'

interface SelectedStageData {
  stageIdentifier?: string
  stagesRequired?: string[]
  stageName?: string
  message?: string
}

interface StageSelectionData {
  selectedStages: SelectedStageData[]
  allStagesSelected: boolean
  selectedStageItems: SelectOption[]
}
function ApprovalStageInfo({
  pipeline,
  selectedStageData
}: {
  pipeline?: PipelineInfoConfig
  selectedStageData: StageSelectionData
}): React.ReactElement | null {
  let oneOrMoreApprovalStages = false
  const allStages = getFlattenedStages(pipeline as PipelineInfoConfig)
  let approvalStageIndex = -1
  oneOrMoreApprovalStages = selectedStageData.selectedStages.every((stageData: SelectedStageData, index: number) => {
    const currStage = allStages.stages.find(stage => {
      return stage?.stage?.identifier === stageData?.stageIdentifier
    })
    if (currStage?.stage?.type === StageType.APPROVAL) {
      approvalStageIndex = index
      return true
    }
    return false
  })

  return oneOrMoreApprovalStages ? (
    <InfoStrip
      intent={Intent.WARNING}
      content={selectedStageData.selectedStages?.[approvalStageIndex]?.message as string}
    />
  ) : null
}
function RequiredStagesInfo({
  selectedStageData,
  blockedStagesSelected,
  getString
}: {
  selectedStageData: StageSelectionData
  blockedStagesSelected: boolean
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
}): React.ReactElement | null {
  const stagesSelectedMap: { [key: string]: SelectedStageData } = keyBy(
    selectedStageData.selectedStages,
    'stageIdentifier'
  )
  const stagesErrorInfo: React.ReactElement[] = []
  selectedStageData.selectedStages?.forEach((stage: StageExecutionResponse) => {
    if (stage.toBeBlocked && !stagesSelectedMap[defaultTo(stage?.stagesRequired?.[0], '')]) {
      stagesErrorInfo.push(
        <li key={stage.stageIdentifier}>
          {getString('pipeline.stageDependencyError', {
            dependentStage: defaultTo(stage?.stagesRequired?.[0], ''),
            stageId: stage.stageIdentifier
          })}
        </li>
      )
    }
  })
  return blockedStagesSelected && !selectedStageData.allStagesSelected ? (
    <InfoStrip
      intent={Intent.DANGER}
      content={
        <Tooltip
          portalClassName={css.expressionsTooltip}
          usePortal
          content={<ul className={css.error}>{stagesErrorInfo}</ul>}
        >
          {getString('pipeline.runstageError', { count: stagesErrorInfo.length })}
        </Tooltip>
      }
    />
  ) : null
}
function ExpressionsInfo({
  template,
  getString
}: {
  template: ResponseInputSetTemplateWithReplacedExpressionsResponse | null
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
}): React.ReactElement | null {
  return (template?.data as any)?.replacedExpressions?.length > 0 ? (
    <InfoStrip
      intent={Intent.PRIMARY}
      content={
        <div>
          <Tooltip
            usePortal
            portalClassName={css.expressionsTooltip}
            content={
              <ul>
                {(template?.data as any)?.replacedExpressions.map((expr: string) => (
                  <li key={expr}>{expr}</li>
                ))}
              </ul>
            }
          >
            {getString('pipeline.expressionsReplaced', {
              count: (template?.data as any)?.replacedExpressions.length
            })}
          </Tooltip>
        </div>
      }
    />
  ) : null
}
export { ApprovalStageInfo, RequiredStagesInfo, ExpressionsInfo }
