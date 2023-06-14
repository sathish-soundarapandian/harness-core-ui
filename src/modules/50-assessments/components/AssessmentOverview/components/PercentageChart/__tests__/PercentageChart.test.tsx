import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render } from '@testing-library/react'
import PercentageChart from '../PercentageChart'

describe('PercentageChart', () => {
  test('should a perentage graph even without any value as 0%', () => {
    const { getByText } = render(
      <MemoryRouter>
        <PercentageChart />
      </MemoryRouter>
    )
    expect(getByText('0%')).toBeInTheDocument()
  })
  test('should render graph with proper percentage', () => {
    const { getByText } = render(
      <MemoryRouter>
        <PercentageChart score={5} maxScore={10} />
      </MemoryRouter>
    )
    expect(getByText('50%')).toBeInTheDocument()
  })
})
