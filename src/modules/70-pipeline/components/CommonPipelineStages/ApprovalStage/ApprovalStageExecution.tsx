/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import ExecutionGraph, {
  ExecutionGraphAddStepEvent,
  ExecutionGraphEditStepEvent,
  ExecutionGraphRefObj
} from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraph'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { AdvancedPanels } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import type { StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import { useAddStepTemplate } from '@pipeline/hooks/useAddStepTemplate'

export function ApprovalStageExecution(): React.ReactElement {
  const {
    state: {
      originalPipeline,
      pipelineView,
      selectionState: { selectedStageId = '', selectedStepId = '' },
      templateTypes
    },
    isReadonly,
    stepsFactory,
    updateStage,
    updatePipelineView,
    getStageFromPipeline,
    setSelectedStepId,
    getStagePathFromPipeline
  } = usePipelineContext()
  const selectedStage = getStageFromPipeline(selectedStageId).stage
  const originalStage = getStageFromPipeline(selectedStageId, originalPipeline).stage
  const executionRef = React.useRef<ExecutionGraphRefObj | null>(null)
  const { addTemplate } = useAddStepTemplate({ executionRef: executionRef.current })
  const stagePath = getStagePathFromPipeline(selectedStageId || '', 'pipeline.stages')
  return (
    <ExecutionGraph
      allowAddGroup={true}
      isReadonly={isReadonly}
      hasDependencies={false}
      stepsFactory={stepsFactory}
      ref={executionRef}
      hasRollback={false}
      pathToStage={`${stagePath}.stage.spec.execution`}
      templateTypes={templateTypes}
      selectedStepId={selectedStepId}
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      stage={selectedStage!}
      originalStage={originalStage}
      updateStage={(stageData: StageElementWrapper) => {
        if (stageData.stage) updateStage(stageData.stage)
      }}
      onAddStep={(event: ExecutionGraphAddStepEvent) => {
        if (event.isTemplate) {
          addTemplate(event)
        } else {
          updatePipelineView({
            ...pipelineView,
            isDrawerOpened: true,
            drawerData: {
              type: DrawerTypes.AddStep,
              data: {
                paletteData: {
                  entity: event.entity,
                  stepsMap: event.stepsMap,
                  onUpdate: executionRef.current?.stepGroupUpdated,
                  isRollback: false,
                  isParallelNodeClicked: event.isParallel,
                  hiddenAdvancedPanels: [AdvancedPanels.PreRequisites]
                }
              }
            }
          })
        }
      }}
      onEditStep={(event: ExecutionGraphEditStepEvent) => {
        updatePipelineView({
          ...pipelineView,
          isDrawerOpened: true,
          drawerData: {
            type: DrawerTypes.StepConfig,
            data: {
              stepConfig: {
                node: event.node as any,
                stepsMap: event.stepsMap,
                onUpdate: executionRef.current?.stepGroupUpdated,
                isStepGroup: event.isStepGroup,
                isUnderStepGroup: event.isUnderStepGroup,
                addOrEdit: event.addOrEdit,
                hiddenAdvancedPanels: [AdvancedPanels.PreRequisites]
              }
            }
          }
        })
      }}
      onSelectStep={(stepId: string) => {
        setSelectedStepId(stepId)
      }}
    />
  )
}
