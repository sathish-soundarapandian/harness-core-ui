/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'

export const DefaultNewStageName = 'Stage Name'
export const DefaultNewStageId = 'stage_name'

export const StageTemplateForm = () => {
  const {
    state: {
      selectionState: { selectedStageId }
    },
    contextType,
    renderPipelineStage,
    getStageFromPipeline
  } = usePipelineContext()
  const {
    state: {
      templateView: { isDrawerOpened }
    }
  } = React.useContext(TemplateContext)
  const selectedStage = getStageFromPipeline(selectedStageId || '')

  return (
    <Container background={Color.FORM_BG} height={'100%'}>
      {!isDrawerOpened &&
        renderPipelineStage({
          stageType: selectedStage?.stage?.stage?.type,
          minimal: false,
          contextType
        })}
    </Container>
  )
}
