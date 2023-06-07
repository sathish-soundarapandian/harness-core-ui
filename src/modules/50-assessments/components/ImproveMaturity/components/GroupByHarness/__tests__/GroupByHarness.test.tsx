import { render } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import GroupByHarness from '../GroupByHarness'
import { questionMaturities } from './GroupByHarness.mock'

describe('Group by harness', () => {
  test('recommendations are listed', () => {
    const { getByText } = render(
      <TestWrapper>
        <GroupByHarness questionMaturityList={questionMaturities} onModulesSelectionChange={jest.fn()} />
      </TestWrapper>
    )
    expect(getByText('assessments.modules.idp')).toBeInTheDocument()
    expect(getByText('assessments.modules.sto')).toBeInTheDocument()
  })
})
