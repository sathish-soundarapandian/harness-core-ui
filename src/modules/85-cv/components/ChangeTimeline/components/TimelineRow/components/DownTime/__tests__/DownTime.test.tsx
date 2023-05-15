/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import DownTime, { DownTimeProps } from '../DownTime'
import { SLO_WIDGETS } from '../../../TimelineRow.constants'

function WrapperComponent(props: DownTimeProps): JSX.Element {
  return (
    <TestWrapper>
      <DownTime {...props} />
    </TestWrapper>
  )
}

describe('Unit tests for Downtime', () => {
  const props = {
    widget: {
      endTime: 1679660880000,
      startTime: 1679660280000,
      icon: {
        height: 16,
        width: 16,
        url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTciIGhlaWdodD0iMTYiIHZpZXdCb3g9IjAgMCAxNyAxNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDxyZWN0IHg9IjAuNSIgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiByeD0iOCIgZmlsbD0iIzdENEREMyIgLz4KICAgIDxwYXRoCiAgICAgIGQ9Ik04LjgwMTQ3IDYuNjQwMTdDOS4xMjY1OSA1LjY4NTk0IDguOTAzMDkgNC41ODk2NCA4LjEzMDk4IDMuODE4MUM3LjQ2MDQ5IDMuMTQ4MTEgNi41NDYxOSAyLjg4NDEgNS42OTI4NyAzLjA0NjU2QzUuNDY5MzcgMy4wODcyIDUuMzg4MTYgMy4zNzE0MyA1LjU1MDU4IDMuNTMzODZMNi41MDU1MiA0LjQ4ODA5QzYuOTMyMjcgNC45MTQ1MiA2LjkzMjI3IDUuNTg0MzYgNi41MDU1MiA2LjAxMDc5QzYuMDc4NzcgNi40MzcyMiA1LjQwODQzIDYuNDM3MjIgNC45ODE2OCA2LjAxMDc5TDQuMDI2NzQgNS4wNTY1NkMzLjg2NDE4IDQuODk0MTIgMy41Nzk3NCA0Ljk3NTQxIDMuNTM5MDcgNS4xOTg3NUMzLjM5Njc4IDYuMDUxNDYgMy42NDA2OSA2Ljk4NTQyIDQuMzExMTkgNy42MzUwNEM1LjA4MzMgOC40MDY1OCA2LjE4MDQzIDguNjA5NTMgNy4xMzUzNyA4LjMwNTAzTDExLjQ4MzQgMTIuNjQ5OEMxMS45NTA3IDEzLjExNjcgMTIuNzAyNSAxMy4xMTY3IDEzLjE0OTUgMTIuNjQ5OEMxMy42MTY4IDEyLjE4MjkgMTMuNjE2OCAxMS40MzE2IDEzLjE0OTUgMTAuOTg0OUw4LjgwMTQ3IDYuNjQwMTdaIgogICAgICBmaWxsPSJ3aGl0ZSIKICAgIC8+CiAgPC9zdmc+'
      },
      type: SLO_WIDGETS.DOWNTIME,
      identifiers: ['zCyEg2AJQ4Kq2awF4iujIQ'],
      leftOffset: 1043.7857589440778
    },
    index: 0
  }

  test('should be able to verify that Downtime component loads with appropriate data', async () => {
    const { getByText, getByTestId } = render(<WrapperComponent {...props} />)
    const downTimeIcon = getByTestId('downtimeIcon')
    await waitFor(() => expect(downTimeIcon).toBeInTheDocument())

    await userEvent.click(downTimeIcon)
    await waitFor(() => expect(getByText('cv.sloDowntime.label')).toBeInTheDocument())
  })
})
