import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import {
  useGetAssessmentSectionOverviewResults,
  useGetBenchmarksForResultCode,
  useGetImproveMaturityState,
  useSaveImprovedMaturity,
  useSendAssessmentInvite
} from 'services/assessments'
import { TestWrapper } from '@common/utils/testUtils'
import { improveMaturityData, sectionScoreOverview, benchmarks } from './ImproveMaturity.mock'
import ImproveMaturity from '../ImproveMaturity'

jest.mock('services/assessments', () => ({
  useGetImproveMaturityState: jest
    .fn()
    .mockImplementation(() => ({ data: improveMaturityData, loading: false, error: null, refetch: jest.fn() })),
  useSaveImprovedMaturity: jest.fn().mockImplementation(() => ({ mutate: jest.fn(), loading: false, error: null })),
  useSendAssessmentInvite: jest.fn().mockImplementation(() => ({ mutate: jest.fn(), loading: false, error: null })),
  useGetAssessmentSectionOverviewResults: jest
    .fn()
    .mockImplementation(() => ({ data: null, error: null, loading: true, refetch: jest.fn() })),
  useGetBenchmarksForResultCode: jest.fn().mockImplementation(() => ({ data: benchmarks, loading: true }))
}))

describe('Improve Maturity', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  test('renders the loading spinner when loading is true', () => {
    ;(useGetImproveMaturityState as jest.Mock).mockImplementation(() => ({
      loading: true,
      data: {},
      error: false
    }))
    ;(useSaveImprovedMaturity as jest.Mock).mockImplementation(() => ({
      mutate: jest.fn(),
      loading: false,
      error: null
    }))

    const { getByTestId } = render(
      <TestWrapper>
        <ImproveMaturity />
      </TestWrapper>
    )

    expect(getByTestId('page-spinner')).toBeInTheDocument()
  })

  test('renders the error when API fails', () => {
    ;(useGetImproveMaturityState as jest.Mock).mockImplementation(() => ({
      loading: false,
      data: {},
      error: true
    }))
    ;(useSaveImprovedMaturity as jest.Mock).mockImplementation(() => ({
      mutate: jest.fn(),
      loading: false,
      error: null
    }))

    const { getByText } = render(
      <TestWrapper>
        <ImproveMaturity />
      </TestWrapper>
    )

    expect(getByText('We cannot perform your request at the moment. Please try again.')).toBeInTheDocument()
  })

  test('Should render the values in flat table', () => {
    ;(useGetImproveMaturityState as jest.Mock).mockImplementation(() => ({
      data: improveMaturityData,
      loading: false,
      error: null,
      refetch: jest.fn()
    }))
    ;(useSaveImprovedMaturity as jest.Mock).mockImplementation(() => ({
      mutate: jest.fn(),
      loading: false,
      error: null
    }))
    ;(useSendAssessmentInvite as jest.Mock).mockImplementation(() => ({
      mutate: jest.fn(),
      loading: false,
      error: null
    }))
    ;(useGetAssessmentSectionOverviewResults as jest.Mock).mockImplementation(() => ({
      data: null,
      error: null,
      loading: true,
      refetch: jest.fn()
    }))
    ;(useGetBenchmarksForResultCode as jest.Mock).mockImplementation(() => ({
      data: benchmarks,
      loading: false
    }))

    const { getAllByText } = render(
      <TestWrapper>
        <ImproveMaturity />
      </TestWrapper>
    )

    expect(getAllByText('assessments.improveMaturity')).toHaveLength(2)
  })

  test('On selection of row checkbox, the maturity score gets updated', () => {
    ;(useGetImproveMaturityState as jest.Mock).mockImplementation(() => ({
      data: improveMaturityData,
      loading: false,
      error: null,
      refetch: jest.fn()
    }))
    ;(useSaveImprovedMaturity as jest.Mock).mockImplementation(() => ({
      mutate: jest.fn(),
      loading: false,
      error: null
    }))
    ;(useSendAssessmentInvite as jest.Mock).mockImplementation(() => ({
      mutate: jest.fn(),
      loading: false,
      error: null
    }))
    ;(useGetAssessmentSectionOverviewResults as jest.Mock).mockImplementation(() => ({
      data: sectionScoreOverview,
      error: false,
      loading: false,
      refetch: jest.fn()
    }))
    ;(useGetBenchmarksForResultCode as jest.Mock).mockImplementation(() => ({
      data: benchmarks,
      loading: false
    }))

    const { getAllByTestId } = render(
      <TestWrapper>
        <ImproveMaturity />
      </TestWrapper>
    )

    const rowCheckboxes = getAllByTestId('row-checkbox')
    expect(rowCheckboxes.length).toBe(2)
    fireEvent.click(rowCheckboxes[0])
    expect(rowCheckboxes[0]).toBeChecked()
  })
})
