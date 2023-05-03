import React from 'react'
import { render, screen } from '@testing-library/react'
import { useFormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import RatingQuestion, { RatingQuestionProps } from '../RatingQuestion'

jest.mock('formik')
jest.mock('framework/strings')

describe('RatingQuestion component', () => {
  const props: RatingQuestionProps = {
    questionNumber: 1,
    questionText: 'Test question',
    possibleResponses: [
      { optionId: '1', optionText: 'Option 1' },
      { optionId: '2', optionText: 'Option 2' },
      { optionId: '3', optionText: 'Option 3' }
    ],
    questionIndex: 0
  }

  const mockedUseFormikContext = useFormikContext as jest.MockedFunction<typeof useFormikContext>
  const mockedUseStrings = useStrings as jest.MockedFunction<typeof useStrings>

  beforeEach(() => {
    mockedUseFormikContext.mockReturnValue({
      setFieldValue: jest.fn(),
      touched: {},
      errors: {},
      values: {}
    } as any)
    mockedUseStrings.mockReturnValue({
      getString: jest.fn()
    })
  })

  test('renders question text correctly', () => {
    render(<RatingQuestion {...props} />)
    expect(screen.getByText(props?.questionText as string)).toBeInTheDocument()
  })
})
