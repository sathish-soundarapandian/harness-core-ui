import React from 'react'
import { render } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'

import { LocationValue } from '../LocationValue'

jest.useFakeTimers()

const defaultProps = {
  locations: ['account:/a1', 'a2'],
  isTooltip: false,
  isHarnessStore: true,
  onClick: jest.fn()
}

function WrapperComponent(props: any): JSX.Element {
  const commonProps = {
    ...defaultProps,
    ...props
  }
  return (
    <TestWrapper>
      <LocationValue {...commonProps} />
    </TestWrapper>
  )
}

describe('Define Location value', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  test('should render locations value', async () => {
    const { container, findByText } = render(<WrapperComponent />)
    const item1 = findByText('account:/a1')
    expect(item1).toBeDefined()

    expect(container).toBeDefined()
  })
})
