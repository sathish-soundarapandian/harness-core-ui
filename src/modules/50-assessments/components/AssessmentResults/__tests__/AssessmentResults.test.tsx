import { render } from '@testing-library/react'
import React from 'react'
import { useGetAssessmentSectionOverviewResults, useGetBenchmarksForResultCode } from 'services/assessments'
import { TestWrapper } from '@common/utils/testUtils'
import { getFilteredResultsForLevel, getFilteredResultsForSearch } from '../AssessmentResults.utils'
import { mockSectionScores, sectionResult, benchmarks } from './AssessmentResults.mock'
import AssessmentResults from '../AssessmentResults'

jest.mock('services/assessments', () => ({
  useGetAssessmentSectionOverviewResults: jest
    .fn()
    .mockImplementation(() => ({ data: sectionResult, loading: false, error: null, refetch: jest.fn() })),
  useSendAssessmentInvite: jest.fn().mockImplementation(() => ({ mutate: jest.fn(), loading: false, error: null })),
  useGetBenchmarksForResultCode: jest.fn().mockImplementation(() => ({ data: benchmarks, loading: true }))
}))

describe('test getFilteredResultsForLevel method', () => {
  test('should return an empty array when selectedScore is null', () => {
    const selectedScore = null
    const filteredResults = getFilteredResultsForLevel(selectedScore, mockSectionScores)
    expect(filteredResults).toEqual(mockSectionScores)
  })

  test('should return an array of responses with scores between 0 and 3 when selectedScore is "Level 3"', () => {
    const selectedScore = [{ value: 'LEVEL_1', label: 'Level 1' }]
    const filteredResults = getFilteredResultsForLevel(selectedScore, mockSectionScores)
    expect(filteredResults).toEqual([mockSectionScores[0]])
  })

  test('should return an array of responses with scores between 4 and 7 when selectedScore is "4_7"', () => {
    const selectedScore = [{ value: 'LEVEL_2', label: 'Level 2' }]
    const filteredResults = getFilteredResultsForLevel(selectedScore, mockSectionScores)
    expect(filteredResults).toEqual([mockSectionScores[1]])
  })

  test('should return an array of responses with scores between 8 and 10 when selectedScore is "8_10"', () => {
    const selectedScore = [{ value: 'LEVEL_3', label: 'Level 3' }]
    const filteredResults = getFilteredResultsForLevel(selectedScore, mockSectionScores)
    expect(filteredResults).toEqual([mockSectionScores[2]])
  })

  test('should return an array of all responses when selectedScore is "all"', () => {
    const selectedScore = [
      { value: 'LEVEL_3', label: 'Level 3' },
      { value: 'LEVEL_2', label: 'Level 2' },
      { value: 'LEVEL_1', label: 'Level 1' }
    ]
    const filteredResults = getFilteredResultsForLevel(selectedScore, mockSectionScores)
    expect(filteredResults).toEqual(mockSectionScores)
  })

  test('should return an empty array when response is not available"', () => {
    const selectedScore = [{ value: 'LEVEL_3', label: 'Level 3' }]
    const filteredResults = getFilteredResultsForLevel(selectedScore)
    expect(filteredResults).toHaveLength(0)
  })
})

describe('test getFilteredResultsForSearch method', () => {
  test('returns filtered results when search matches question text', () => {
    const filteredResults = getFilteredResultsForSearch(mockSectionScores, 'Planning and Requirements Process')
    expect(filteredResults).toHaveLength(1)
  })

  test('returns empty array when search does not match any question text', () => {
    const filteredResults = getFilteredResultsForSearch(mockSectionScores, 'unknown')
    expect(filteredResults).toHaveLength(0)
  })
  test('returns empty array when response is not there', () => {
    const filteredResults = getFilteredResultsForSearch(undefined, 'unknown')
    expect(filteredResults).toHaveLength(0)
  })
  test('returns the score as is, if there is no search value', () => {
    const filteredResults = getFilteredResultsForSearch(mockSectionScores, null)
    expect(filteredResults).toEqual(mockSectionScores)
  })
})

describe('Assessment Results', () => {
  test('displays result data', () => {
    const { getByText } = render(
      <TestWrapper>
        <AssessmentResults />
      </TestWrapper>
    )
    expect(getByText('common.results')).toBeInTheDocument()
  })
  test('renders data even without benchmark', () => {
    ;(useGetBenchmarksForResultCode as jest.Mock).mockImplementation(() => ({
      data: null,
      error: true,
      loading: false
    }))
    const { getByText } = render(
      <TestWrapper>
        <AssessmentResults />
      </TestWrapper>
    )
    expect(getByText('common.results')).toBeInTheDocument()
  })
  test('displays loading overlay when the data is loading', () => {
    ;(useGetAssessmentSectionOverviewResults as jest.Mock).mockImplementation(() => ({
      data: null,
      error: null,
      loading: true,
      refetch: jest.fn()
    }))
    const { getByTestId } = render(
      <TestWrapper>
        <AssessmentResults />
      </TestWrapper>
    )
    expect(getByTestId('page-spinner')).toBeInTheDocument()
  })
  test('renders error on failure', () => {
    ;(useGetAssessmentSectionOverviewResults as jest.Mock).mockImplementation(() => ({
      data: null,
      error: true,
      loading: false,
      refetch: jest.fn()
    }))
    const { getByTestId } = render(
      <TestWrapper>
        <AssessmentResults />
      </TestWrapper>
    )
    expect(getByTestId('page-error')).toBeInTheDocument()
  })
})
