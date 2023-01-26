import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import SLODowntimePage from '../SLODowntimePage'

describe('SLO Downtime page', () => {
  test('should render no data state', async () => {
    const { getByText } = render(
      <TestWrapper>
        <SLODowntimePage />
      </TestWrapper>
    )

    fireEvent.click(getByText('cv.sloDowntime.label'))
    await waitFor(() => expect(getByText('cv.sloDowntime.noData')).toBeTruthy())
  })
})
