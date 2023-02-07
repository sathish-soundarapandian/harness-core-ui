import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import { getTemplateContextMock } from '@templates-library/components/TemplateStudio/__tests__/stateMock'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import { StepGroupTemplateCanvasWithRef } from '@templates-library/components/TemplateStudio/StepGroupTemplateCanvas/StepGroupTemplateCanvas'

jest.mock(
  '@templates-library/components/TemplateStudio/StepGroupTemplateCanvas/StepGroupTemplateDiagram/StepGroupTemplateDiagram',
  () => ({
    ...(jest.requireActual(
      '@templates-library/components/TemplateStudio/StepGroupTemplateCanvas/StepGroupTemplateDiagram/StepGroupTemplateDiagram'
    ) as any),
    StepGroupTemplateDiagram: () => {
      return <div className="step-group-template-diagram-mock" />
    }
  })
)

jest.mock(
  '@templates-library/components/TemplateStudio/StepGroupTemplateCanvas/StepGroupTemplateForm/StepGroupTemplateForm',
  () => ({
    ...(jest.requireActual(
      '@templates-library/components/TemplateStudio/StepGroupTemplateCanvas/StepGroupTemplateForm/StepGroupTemplateForm'
    ) as any),
    StepGroupTemplateFormWithRef: () => {
      return <div className="step-group-template-form-mock" />
    }
  })
)

describe('<StepGroupTemplateCanvas /> test', () => {
  test('Should render with resizer', () => {
    const templateContext = getTemplateContextMock(TemplateType.StepGroup)

    const { container } = render(
      <TestWrapper>
        <TemplateContext.Provider value={templateContext}>
          <StepGroupTemplateCanvasWithRef />
        </TemplateContext.Provider>
      </TestWrapper>
    )

    const resizer = container.querySelector('[class*="Resizer"]')
    expect(resizer).toBeTruthy()
  })
})
