import { render } from '@testing-library/react'
import React from 'react'
import Score from '../Score'

describe('Score component', () => {
  test('renders empty when no userScore prop is provided', () => {
    const { container } = render(<Score />)
    expect(container.firstChild).toBeNull()
  })
})
