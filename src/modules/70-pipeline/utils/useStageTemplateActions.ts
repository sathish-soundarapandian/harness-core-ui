/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { cloneDeep, defaultTo } from 'lodash-es'
import produce from 'immer'
import { useCallback, useState } from 'react'
import type { StageElementConfig } from 'services/cd-ng'
import { parse } from '@common/utils/YamlHelperMethods'
import { removeNodeFromPipeline } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { createTemplate, getStageType } from '@pipeline/utils/templateUtils'
import type { TemplateSummaryResponse } from 'services/template-ng'
import { useTemplateSelector } from 'framework/Templates/TemplateSelectorContext/useTemplateSelector'

interface TemplateActionsReturnType {
  addOrUpdateTemplate: (selectedTemplate?: TemplateSummaryResponse) => Promise<void>
  removeTemplate: () => Promise<void>
  isTemplateUpdated: boolean
  setIsTemplateUpdated(isTemplateUpdated: boolean): void
}

export function useStageTemplateActions(): TemplateActionsReturnType {
  const {
    state: {
      selectionState: { selectedStageId = '' },
      templateTypes,
      gitDetails,
      storeMetadata,
      pipeline
    },
    updateStage,
    updatePipeline,
    getStageFromPipeline
  } = usePipelineContext()
  const { stage } = getStageFromPipeline(selectedStageId)
  const { getTemplate } = useTemplateSelector()

  const [isTemplateUpdated, setIsTemplateUpdated] = useState(false)

  const addOrUpdateTemplate = useCallback(
    async (selectedTemplate?: TemplateSummaryResponse) => {
      try {
        const { template, isCopied } = await getTemplate({
          templateType: 'Stage',
          filterProperties: {
            childTypes: [getStageType(stage?.stage, templateTypes)]
          },
          selectedTemplate,
          gitDetails,
          storeMetadata
        })

        const node = stage?.stage
        const processNode = isCopied
          ? produce(defaultTo(parse<any>(template?.yaml || '')?.template.spec, {}) as StageElementConfig, draft => {
              draft.name = defaultTo(node?.name, '')
              draft.identifier = defaultTo(node?.identifier, '')
            })
          : createTemplate(node, template)
        await updateStage(processNode)
        setIsTemplateUpdated(true)
      } catch (_) {
        // user cancelled template selection
        if (isTemplateUpdated) {
          setIsTemplateUpdated(false)
        }
      }
    },
    [getTemplate, stage?.stage, templateTypes, gitDetails, storeMetadata, updateStage]
  )

  const removeTemplate = useCallback(async () => {
    const stageIdentifierToBeDeleted = stage?.stage?.identifier
    if (stageIdentifierToBeDeleted) {
      const clonedPipeline = cloneDeep(pipeline)
      const stageToBeDelete = getStageFromPipeline(stageIdentifierToBeDeleted, clonedPipeline)
      const isRemoved = removeNodeFromPipeline(stageToBeDelete, clonedPipeline)
      if (isRemoved) {
        await updatePipeline(clonedPipeline)
      }
    }
  }, [stage?.stage, updatePipeline, pipeline])

  return { addOrUpdateTemplate, removeTemplate, isTemplateUpdated, setIsTemplateUpdated }
}
