/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, render, fireEvent } from '@testing-library/react'
import produce from 'immer'
import { set } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import { getTemplateContextMock } from '@templates-library/components/TemplateStudio/__tests__/stateMock'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { StageTemplateCanvasWrapperWithRef } from '../StageTemplateCanvasWrapper'

jest.mock('@templates-library/components/TemplateStudio/StageTemplateCanvas/StageTemplateCanvas', () => ({
  ...jest.requireActual('@templates-library/components/TemplateStudio/StageTemplateCanvas/StageTemplateCanvas'),
  StageTemplateCanvas: () => {
    const {
      state: { pipeline },
      updatePipeline
    } = usePipelineContext()
    return (
      <div className="stage-template-canvas-mock">
        <button
          onClick={() => {
            const updatedPipeline = produce(pipeline, draft => {
              set(draft, 'stages[0].stage.spec.serviceConfig.serviceRef', 'another_service')
            })
            updatePipeline(updatedPipeline)
          }}
        >
          Update Pipeline
        </button>
      </div>
    )
  }
}))

describe('<StageTemplateCanvasWrapper /> tests', () => {
  test('should call updateTemplate with updated template', async () => {
    const templateContext = getTemplateContextMock(TemplateType.Pipeline)
    const { getByRole } = render(
      <TestWrapper>
        <TemplateContext.Provider value={templateContext}>
          <StageTemplateCanvasWrapperWithRef />
        </TemplateContext.Provider>
      </TestWrapper>
    )
    const updatePipelineButton = getByRole('button', { name: 'Update Pipeline' })
    await act(async () => {
      fireEvent.click(updatePipelineButton)
    })
    const updatedTemplate = produce(templateContext.state.template, draft => {
      set(draft, 'spec.spec.serviceConfig.serviceRef', 'another_service')
    })
    expect(templateContext.updateTemplate).toBeCalledWith(updatedTemplate)
  })
})
