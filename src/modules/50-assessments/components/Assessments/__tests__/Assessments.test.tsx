import React from 'react'
import * as Formik from 'formik'
import { fireEvent, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { useGetAssessmentForUser, useSaveAssessmentResponse, useSubmitAssessmentForUser } from 'services/assessments'
import { TestWrapper } from '@common/utils/testUtils'
import Assessments from '../Assessments'
import { responseData, savedvalues, allAnsweredAssessment, allSavedValues } from './Assessments.mock'

jest.mock('services/assessments', () => ({
  useGetAssessmentForUser: jest
    .fn()
    .mockImplementation(() => ({ data: responseData, loading: false, error: null, refetch: jest.fn() })),
  useSaveAssessmentResponse: jest.fn().mockImplementation(() => ({ mutate: jest.fn(), loading: false, error: null })),
  useSubmitAssessmentForUser: jest.fn().mockImplementation(() => ({ mutate: jest.fn(), loading: false, error: null }))
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

    const { getByTestId } = render(
      <TestWrapper>
        <Assessments />
      </TestWrapper>
    )

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
    const { getByText } = render(
      <TestWrapper>
        <Assessments />
      </TestWrapper>
    )

    expect(getByText('Something went wrong')).toBeInTheDocument()
  })

  test('renders the sections when there is data and no error', () => {
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

    const useFormikContextMock = jest.spyOn(Formik, 'useFormikContext')
    useFormikContextMock.mockReturnValue({
      values: savedvalues,
      touched: {}
    } as unknown as any)
    const { getAllByText, getByText } = render(
      <TestWrapper>
        <MemoryRouter>
          <Assessments />
        </MemoryRouter>
      </TestWrapper>
    )
    expect(getAllByText('section1')).toHaveLength(2)
    expect(getByText('section2')).toBeInTheDocument()
    expect(getByText('Question 1')).toBeInTheDocument()
  })

  test('renders last unanswered or last question when all others are answered', () => {
    const submitFunction = jest.fn()
    ;(useGetAssessmentForUser as jest.Mock).mockImplementation(() => ({
      data: allAnsweredAssessment,
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
      mutate: submitFunction,
      loading: false,
      error: null
    }))
    const useFormikContextMock = jest.spyOn(Formik, 'useFormikContext')
    useFormikContextMock.mockReturnValue({
      values: allSavedValues,
      setFieldValue: jest.fn(),
      submitForm: submitFunction
    } as unknown as any)
    const { getByText, getByTestId } = render(
      <TestWrapper>
        <MemoryRouter>
          <Assessments />
        </MemoryRouter>
      </TestWrapper>
    )
    expect(getByText('Question 3')).toBeInTheDocument()
    const submitButton = getByTestId('questionSubmitButton')
    expect(submitButton).toBeInTheDocument()
    fireEvent.click(submitButton!)
    expect(submitFunction).toHaveBeenCalled()
  })
})
