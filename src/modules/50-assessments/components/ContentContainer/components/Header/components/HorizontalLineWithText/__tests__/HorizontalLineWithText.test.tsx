import React from 'react'
import { render, screen } from '@testing-library/react'
import HorizontalLineWithText, { HorizontalLineWithTextProps } from '../HorizontalLineWithText'

describe('HorizontalLineWithText component', () => {
  const props: HorizontalLineWithTextProps = {
    text: 'Test Text'
  }

  test('renders component with given text', () => {
    render(<HorizontalLineWithText {...props} />)
    expect(screen.getByText(props.text)).toBeInTheDocument()
  })

  test('renders text with class separatorText', () => {
    render(<HorizontalLineWithText {...props} />)
    expect(screen.getByText(props.text)).toHaveClass('separatorText')
  })
})
