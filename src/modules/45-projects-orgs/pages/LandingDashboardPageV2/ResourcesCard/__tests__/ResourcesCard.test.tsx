import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ResourcesCardContainer from '../ResourcesCard'

describe('resources card tests', () => {
  test('render', () => {
    const { queryByText } = render(
      <TestWrapper>
        <ResourcesCardContainer />
      </TestWrapper>
    )

    expect(queryByText('common.slack')).not.toBeNull()
    expect(queryByText('common.resourcecenter.bottomlayout.university')).not.toBeNull()
    expect(queryByText('common.supporttext')).not.toBeNull()
    expect(queryByText('common.configureJfrog')).not.toBeNull()
  })
})
