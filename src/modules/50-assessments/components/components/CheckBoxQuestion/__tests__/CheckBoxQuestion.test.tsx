import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { Formik, Form } from 'formik'
import CheckBoxQuestion from '../CheckBoxQuestion'

const mockProps = {
  questionNumber: 1,
  questionText: 'What is your favorite color?',
  possibleResponses: [
    {
      optionId: '1',
      optionText: 'Red'
    },
    {
      optionId: '2',
      optionText: 'Green'
    },
    {
      optionId: '3',
      optionText: 'Blue'
    }
  ],
  questionIndex: 0
}

describe('CheckBoxQuestion', () => {
  test('should check and uncheck options on user input', () => {
    const { getByLabelText } = render(
      <Formik initialValues={{ userResponse: [] }} onSubmit={jest.fn()}>
        <Form>
          <CheckBoxQuestion {...mockProps} />
        </Form>
      </Formik>
    )
    const redCheckbox = getByLabelText('Red')
    const greenCheckbox = getByLabelText('Green')
    expect(redCheckbox).not.toBeChecked()
    expect(greenCheckbox).not.toBeChecked()

    fireEvent.click(redCheckbox)
    expect(redCheckbox).toBeChecked()
    expect(greenCheckbox).not.toBeChecked()

    fireEvent.click(greenCheckbox)
    expect(redCheckbox).toBeChecked()
    expect(greenCheckbox).toBeChecked()

    fireEvent.click(redCheckbox)
    expect(redCheckbox).not.toBeChecked()
    expect(greenCheckbox).toBeChecked()
  })
})
