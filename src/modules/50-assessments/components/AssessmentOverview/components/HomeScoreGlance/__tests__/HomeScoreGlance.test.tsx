import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import HomeScoreGlance from '../HomeScoreGlance'
import { sectionResult, sectionResultWithBenchmark } from './HomeScoreGlance.mock'

describe('HomeScoreGlance', () => {
  test('should render score at a glance', () => {
    const { getByText } = render(
      <TestWrapper>
        <MemoryRouter>
          <HomeScoreGlance sectionResult={sectionResult} />
        </MemoryRouter>
      </TestWrapper>
    )
    expect(getByText('assessments.maturityScore')).toBeInTheDocument()
  })

  test('should render benchmark', () => {
    const { getByText } = render(
      <TestWrapper>
        <MemoryRouter>
          <HomeScoreGlance sectionResult={sectionResultWithBenchmark} />
        </MemoryRouter>
      </TestWrapper>
    )
    expect(getByText('assessments.maturityScore')).toBeInTheDocument()
  })
})
