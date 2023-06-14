import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import CapabilitiesContainer from '../CapabilitiesContainer'
import { mockQuestionLevelMaturityList } from './CapabilitiesContainer.mock'

jest.mock('services/assessments', () => ({
  useGetBenchmarksForResultCode: jest.fn().mockImplementation(() => ({ data: [], loading: false }))
}))

describe('Capability container', () => {
  test('should be able to display grouped by category', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <CapabilitiesContainer
          questionMaturityList={mockQuestionLevelMaturityList}
          onSelectionChange={jest.fn()}
          groupSelection={jest.fn()}
          benchmark={undefined}
          setBenchMark={jest.fn()}
          resultCode={'resultcode'}
        />
      </TestWrapper>
    )
    const groupBycheckbox = getByTestId('groupByCheckbox')
    expect(groupBycheckbox).toBeInTheDocument()
    fireEvent.click(groupBycheckbox)
    expect(screen.getByText('Integrated Security and Governance')).toBeInTheDocument()
  })
})
