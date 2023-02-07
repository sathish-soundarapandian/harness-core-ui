import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { set } from 'lodash-es'
import produce from 'immer'
import { TestWrapper } from '@common/utils/testUtils'
import { TabTypes } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'

import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import pipelineContextMock from '@pipeline/components/PipelineStudio/RightDrawer/__tests__/stateMock'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import type { AdvancedStepsProps } from '@pipeline/components/PipelineSteps/AdvancedSteps/AdvancedSteps'

import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import {
  getTemplateContextMock,
  stepGroupTemplateMock
} from '@templates-library/components/TemplateStudio/__tests__/stateMock'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import { StepGroupTemplateFormWithRef } from '../StepGroupTemplateForm'

jest.mock('@pipeline/components/PipelineSteps/AdvancedSteps/AdvancedSteps', () => ({
  ...(jest.requireActual('@pipeline/components/PipelineSteps/AdvancedSteps/AdvancedSteps') as any),
  AdvancedStepsWithRef: React.forwardRef(({ onChange }: AdvancedStepsProps, _ref: StepFormikFowardRef) => {
    return (
      <div className="step-group-advancedstep-mock">
        <button
          onClick={() => {
            onChange?.({ when: { stageStatus: 'All' }, delegateSelectors: ['test1'], tab: TabTypes.Advanced })
          }}
        >
          onChange Button
        </button>
        <button
          onClick={() => {
            onChange?.({ when: { stageStatus: 'All' }, delegateSelectors: ['test3'] })
          }}
        >
          onChange no tab
        </button>
      </div>
    )
  })
}))

jest.mock('lodash-es', () => ({
  ...(jest.requireActual('lodash-es') as Record<string, any>),
  debounce: jest.fn(fn => {
    fn.cancel = jest.fn()
    return fn
  })
}))

const pipelineContext = produce(pipelineContextMock, draft => {
  set(draft, 'contextType', 'Template')
})

describe('<StepGroupTemplateForm /> tests', () => {
  beforeEach(() => jest.clearAllMocks())
  const stepGroupTemplateContextMock = getTemplateContextMock(TemplateType.StepGroup)

  test('should call renderPipelineStage with correct arguments', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <PipelineContext.Provider value={pipelineContext}>
          <TemplateContext.Provider value={stepGroupTemplateContextMock}>
            <StepGroupTemplateFormWithRef />
          </TemplateContext.Provider>
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const changeButton = getByText('onChange Button')
    fireEvent.click(changeButton as HTMLElement)
    expect(container).toBeDefined()
    expect(stepGroupTemplateContextMock.updateTemplate).toBeCalledWith({
      ...stepGroupTemplateMock,
      spec: {
        ...stepGroupTemplateMock.spec,
        when: { stageStatus: 'All' },
        delegateSelectors: ['test1']
      }
    })
    const changeButtonNoTab = getByText('onChange no tab')
    fireEvent.click(changeButtonNoTab as HTMLElement)

    expect(stepGroupTemplateContextMock.updateTemplate).toBeCalledWith({
      ...stepGroupTemplateMock
    })
  })
})
