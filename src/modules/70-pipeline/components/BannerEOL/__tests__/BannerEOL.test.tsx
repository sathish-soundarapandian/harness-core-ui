import { render, fireEvent } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'

import { BannerEOL } from '../BannerEOL'

describe('Banner EOL', () => {
  test('render <BannerEOL /> and close', async () => {
    const { container } = render(
      <TestWrapper>
        <BannerEOL isVisible={true} />
      </TestWrapper>
    )
    const closeBtn = container.querySelector('button[aria-label=close]')
    expect(closeBtn).toBeInTheDocument()
    fireEvent.click(closeBtn as HTMLButtonElement)
    expect(closeBtn).not.toBeInTheDocument()
  })
})
