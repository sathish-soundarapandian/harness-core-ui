import React from 'react'
import { render, screen } from '@testing-library/react'
import type { UserResponsesResponse } from 'services/assessments'
import SurveyDrawer from '../SurveyDrawer'

const mockCurrentRowDetails: UserResponsesResponse = {
  userScore: 10,
  maxScore: 20,
  benchmarkScore: 15,
  organizationScore: 18,
  questionText: 'What is your favorite color?'
}

jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: (key: string) => key
  })
}))

describe('SurveyDrawer', () => {
  test('renders the question text in the header', () => {
    render(<SurveyDrawer isOpen onHideCallback={jest.fn()} currentRowDetails={mockCurrentRowDetails} />)
    const questionText = screen.getByText(/What is your favorite color?/i)
    expect(questionText).toBeInTheDocument()
  })

  test('renders the company score', () => {
    render(<SurveyDrawer isOpen onHideCallback={jest.fn()} currentRowDetails={mockCurrentRowDetails} />)
    const companyScore = screen.getByText('assessments.companyScore')
    expect(companyScore).toBeInTheDocument()
    const companyScoreValue = screen.getByText('18')
    expect(companyScoreValue).toBeInTheDocument()
  })

  test('renders the maximum score', () => {
    render(<SurveyDrawer isOpen onHideCallback={jest.fn()} currentRowDetails={mockCurrentRowDetails} />)
    const maxScore = screen.getByText('assessments.maxScore')
    expect(maxScore).toBeInTheDocument()
    const maxScoreValue = screen.getByText('20')
    expect(maxScoreValue).toBeInTheDocument()
  })

  test('renders the benchmark score if available', () => {
    render(<SurveyDrawer isOpen onHideCallback={jest.fn()} currentRowDetails={mockCurrentRowDetails} />)
    const benchmarkScore = screen.getByText('assessments.benchmark')
    expect(benchmarkScore).toBeInTheDocument()
    const benchmarkScoreValue = screen.getByText('15')
    expect(benchmarkScoreValue).toBeInTheDocument()
  })

  test('does not render the benchmark score if not available', () => {
    const mockCurrentRowDetailsWithoutBenchmark = {
      ...mockCurrentRowDetails,
      benchmarkScore: undefined
    }
    render(<SurveyDrawer isOpen onHideCallback={jest.fn()} currentRowDetails={mockCurrentRowDetailsWithoutBenchmark} />)
    const benchmarkScore = screen.queryByText('assessments.benchmark')
    expect(benchmarkScore).not.toBeInTheDocument()
  })
})
