import React from 'react'
import { render } from '@testing-library/react'
import { useGetAssessmentForUser, useSaveAssessmentResponse, useSubmitAssessmentForUser } from 'services/assessments'
import Assessments from '../Assessments'
import { responseData } from './Assessments.mock'

const mockHistoryPush = jest.fn()
// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: mockHistoryPush
  })
}))

jest.mock('services/assessments', () => ({
  useGetAssessmentForUser: jest
    .fn()
    .mockImplementation(() => ({ data: responseData, loading: false, error: null, refetch: jest.fn() })),
  useSaveAssessmentResponse: jest.fn().mockImplementation(() => ({ mutate: jest.fn(), loading: false, error: null })),
  useSubmitAssessmentForUser: jest.fn().mockImplementation(() => ({ mutate: jest.fn(), loading: false, error: null }))
}))

jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: (key: string) => key
  })
}))

// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  useParams: jest.fn().mockReturnValue({ inviteCode: 'inviteCode' }),
  useHistory: () => ({
    push: jest.fn()
  })
}))

describe('Assessments', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  test('renders the loading spinner when loading is true', () => {
    ;(useGetAssessmentForUser as jest.Mock).mockImplementation(() => ({
      loading: true,
      data: {},
      error: false
    }))
    ;(useSaveAssessmentResponse as jest.Mock).mockImplementation(() => ({
      mutate: jest.fn(),
      loading: false,
      error: null
    }))
    ;(useSubmitAssessmentForUser as jest.Mock).mockImplementation(() => ({
      mutate: jest.fn(),
      loading: false,
      error: null
    }))

    const { getByTestId } = render(<Assessments />)

    expect(getByTestId('page-spinner')).toBeInTheDocument()
  })

  test('renders the error message when there is an error', () => {
    ;(useGetAssessmentForUser as jest.Mock).mockImplementation(() => ({
      data: null,
      error: { message: 'Something went wrong' },
      loading: false,
      refetch: jest.fn()
    }))
    ;(useSaveAssessmentResponse as jest.Mock).mockImplementation(() => ({
      mutate: jest.fn(),
      loading: false,
      error: null
    }))
    ;(useSubmitAssessmentForUser as jest.Mock).mockImplementation(() => ({
      mutate: jest.fn(),
      loading: false,
      error: null
    }))
    const { getByText } = render(<Assessments />)

    expect(getByText('Something went wrong')).toBeInTheDocument()
  })

  test('renders the questionnaire when there is data and no error', () => {
    ;(useGetAssessmentForUser as jest.Mock).mockImplementation(() => ({
      data: responseData,
      error: null,
      loading: false,
      refetch: jest.fn()
    }))
    ;(useSaveAssessmentResponse as jest.Mock).mockImplementation(() => ({
      mutate: jest.fn(),
      loading: false,
      error: null
    }))
    ;(useSubmitAssessmentForUser as jest.Mock).mockImplementation(() => ({
      mutate: jest.fn(),
      loading: false,
      error: null
    }))
    const { getByText } = render(<Assessments />)

    expect(getByText('Question 1')).toBeInTheDocument()
    expect(getByText('Option A')).toBeInTheDocument()
    expect(getByText('Option B')).toBeInTheDocument()
    expect(getByText('Question 2')).toBeInTheDocument()
    expect(getByText('Option C')).toBeInTheDocument()
    expect(getByText('Option D')).toBeInTheDocument()
    expect(getByText('Yes')).toBeInTheDocument()
    expect(getByText('No')).toBeInTheDocument()
  })
})
