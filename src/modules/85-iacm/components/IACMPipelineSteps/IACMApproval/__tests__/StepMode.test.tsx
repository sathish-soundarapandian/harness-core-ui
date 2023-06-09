import React from 'react'
import { render } from '@testing-library/react'

import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { TestWrapper } from '@common/utils/testUtils'
import StepMode from '../StepMode'

describe('IACMApprovalStep', () => {
  test('renders correctly', () => {
    const { getByText } = render(
      <TestWrapper>
        <StepMode
          stepViewType={StepViewType.Edit}
          initialValues={{ timeout: '10s', name: '', identifier: '' }}
          allowableTypes={[]}
        />
      </TestWrapper>
    )

    const nameField = getByText('Name')
    const timeoutField = getByText('pipelineSteps.timeoutLabel')

    expect(nameField).toBeInTheDocument()
    expect(timeoutField).toBeInTheDocument()
  })
})
