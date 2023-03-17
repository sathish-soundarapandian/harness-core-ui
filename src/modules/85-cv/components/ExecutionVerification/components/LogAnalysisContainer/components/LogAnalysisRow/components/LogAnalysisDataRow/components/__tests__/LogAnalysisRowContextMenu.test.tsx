import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import LogAnalysisRowContextMenu from '../LogAnalysisRowContextMenu'

describe('LogAnalysisRowContextMenu', () => {
  test('should return null if no menu items are not passed', () => {
    const { container } = render(
      <TestWrapper>
        <LogAnalysisRowContextMenu menuItems={[]} />
      </TestWrapper>
    )
    expect(container.firstChild).toBeNull()
  })
})
