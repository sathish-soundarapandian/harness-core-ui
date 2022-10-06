/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { findByText, fireEvent, render, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import COHealthCheckTable from '../COHealthCheckTable'

jest.mock('lodash-es', () => ({
  ...jest.requireActual('lodash-es'),
  debounce: (fn: any) => {
    fn.cancel = jest.fn()
    return fn
  }
}))

const mockPattern = {
  protocol: 'http',
  path: '/',
  port: 80,
  timeout: 30,
  interval: 90,
  status_code_from: 200,
  status_code_to: 299
}

describe('HealthCheck table tests', () => {
  test('render table', () => {
    const { container } = render(
      <TestWrapper>
        <COHealthCheckTable pattern={mockPattern} updatePattern={jest.fn()} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('update table values', async () => {
    const { container } = render(
      <TestWrapper>
        <COHealthCheckTable pattern={mockPattern} updatePattern={jest.fn()} />
      </TestWrapper>
    )

    // protocol change
    const protocolCaret = container
      .querySelector(`input[value="http"] + [class*="bp3-input-action"]`)
      ?.querySelector('[icon="chevron-down"]')
    act(() => {
      fireEvent.click(protocolCaret!)
    })
    const protocolToSelect = await findByText(container, 'https')
    act(() => {
      fireEvent.click(protocolToSelect)
    })

    // port change
    const portInput = container.querySelector(`input[value="80"]`) as HTMLInputElement
    act(() => {
      fireEvent.change(portInput!, { target: { value: 81 } })
    })
    await waitFor(() => expect(portInput.value).toBe('81'))

    // path change
    const pathInput = container.querySelector(`input[value="/"]`) as HTMLInputElement
    act(() => {
      fireEvent.change(pathInput!, { target: { value: '/random' } })
    })
    await waitFor(() => expect(pathInput.value).toBe('/random'))

    // timeout change
    const timeoutInput = container.querySelector(`input[value="30"]`) as HTMLInputElement
    act(() => {
      fireEvent.change(timeoutInput!, { target: { value: 60 } })
    })
    await waitFor(() => expect(timeoutInput.value).toBe('60'))

    // status change
    const statusInput = container.querySelector(`input[value="200-299"]`) as HTMLInputElement
    act(() => {
      fireEvent.change(statusInput!, { target: { value: '200-399' } })
    })
    await waitFor(() => expect(statusInput.value).toBe('200-399'))

    expect(container).toMatchSnapshot()
  })
})
