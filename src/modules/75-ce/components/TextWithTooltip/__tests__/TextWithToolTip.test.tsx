/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act } from 'react-dom/test-utils'
import { fireEvent, render, waitFor, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import TextWithToolTip, { textWithToolTipStatus } from '../TextWithToolTip'

describe('Test ToolTip', () => {
  test('ToolTip Icon renders succesfully', () => {
    const { container } = render(
      <TestWrapper>
        <TextWithToolTip
          errors={[{ action: 'Mock Action', error: 'Mock Error' }]}
          status={textWithToolTipStatus.ERROR}
          messageText={'Mock Message Text'}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('ToolTip Icon hover opens ToolTip', async () => {
    const { container } = render(
      <TestWrapper>
        <TextWithToolTip
          errors={[{ action: 'Mock Action', error: 'Mock Error' }]}
          status={textWithToolTipStatus.ERROR}
          messageText={'Mock Message Text'}
        />
      </TestWrapper>
    )
    const toolTipIcon = container.querySelector('svg[data-icon="warning-sign"]') as HTMLElement
    expect(toolTipIcon).toBeDefined()
    act(() => {
      fireEvent.mouseOver(toolTipIcon)
    })
    let expandError
    await waitFor(() => {
      expandError = screen.getByText('ce.common.detailsCtaLabel')
    })
    expect(expandError).toBeDefined()
    expect(container).toMatchSnapshot()
  })
})
