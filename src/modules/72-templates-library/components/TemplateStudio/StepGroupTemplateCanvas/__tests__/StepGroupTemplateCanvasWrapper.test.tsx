import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import produce from 'immer'
import { set } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import { getTemplateContextMock } from '@templates-library/components/TemplateStudio/__tests__/stateMock'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { StepGroupTemplateCanvasWrapperWithRef } from '../StepGroupTemplateCanvasWrapper'
import { StepMock } from './mock'

jest.mock('@templates-library/components/TemplateStudio/StepGroupTemplateCanvas/StepGroupTemplateCanvas', () => ({
  ...jest.requireActual('@templates-library/components/TemplateStudio/StepGroupTemplateCanvas/StepGroupTemplateCanvas'),
  StepGroupTemplateCanvasWithRef: () => {
    const {
      state: { pipeline },
      updatePipeline
    } = usePipelineContext()
    return (
      <div className="step-group-template-canvas-mock">
        <button
          onClick={() => {
            const updatedPipeline = produce(pipeline, draft => {
              set(draft, 'stages[0].stage.spec.execution.steps', [StepMock])
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

describe('<StepGroupTemplateCanvasWrapper /> tests', () => {
  test('should call updateTemplate with updated template', async () => {
    const templateContext = getTemplateContextMock(TemplateType.StepGroup)
    const { getByRole } = render(
      <TestWrapper>
        <TemplateContext.Provider value={templateContext}>
          <StepGroupTemplateCanvasWrapperWithRef />
        </TemplateContext.Provider>
      </TestWrapper>
    )
    const updatePipelineButton = getByRole('button', { name: 'Update Pipeline' })
    await fireEvent.click(updatePipelineButton)
    const updatedTemplate = produce(templateContext.state.template, draft => {
      set(draft, 'spec.steps', [StepMock])
    })
    expect(templateContext.updateTemplate).toBeCalledWith(updatedTemplate)
  })
})
