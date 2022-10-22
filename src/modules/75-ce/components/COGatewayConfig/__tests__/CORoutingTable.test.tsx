/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act } from 'react-dom/test-utils'
import { findByText, fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CORoutingTable from '../CORoutingTable'

jest.mock('lodash-es', () => ({
  ...jest.requireActual('lodash-es'),
  debounce: (fn: any) => {
    fn.cancel = jest.fn()
    return fn
  }
}))

const records = [
  {
    port: 80,
    target_port: 8080, // eslint-disable-line
    action: 'forward',
    protocol: 'http',
    target_protocol: 'http', // eslint-disable-line
    redirect_url: 'redirect_url', // eslint-disable-line
    routing_rules: [{ path_match: 'routing_rules' }], // eslint-disable-line
    server_name: 'server_name' // eslint-disable-line
  }
]

describe('Routing Table Tests', () => {
  test('render table with default columns', () => {
    const { container } = render(
      <TestWrapper>
        <CORoutingTable routingRecords={records} setRoutingRecords={jest.fn()} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('fill in details for a route', async () => {
    const { container } = render(
      <TestWrapper>
        <CORoutingTable routingRecords={records} setRoutingRecords={jest.fn()} />
      </TestWrapper>
    )

    const protocolCaret = container
      .querySelector(`input[value="http"] + [class*="bp3-input-action"]`)
      ?.querySelector('[icon="chevron-down"]')
    await waitFor(() => {
      fireEvent.click(protocolCaret!)
    })
    const protocolToSelect = await findByText(container, 'https')
    act(() => {
      fireEvent.click(protocolToSelect)
    })

    const listenPortInput = container.querySelector(`input[value="80"]`) as HTMLInputElement
    act(() => {
      fireEvent.change(listenPortInput!, { target: { value: 81 } })
    })
    await waitFor(() => expect(listenPortInput.value).toBe('81'))

    const targetProtocolCaret = container
      .querySelector(`input[value="http"] + [class*="bp3-input-action"]`)
      ?.querySelector('[icon="chevron-down"]')
    await waitFor(() => {
      fireEvent.click(targetProtocolCaret!)
    })
    const targetProtocolToSelect = await findByText(container, 'https')
    act(() => {
      fireEvent.click(targetProtocolToSelect)
    })

    const targetPortInput = container.querySelector(`input[value="8080"]`) as HTMLInputElement
    await waitFor(() => {
      fireEvent.change(targetPortInput!, { target: { value: 8081 } })
    })
    expect(targetPortInput.value).toBe('8081')

    expect(container).toMatchSnapshot('updated route')
  })

  test('render additional columns for redirection rule', async () => {
    const { container, getByTestId } = render(
      <TestWrapper>
        <CORoutingTable routingRecords={records} setRoutingRecords={jest.fn()} />
      </TestWrapper>
    )

    const actionCaret = container
      .querySelector(`input[value="Forward"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')
    await waitFor(() => {
      fireEvent.click(actionCaret!)
    })
    const actionToSelect = await findByText(container, 'Redirect')
    act(() => {
      fireEvent.click(actionToSelect)
    })

    const redirectUrlInput = container.querySelector(`input[value="redirect_url"]`) as HTMLInputElement
    await waitFor(() => {
      fireEvent.change(redirectUrlInput!, { target: { value: 'updated_redirect_url' } })
    })
    expect(redirectUrlInput.value).toBe('updated_redirect_url')

    const serverNameInput = container.querySelector(`input[value="server_name"]`) as HTMLInputElement
    await waitFor(() => {
      fireEvent.change(serverNameInput!, { target: { value: 'updated_server_name' } })
    })
    expect(serverNameInput.value).toBe('updated_server_name')

    const routingRulesInput = getByTestId('routingRules') as HTMLInputElement
    await act(() => {
      fireEvent.change(routingRulesInput!, { target: { value: 'updated_routing_rules' } })
    })
    expect(routingRulesInput.value).toBe('updated_routing_rules')

    expect(container).toMatchSnapshot()
  })
})
