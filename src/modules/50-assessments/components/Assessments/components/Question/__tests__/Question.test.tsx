import React from 'react'
import * as Formik from 'formik'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import Question from '../Question'

describe('Question', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  test('renders the question and options', () => {
    const useFormikContextMock = jest.spyOn(Formik, 'useFormikContext')
    useFormikContextMock.mockReturnValue({
      values: {
        userResponse: {
          section1: {
            q1: 'a'
          }
        }
      },
      touched: {},
      submitForm: jest.fn()
    } as unknown as any)

    const question = {
      questionId: 'q1',
      questionNumber: 1,
      questionText: 'Question 1',
      questionType: 'RADIO_BUTTON',
      sectionName: 'section1',
      possibleResponses: [
        { optionId: 'a', optionText: 'Option A' },
        { optionId: 'b', optionText: 'Option B' }
      ]
    }
    const { getByText } = render(
      <TestWrapper>
        <Question
          questionNumber={question.questionNumber}
          questionText={question.questionText}
          possibleResponses={question.possibleResponses}
          questionId={question.questionId}
          onAnswerSelected={jest.fn()}
        />
      </TestWrapper>
    )

    expect(getByText('Question 1')).toBeInTheDocument()
    expect(getByText('Option A')).toBeInTheDocument()
    expect(getByText('Option B')).toBeInTheDocument()
  })
})
