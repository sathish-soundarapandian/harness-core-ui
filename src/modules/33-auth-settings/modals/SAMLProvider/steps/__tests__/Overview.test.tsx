import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import Overview from '../Overview'

describe('overview step tests', () => {
  test('render', () => {
    const { container, queryByText } = render(
      <TestWrapper>
        <Overview />
      </TestWrapper>
    )

    expect(queryByText('authSettings.samlProviderOverview')).not.toBeNull()
    expect(queryByText('common.friendlyName')).not.toBeNull()
    expect(container).toBeDefined()
  })
})
