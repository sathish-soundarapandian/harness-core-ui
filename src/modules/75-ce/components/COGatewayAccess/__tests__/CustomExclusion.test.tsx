/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, findByText, fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { GatewayDetails } from '@ce/components/COCreateGateway/models'
import CustomExclusion from '../CustomExclusion'

const mockGatewayDetails = {}

jest.mock('lodash-es', () => ({
  ...(jest.requireActual('lodash-es') as Record<string, any>),
  debounce: jest.fn(fn => {
    fn.cancel = jest.fn()
    return fn
  })
}))

describe('Custom Exclusion/Inclusion', () => {
  test('should be able to add an item', async () => {
    const setFn = jest.fn()
    const { getByText, getByTestId } = render(
      <TestWrapper>
        <CustomExclusion gatewayDetails={mockGatewayDetails as unknown as GatewayDetails} setGatewayDetails={setFn} />
      </TestWrapper>
    )
    act(() => {
      fireEvent.click(getByText('+ add'))
    })

    await waitFor(() => {
      expect(getByTestId('customItemsContainer').children.length).toBeGreaterThan(1)
    })
    expect(setFn).toHaveBeenCalled()
  })

  test('should be able to edit an item', async () => {
    const setFn = jest.fn()
    const { container, getByText, getByTestId } = render(
      <TestWrapper>
        <CustomExclusion gatewayDetails={mockGatewayDetails as unknown as GatewayDetails} setGatewayDetails={setFn} />
      </TestWrapper>
    )
    act(() => {
      fireEvent.click(getByText('+ add'))
    })

    await waitFor(() => {
      expect(getByTestId('customItemsContainer').children.length).toBeGreaterThan(1)
    })
    const input = container.querySelector(
      'input[placeholder="ce.co.autoStoppingRule.setupAccess.customExclusion.option1Placeholder"]'
    ) as HTMLInputElement
    act(() => {
      fireEvent.change(input, { target: { value: 'test/path' } })
    })
    expect(input.value).toBe('test/path')
    expect(setFn).toHaveBeenCalled()
  })

  test('should be able to edit type of custom item', async () => {
    const setFn = jest.fn()
    const { container, getByText, getByTestId } = render(
      <TestWrapper>
        <CustomExclusion gatewayDetails={mockGatewayDetails as unknown as GatewayDetails} setGatewayDetails={setFn} />
      </TestWrapper>
    )
    act(() => {
      fireEvent.click(getByText('+ add'))
    })

    await waitFor(() => {
      expect(getByTestId('customItemsContainer').children.length).toBeGreaterThan(1)
    })
    const dropdown = container.querySelector('input[name="kindSelector"]') as HTMLInputElement
    const caret = container
      .querySelector(`input[name="kindSelector"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')
    await waitFor(() => {
      fireEvent.click(caret!)
    })
    const kindToSelect = await findByText(container, 'ce.co.autoStoppingRule.setupAccess.customExclusion.option3Label')
    act(() => {
      fireEvent.click(kindToSelect)
    })
    expect(dropdown.value).toBe('ce.co.autoStoppingRule.setupAccess.customExclusion.option3Label')
    expect(setFn).toHaveBeenCalled()
  })

  test('should be able to delete the item', async () => {
    const { container, getByText, getByTestId } = render(
      <TestWrapper>
        <CustomExclusion
          gatewayDetails={mockGatewayDetails as unknown as GatewayDetails}
          setGatewayDetails={jest.fn()}
        />
      </TestWrapper>
    )
    act(() => {
      fireEvent.click(getByText('+ add'))
    })

    await waitFor(() => {
      expect(getByTestId('customItemsContainer').children.length).toBeGreaterThan(1)
    })

    act(() => {
      fireEvent.click(container.querySelector('span[data-icon="main-trash"]') as HTMLElement)
    })

    await waitFor(() => {
      expect(getByTestId('customItemsContainer').children.length).toBe(1)
    })
  })
})
