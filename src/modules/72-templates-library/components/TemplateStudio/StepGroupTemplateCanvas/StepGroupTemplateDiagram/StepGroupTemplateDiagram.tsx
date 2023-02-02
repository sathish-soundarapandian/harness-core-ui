/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { set } from 'lodash-es'
import { ModalDialog } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'

import ExecutionGraph, {
  ExecutionGraphAddStepEvent,
  ExecutionGraphEditStepEvent,
  ExecutionGraphRefObj
} from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraph'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import {
  usePipelineContext,
  PipelineContextType
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { AdvancedPanels } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import type { StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import { useAddStepTemplate } from '@pipeline/hooks/useAddStepTemplate'
import { DefaultNewStageId } from '@templates-library/components/TemplateStudio/StageTemplateCanvas/StageTemplateForm/StageTemplateForm'
import { RightDrawer } from '@pipeline/components/PipelineStudio/RightDrawer/RightDrawer'
import { AddStageView } from '@pipeline/components/PipelineStages/views/AddStageView'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import type { PipelineStageProps } from '@pipeline/components/PipelineStages/PipelineStage'
import { StageType } from '@pipeline/utils/stageHelpers'
import { TemplateContext } from '../../TemplateContext/TemplateContext'

export function StepGroupTemplateDiagram(): React.ReactElement {
  const {
    state: {
      originalPipeline,
      pipelineView,
      selectionState: { selectedStageId = DefaultNewStageId, selectedStepId = '' },
      templateTypes,
      templateIcons
    },
    isReadonly,
    updateStage,
    updatePipelineView,
    getStageFromPipeline,
    setSelection
  } = usePipelineContext()

  const {
    state: { template },
    updateTemplate
  } = React.useContext(TemplateContext)

  const { getString } = useStrings()
  const { licenseInformation } = useLicenseStore()
  const { CDNG_ENABLED, CING_ENABLED, CFNG_ENABLED } = useFeatureFlags()
  const selectedStage = getStageFromPipeline(selectedStageId).stage
  const originalStage = getStageFromPipeline(selectedStageId, originalPipeline).stage
  const executionRef = React.useRef<ExecutionGraphRefObj | null>(null)
  const [stages, setStages] = React.useState<Array<PipelineStageProps>>([])

  const { addTemplate } = useAddStepTemplate({ executionRef: executionRef.current })

  React.useEffect(() => {
    const tempStages: PipelineStageProps[] = []
    tempStages.push(
      stagesCollection.getStage(StageType.DEPLOY, !!licenseInformation['CD'] && !!CDNG_ENABLED, getString)
        ?.props as PipelineStageProps
    )
    tempStages.push(
      stagesCollection.getStage(StageType.BUILD, !!licenseInformation['CI'] && !!CING_ENABLED, getString)
        ?.props as PipelineStageProps
    )

    tempStages.push(
      stagesCollection.getStage(StageType.FEATURE, !!licenseInformation['CF'] && !!CFNG_ENABLED, getString)
        ?.props as PipelineStageProps
    )

    tempStages.push(
      stagesCollection.getStage(StageType.SECURITY, licenseInformation['STO']?.status === 'ACTIVE', getString)
        ?.props as PipelineStageProps
    )
    tempStages.push(stagesCollection.getStage(StageType.APPROVAL, true, getString)?.props as PipelineStageProps)

    tempStages.push(stagesCollection.getStage(StageType.CUSTOM, true, getString)?.props as PipelineStageProps)

    setStages(tempStages)
  }, [stagesCollection])

  const onSelectStage = async (stageType: string): Promise<void> => {
    set(template, 'spec', {
      ...template.spec,
      stageType,
      steps: []
    })
    await updateTemplate(template)
  }

  React.useEffect(() => {
    setSelection({ stageId: DefaultNewStageId, stepId: undefined, sectionId: undefined })
  }, [])

  return (
    <>
      {!template?.spec?.stageType ? (
        <ModalDialog style={{ width: 700 }} enforceFocus={false} isOpen={true} isCloseButtonShown={false}>
          <AddStageView
            stages={stages}
            isParallel={true}
            contextType={PipelineContextType.StepGroupTemplate}
            callback={selectedType => {
              onSelectStage(selectedType)
            }}
            showCloseBtn={false}
          />
        </ModalDialog>
      ) : (
        <>
          <ExecutionGraph
            allowAddGroup={true}
            isReadonly={isReadonly}
            hasDependencies={false}
            ref={executionRef}
            hasRollback={false}
            templateTypes={templateTypes}
            templateIcons={templateIcons}
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
                setSelection({ stageId: DefaultNewStageId, stepId: 'random', sectionId: undefined })

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
              setSelection({ stageId: DefaultNewStageId, stepId, sectionId: undefined })
            }}
          />
          <RightDrawer />
        </>
      )}
    </>
  )
}
