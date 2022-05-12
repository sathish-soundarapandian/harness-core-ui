/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo, isEqual } from 'lodash-es'
import { parse } from 'yaml'
import produce from 'immer'
import { useCallback } from 'react'
import type { StageElementConfig } from 'services/cd-ng'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useTemplateSelector } from '@pipeline/utils/useTemplateSelector'
import { createTemplate, getStageType } from '@pipeline/utils/templateUtils'
import { getIdentifierFromValue } from '@common/components/EntityReference/EntityReference'

interface TemplateActionsReturnType {
  addOrUpdateTemplate: () => Promise<void>
  removeTemplate: () => Promise<void>
}

export function useStageTemplateActions(): TemplateActionsReturnType {
  const {
    state: {
      selectionState: { selectedStageId = '' },
      templateTypes
    },
    updateStage,
    getStageFromPipeline
  } = usePipelineContext()
  const { stage } = getStageFromPipeline(selectedStageId)
  const { getTemplate } = useTemplateSelector()

  const addOrUpdateTemplate = useCallback(async () => {
    try {
      const { template, isCopied } = await getTemplate({
        templateType: 'Stage',
        selectedChildType: getStageType(stage?.stage, templateTypes),
        ...(stage?.stage?.template && {
          selectedTemplateRef: getIdentifierFromValue(stage.stage.template.templateRef),
          selectedVersionLabel: stage.stage.template.versionLabel
        })
      })
      const node = stage?.stage
      if (
        !isCopied &&
        isEqual(node?.template?.templateRef, template.identifier) &&
        isEqual(node?.template?.versionLabel, template.versionLabel)
      ) {
        return
      }
      const processNode = isCopied
        ? produce(defaultTo(parse(template?.yaml || '')?.template.spec, {}) as StageElementConfig, draft => {
            draft.name = defaultTo(node?.name, '')
            draft.identifier = defaultTo(node?.identifier, '')
          })
        : createTemplate(node, template)
      await updateStage(processNode)
    } catch (_) {
      // Do nothing.. user cancelled template selection
    }
  }, [stage?.stage, templateTypes, getTemplate, updateStage])

  const removeTemplate = useCallback(async () => {
    const node = stage?.stage
    const processNode = produce({} as StageElementConfig, draft => {
      draft.name = defaultTo(node?.name, '')
      draft.identifier = defaultTo(node?.identifier, '')
      draft.type = getStageType(node, templateTypes)
    })
    await updateStage(processNode)
  }, [stage?.stage, templateTypes, updateStage])

  return { addOrUpdateTemplate, removeTemplate }
}
