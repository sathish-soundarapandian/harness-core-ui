/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, screen, fireEvent, render, waitFor } from '@testing-library/react'
import { useListPlugins } from 'services/ci'
import { PluginsPanel } from '../PluginsPanel'
import { pluginsWithRequiredField, pluginsWithoutRequiredField } from './mocks'

jest.mock('framework/strings', () => ({
  useStrings: () => ({
    getString: (key: string) => key
  })
}))

const mockFetch = jest.fn(() => Promise.resolve(pluginsWithRequiredField))

jest.mock('services/ci', () => ({
  useListPlugins: jest.fn().mockImplementation(() => ({
    loading: false,
    data: pluginsWithoutRequiredField,
    refetch: mockFetch
  }))
}))

describe('Test PluginsPanel component', () => {
  test('Initial render is ok', () => {
    const { container } = render(<PluginsPanel onPluginAddUpdate={jest.fn()} onPluginDiscard={jest.fn()} />)
    expect(container.querySelectorAll('[class*="pluginCategory"]').length).toBe(6)
  })

  test('Should not load plugins via api call for Run step category', () => {
    const { getByText } = render(<PluginsPanel onPluginAddUpdate={jest.fn()} onPluginDiscard={jest.fn()} />)
    const runStepCategory = getByText('runPipelineText step')
    expect(runStepCategory).toBeDefined()
    act(() => {
      fireEvent.click(runStepCategory!)
    })
    expect(mockFetch).not.toBeCalled()
  })

  test('Ensure plugins are filtered for Harness Plugins category', async () => {
    const { container, getByText } = render(<PluginsPanel onPluginAddUpdate={jest.fn()} onPluginDiscard={jest.fn()} />)
    const harnessPluginsCategory = getByText('harness common.plugins')
    expect(harnessPluginsCategory).toBeDefined()
    act(() => {
      fireEvent.click(harnessPluginsCategory!)
    })

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
    expect(mockFetch).toBeCalledTimes(1) // no initial fetch, fetches only on filter search
  })

  test('Clicking on a plugin from list opens plugins config form', async () => {
    delete (window as any).location
    window.location = {} as any
    const setHrefSpy = jest.fn(href => href)
    Object.defineProperty(window.location, 'href', {
      set: setHrefSpy
    })
    const { container, getByText } = render(<PluginsPanel onPluginAddUpdate={jest.fn()} onPluginDiscard={jest.fn()} />)
    act(() => {
      fireEvent.click(getByText('harness common.plugins'))
    })
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

  test('Select plugin label and plugins filter should be visible for Plugin categories with listing', async () => {
    const { container, getByText } = render(<PluginsPanel onPluginAddUpdate={jest.fn()} onPluginDiscard={jest.fn()} />)

    // go to list view for Harness Plugins
    const harnessPluginsCategory = getByText('harness common.plugins')
    expect(harnessPluginsCategory).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(harnessPluginsCategory)
      await waitFor(() => expect(harnessPluginsCategory).not.toBeInTheDocument())
      expect(getByText('select common.plugin.label')).toBeInTheDocument()
      expect(document.body.querySelector('[class*="ExpandingSearchInput"]')).toBeInTheDocument()
      expect(container.querySelector('span[icon="arrow-left"]')).toBeInTheDocument()
    })
  })

  test('Select plugin label and plugins filter should not be visible for Harness built-in steps', async () => {
    const { container, getByText } = render(<PluginsPanel onPluginAddUpdate={jest.fn()} onPluginDiscard={jest.fn()} />)
    const runStepPluginCategory = getByText('runPipelineText step')
    expect(runStepPluginCategory).toBeInTheDocument()
    await act(async () => {
      fireEvent.click(runStepPluginCategory)
      await waitFor(() => expect(getByText('Script')).toBeInTheDocument())
      expect(runStepPluginCategory).not.toBeInTheDocument()
      expect(screen.queryByText('select common.plugin.label')).toBeNull()
      expect(container.querySelector('span[icon="arrow-left"]')).toBeInTheDocument()
      expect(document.body.querySelector('[class*="ExpandingSearchInput"]')).not.toBeInTheDocument()
    })
  })

  test('Arrow navigation takes user to correct Panel view', async () => {
    const { container, getByText } = render(<PluginsPanel onPluginAddUpdate={jest.fn()} onPluginDiscard={jest.fn()} />)
    expect(getByText('runPipelineText step')).toBeInTheDocument()

    // nav for Harness built-in steps
    await act(async () => {
      fireEvent.click(getByText('runPipelineText step'))
    })
    await waitFor(() => expect(getByText('Script')).toBeInTheDocument())
    expect(screen.queryByText('runPipelineText step')).toBeNull()

    await act(async () => {
      fireEvent.click(container.querySelector('span[icon="arrow-left"]')!)
    })
    await waitFor(() => expect(getByText('runPipelineText step')).toBeInTheDocument())
    expect(screen.queryByText('Script')).toBeNull()

    // nav for other plugin categories

    // go to list view
    await act(async () => {
      fireEvent.click(getByText('common.bitrise common.plugins'))
    })

    await waitFor(() => expect(getByText('select common.plugin.label')).toBeInTheDocument())
    expect(screen.queryByText('common.bitrise common.plugins')).toBeNull()

    // go to config view for one of the plugins from the list
    await act(async () => {
      fireEvent.click(getByText('AWS CloudFormation')!)
    })
    expect(screen.queryByText('common.optionalConfig')).toBeNull()
    await waitFor(() => expect(screen.queryByText('select common.plugin.label')).toBeNull())

    // go back to list view
    await act(async () => {
      fireEvent.click(container.querySelector('span[icon="arrow-left"]')!)
    })
    await waitFor(() => expect(getByText('select common.plugin.label')).toBeInTheDocument())

    // go back to category view
    await act(async () => {
      fireEvent.click(container.querySelector('span[icon="arrow-left"]')!)
    })
    expect(screen.queryByText('common.bitrise common.plugins')).toBeNull()
  })

  test('Should show Optional configuration section if the plugin has optional fields', () => {
    ;(useListPlugins as jest.Mock).mockImplementation(() => ({
      loading: false,
      data: pluginsWithRequiredField,
      refetch: mockFetch
    }))
    const { getByText } = render(<PluginsPanel onPluginAddUpdate={jest.fn()} onPluginDiscard={jest.fn()} />)
    act(() => {
      fireEvent.click(getByText('harness common.plugins'))
    })
    act(() => {
      fireEvent.click(getByText('AWS CloudFormation')!)
    })
    expect(getByText('common.optionalConfig')).toBeInTheDocument()
  })
})
