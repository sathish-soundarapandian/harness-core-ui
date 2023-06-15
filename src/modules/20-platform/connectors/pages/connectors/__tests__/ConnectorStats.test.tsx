/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, queryByText } from '@testing-library/react'
import ConnectorStats from '@common/components/ConnectorStats/ConnectorStats'

jest.mock('moment', () => {
  return {
    unix: () => {
      return {
        format: () => 'dummy date'
      }
    },
    fn: {}
  }
})
describe('Connectors Stats', () => {
  test('render when only created', async () => {
    const { container } = render(
      <ConnectorStats
        status="SUCCESS"
        createdAt={1601199008081}
        lastTested={1601199008081}
        lastConnected={1601199008081}
      />
    )
    await waitFor(() => queryByText(container, 'Connector created'))
    expect(container).toMatchSnapshot()
  })

  test('render when also updated', async () => {
    const { container } = render(
      <ConnectorStats
        status="SUCCESS"
        createdAt={1601199008081}
        lastTested={1601199008081}
        lastConnected={1601199008081}
        lastUpdated={1601199008190}
      />
    )
    await waitFor(() => queryByText(container, 'Last updated'))
    expect(container).toMatchSnapshot()
  })
  test('render when status is failure', async () => {
    const { container } = render(
      <ConnectorStats
        status="FAILURE"
        createdAt={1601199008081}
        lastTested={1601199008081}
        lastConnected={1601199008081}
        lastUpdated={1601199008190}
      />
    )
    await waitFor(() => queryByText(container, 'Last updated'))
    expect(container).toMatchSnapshot()
  })
})
