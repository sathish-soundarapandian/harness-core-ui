import { fireEvent, render } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import GroupByHarness from '../GroupByHarness'
import { questionMaturities } from './GroupByHarness.mock'

describe('Group by harness', () => {
  test('recommendations are listed', () => {
    const { getByText, container, getAllByRole } = render(
      <TestWrapper>
        <GroupByHarness questionMaturityList={questionMaturities} onModulesSelectionChange={jest.fn()} />
      </TestWrapper>
    )
    expect(getByText('assessments.modules.idp')).toBeInTheDocument()
    expect(getByText('assessments.modules.sto')).toBeInTheDocument()

    const rowButtons = getAllByRole('button')
    expect(rowButtons).toHaveLength(3)
    fireEvent.click(rowButtons[0])
    const chevronDownIcon = container.querySelector('[data-icon="chevron-down"]')
    expect(chevronDownIcon).toBeInTheDocument()

    const rowCheckboxs = getAllByRole('checkbox')
    expect(rowCheckboxs).toHaveLength(3)
    fireEvent.click(rowCheckboxs[0])
  })
})
