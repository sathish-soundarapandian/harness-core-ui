import React from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TopNav from '../TopNav'

jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: (key: string) => key
  })
}))

describe('TopNav', () => {
  test('renders the correct title', () => {
    const { getByText } = render(
      <MemoryRouter>
        <TopNav />
      </MemoryRouter>
    )
    const title = getByText('assessments.developerEffectiveness')
    expect(title).toBeInTheDocument()
  })
})
