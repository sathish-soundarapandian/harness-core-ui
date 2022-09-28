/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import ConnectivityStatus from '../ConnectivityStatus'
import mockData from './mockData'

const { failure, success } = mockData

describe('connectivity status', () => {
  const setup = (data: any) =>
    render(
      <TestWrapper path="/account/:accountId/resources/connectors" pathParams={{ accountId: 'dummy' }}>
        <ConnectivityStatus {...data} />
      </TestWrapper>
    )

  test('success render should match snapshot', async () => {
    const { getByText } = setup(success)

    await waitFor(() => {
      expect(getByText('success')).toBeDefined()
    })
  })

  test('click on failed message', async () => {
    const { getByText } = setup(failure)
    const warningItem = getByText('warning-sign')

    act(() => {
      fireEvent.mouseOver(warningItem)
    })

    await waitFor(() => {
      expect(getByText('noDetails')).toBeDefined()
    })

    const tooltipItem = getByText('noDetails')

    act(() => {
      fireEvent.click(tooltipItem)
    })

    await waitFor(() => {
      expect(getByText('noDetails')).toBeDefined()
    })
  })
})
