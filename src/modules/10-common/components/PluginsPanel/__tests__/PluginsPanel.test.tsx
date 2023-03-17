/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { PluginsPanel } from '../PluginsPanel'
import * as pluginsListMock from './mocks.json'

jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: (key: string) => key
  })
}))

const mockFetch = jest.fn()

jest.mock('services/ci', () => ({
  useListPlugins: () => ({
    loading: false,
    data: pluginsListMock,
    refetch: mockFetch
  })
}))

describe('Test PluginsPanel component', () => {
  test('Initial render is ok', () => {
    const { getByText } = render(<PluginsPanel onPluginAddUpdate={jest.fn()} onPluginDiscard={jest.fn()} />)
    expect(getByText('AWS CloudFormation')).toBeInTheDocument()
  })

  test('Ensure plugins are filtered', async () => {
    const { container, getByText } = render(<PluginsPanel onPluginAddUpdate={jest.fn()} onPluginDiscard={jest.fn()} />)
    expect(getByText('AWS CloudFormation')).toBeInTheDocument()
    const searchButton = container.querySelector('[class*="ExpandingSearchInput"]')
    expect(searchButton).toBeDefined()
    act(() => {
      fireEvent.click(searchButton!)
    })

    const input = container.querySelector('input[type="search"]') as HTMLInputElement
    expect(input).toBeDefined()
    act(() => {
      fireEvent.change(input, { target: { value: 'qwertyuiop' } })
    })
    expect(input.value).toBe('qwertyuiop')
    expect(mockFetch).toBeCalled()
    expect(mockFetch).toBeCalledTimes(2) // initial fetch and fetch on filter search
  })

  test('Clicking on a plugin from list opens plugins config form', async () => {
    delete (window as any).location
    window.location = {} as any
    const setHrefSpy = jest.fn(href => href)
    Object.defineProperty(window.location, 'href', {
      set: setHrefSpy
    })
    const { container, getByText } = render(<PluginsPanel onPluginAddUpdate={jest.fn()} onPluginDiscard={jest.fn()} />)
    expect(getByText('AWS CloudFormation')).toBeInTheDocument()
    act(() => {
      fireEvent.click(getByText('AWS CloudFormation')!)
    })
    expect(getByText('Parallel')).toBeInTheDocument()
    expect(getByText('Stackname')).toBeInTheDocument()
    const addBtn = container.querySelector('button[type="submit"]')!
    act(() => {
      fireEvent.click(addBtn)
    })
    expect(addBtn).toBeDisabled()
    const docsLink = container.querySelector('a')
    expect(docsLink).toBeInTheDocument()
    expect(docsLink).toHaveAttribute('href', 'https://github.com/robertstettner/drone-cloudformation')
  })
})
