import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as Formik from 'formik'
import RadioButtonQuestion from '../RadioButtonQuestion'

describe('RadioButtonQuestion', () => {
  const useFormikContextMock = jest.spyOn(Formik, 'useFormikContext')
  beforeEach(() => {
    jest.clearAllMocks()
    useFormikContextMock.mockReturnValue({
      values: {},
      touched: {}
    } as unknown as any)
  })

  const questionNumber = 1
  const questionText = 'What is your favorite color?'
  const possibleResponses = [
    { optionId: '1', optionText: 'Red' },
    { optionId: '2', optionText: 'Green' },
    { optionId: '3', optionText: 'Blue' }
  ]
  const questionIndex = 0

  test('should render the question number and text', () => {
    render(
      <RadioButtonQuestion
        questionNumber={questionNumber}
        questionText={questionText}
        possibleResponses={possibleResponses}
        questionIndex={questionIndex}
      />
    )

    expect(screen.getByText(/1\./)).toBeInTheDocument()
    expect(screen.getByText(/What is your favorite color\?/i)).toBeInTheDocument()
  })

  test('should render a radio button for each possible response', () => {
    render(
      <RadioButtonQuestion
        questionNumber={questionNumber}
        questionText={questionText}
        possibleResponses={possibleResponses}
        questionIndex={questionIndex}
      />
    )

    const radioButtons = screen.getAllByRole('radio')
    expect(radioButtons).toHaveLength(possibleResponses.length)
    possibleResponses.forEach(possibleResponse => {
      expect(screen.getByLabelText(possibleResponse.optionText)).toBeInTheDocument()
    })
  })

  test('should select a response when a radio button is clicked', () => {
    const { container } = render(
      <RadioButtonQuestion
        questionNumber={questionNumber}
        questionText={questionText}
        possibleResponses={possibleResponses}
        questionIndex={questionIndex}
      />
    )

    const radioButtons = container.querySelectorAll('input[type="radio"]')
    userEvent.click(radioButtons[0])
    expect(radioButtons[0]).toBeChecked()
    expect(radioButtons[1]).not.toBeChecked()
    expect(radioButtons[2]).not.toBeChecked()

    userEvent.click(radioButtons[2])
    expect(radioButtons[0]).not.toBeChecked()
    expect(radioButtons[1]).not.toBeChecked()
    expect(radioButtons[2]).toBeChecked()
  })
})
