import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import PreferencesCard from '../PreferencesCard'

describe('Preference card test', () => {
  test('render', () => {
    const { container } = render(
      <TestWrapper>
        <PreferencesCard />
      </TestWrapper>
    )
    screen.debug(container)
    expect(container).toBeDefined()
  })
})
