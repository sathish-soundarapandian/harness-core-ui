/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { cloneDeep, defaultTo, get, isEmpty, set } from 'lodash-es'
import React from 'react'
import produce from 'immer'
import ExecutionGraph, {
  ExecutionGraphAddStepEvent,
  ExecutionGraphEditStepEvent,
  ExecutionGraphRefObj
} from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraph'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { AdvancedPanels } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { useAddStepTemplate } from '@pipeline/hooks/useAddStepTemplate'
import type { BuildStageElementConfig, DeploymentStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { useStrings } from 'framework/strings'
import { STATIC_SERVICE_GROUP_NAME } from '@pipeline/utils/executionUtils'
import { StepType as StepsStepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { generateRandomString, StepType } from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraphUtil'
import { StageType } from '@pipeline/utils/stageHelpers'
import css from './PipelineStageNode.module.scss'

export default function StepsGraph({
  selectedStageId,
  isReadonly,
  type
}: {
  selectedStageId: string
  isReadonly: boolean
  type: StageType
}): JSX.Element {
  const { getString } = useStrings()
  const {
    state: {
      originalPipeline,
      pipelineView,
      selectionState: { selectedStepId },
      templateTypes,
      templateIcons
    },
    updateStage,
    getStageFromPipeline,
    updatePipelineView,
    setSelectedStepId
  } = usePipelineContext()

  const executionRef = React.useRef<ExecutionGraphRefObj | null>(null)
  const { addTemplate } = useAddStepTemplate({ executionRef: executionRef.current })
  const { stage: selectedStage } = getStageFromPipeline<DeploymentStageElementConfig>(defaultTo(selectedStageId, ''))

  const addLinkedTemplatesLabel = React.useMemo(() => {
    const isCustomDeploymentConfigPresent = !isEmpty(get(selectedStage, 'stage.spec.customDeploymentRef'))
    return isCustomDeploymentConfigPresent ? getString('common.deploymentTemplateSteps') : ''
  }, [selectedStage, getString])

  const originalStage = selectedStageId
    ? getStageFromPipeline<DeploymentStageElementConfig>(selectedStageId, originalPipeline).stage
    : undefined

  // NOTE: set empty arrays, required by ExecutionGraph for CI stage
  const selectedStageClone = cloneDeep(selectedStage)
  if (selectedStageClone) {
    if (!(selectedStageClone.stage as BuildStageElementConfig)?.spec?.serviceDependencies) {
      set(selectedStageClone, 'stage.spec.serviceDependencies', [])
    }
    if (!(selectedStageClone.stage as BuildStageElementConfig)?.spec?.execution?.steps) {
      set(selectedStageClone, 'stage.spec.execution.steps', [])
    }
  }

  const hiddenAdvancedPanels = React.useMemo(() => {
    return [StageType.FEATURE, StageType.BUILD].includes(type)
      ? [AdvancedPanels.PreRequisites, AdvancedPanels.DelegateSelectors]
      : [AdvancedPanels.PreRequisites]
  }, [type])

  const drawerDataType = React.useCallback(
    (stepType?: StepType): DrawerTypes => {
      return type === StageType.BUILD
        ? stepType === StepType.STEP
          ? DrawerTypes.StepConfig
          : DrawerTypes.ConfigureService
        : DrawerTypes.StepConfig
    },
    [type]
  )

  return (
    <ExecutionGraph
      allowAddGroup={type !== StageType.FEATURE}
      hasRollback={type === StageType.DEPLOY}
      isReadonly={isReadonly}
      hasDependencies={type === StageType.BUILD}
      addLinkedTemplatesLabel={addLinkedTemplatesLabel}
      ref={executionRef}
      templateTypes={templateTypes}
      templateIcons={templateIcons}
      originalStage={originalStage}
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      stage={selectedStage!} // for CI selectedStageClone
      updateStage={stageData => {
        const newData = produce(stageData, draft => {
          if (type === StageType.BUILD) {
            // cleanup rollbackSteps (note: rollbackSteps does not exist on CI stage at all)
            if ((draft?.stage as BuildStageElementConfig)?.spec?.execution?.rollbackSteps) {
              delete (draft.stage as BuildStageElementConfig)?.spec?.execution?.rollbackSteps
            }
            // delete serviceDependencies if its empty array (as serviceDependencies is optional)
            if (
              (draft?.stage as BuildStageElementConfig)?.spec?.serviceDependencies &&
              isEmpty((draft?.stage as BuildStageElementConfig)?.spec?.serviceDependencies)
            ) {
              delete (draft.stage as BuildStageElementConfig)?.spec?.serviceDependencies
            }
          }
        })

        if (newData.stage) updateStage(newData.stage)
      }}
      onAddStep={(event: ExecutionGraphAddStepEvent) => {
        if (event.parentIdentifier === STATIC_SERVICE_GROUP_NAME) {
          updatePipelineView({
            ...pipelineView,
            isDrawerOpened: true,
            drawerData: {
              type: DrawerTypes.ConfigureService,
              data: {
                stepConfig: {
                  node: {
                    type: StepsStepType.Dependency,
                    name: '',
                    identifier: generateRandomString(StepsStepType.Dependency)
                  },
                  stepsMap: event.stepsMap,
                  onUpdate: executionRef.current?.stepGroupUpdated,
                  addOrEdit: 'add',
                  isStepGroup: false,
                  hiddenAdvancedPanels: [AdvancedPanels.PreRequisites, AdvancedPanels.DelegateSelectors]
                }
              }
            }
          })
        } else {
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
                    isRollback: event.isRollback,
                    isParallelNodeClicked: event.isParallel,
                    hiddenAdvancedPanels: hiddenAdvancedPanels
                  }
                }
              }
            })
          }
        }
      }}
      onEditStep={(event: ExecutionGraphEditStepEvent) => {
        updatePipelineView({
          ...pipelineView,
          isDrawerOpened: true,
          drawerData: {
            type: drawerDataType(event.stepType),
            data: {
              stepConfig: {
                node: event.node as any,
                stepsMap: event.stepsMap,
                onUpdate: executionRef.current?.stepGroupUpdated,
                isStepGroup: event.isStepGroup,
                isUnderStepGroup: event.isUnderStepGroup,
                addOrEdit: event.addOrEdit,
                hiddenAdvancedPanels: hiddenAdvancedPanels
              }
            }
          }
        })
      }}
      onSelectStep={(stepId: string) => {
        setSelectedStepId(stepId)
      }}
      selectedStepId={selectedStepId}
      disableDragging
      hideGraphActions
      resetDefaultPosition
      canvasClassName={css.canvasClassName}
    />
  )
}
