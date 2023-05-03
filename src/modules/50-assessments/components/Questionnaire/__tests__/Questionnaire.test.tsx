import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import * as Formik from 'formik'
import type { QuestionResponse } from 'services/assessments'
import Questionnaire from '../Questionnaire'

describe('Questionnaire', () => {
  const useFormikContextMock = jest.spyOn(Formik, 'useFormikContext')
  beforeEach(() => {
    jest.clearAllMocks()
    useFormikContextMock.mockReturnValue({
      values: {},
      touched: {}
    } as unknown as any)
  })

  const questions = [
    {
      questionNumber: 1,
      questionText: 'Question 1',
      possibleResponses: ['Option 1', 'Option 2'],
      questionType: 'RADIO_BUTTON'
    },
    {
      questionNumber: 2,
      questionText: 'Question 2',
      possibleResponses: ['Yes', 'No'],
      questionType: 'YES_NO'
    }
  ]
  const inviteCode = '123456789'

  const saveAssessmentMock = jest.fn()
  saveAssessmentMock.mockImplementation((): Promise<{ status: string }> => {
    return Promise.resolve({ status: 'SUCCESS' })
  })

  jest.mock('services/assessments', () => ({
    useSaveAssessmentResponse: jest.fn().mockImplementation(() => ({ mutate: saveAssessmentMock }))
  }))

  test('should render the questions', async () => {
    const { container } = render(<Questionnaire questions={questions as QuestionResponse[]} inviteCode={inviteCode} />)

    await waitFor(() => {
      expect(screen.getByText('Question 1')).toBeInTheDocument()
      const radioBtns = container.querySelectorAll(`input[name="userResponse.0.responseIds.0"]`)
      expect(radioBtns.length).toEqual(2)
      expect(screen.getByText('Question 2')).toBeInTheDocument()
      expect(screen.getByText('Yes')).toBeInTheDocument()
      expect(screen.getByText('No')).toBeInTheDocument()
    })
  })
})
