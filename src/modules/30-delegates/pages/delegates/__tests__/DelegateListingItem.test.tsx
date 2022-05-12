/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, act, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import DelegatesListingItem, { DelegateListingHeader } from '../DelegateListingItem'
import { delegateGroupsMock } from './DelegateGroupsMock'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const setOpenTroubleshoterFn = jest.fn()

jest.mock('services/portal', () => ({
  useDeleteDelegateGroupByIdentifier: () => ({
    mutate: jest.fn()
  })
}))

describe('DelegateListingHeader test', () => {
  test('render DelegateListingHeader', () => {
    const { container } = render(
      <TestWrapper>
        <DelegateListingHeader />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

describe('Delegates Listing With Groups', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper>
        <DelegatesListingItem delegate={delegateGroupsMock[0]} setOpenTroubleshoter={setOpenTroubleshoterFn} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('Click on item', async () => {
    const { container } = render(
      <TestWrapper>
        <DelegatesListingItem delegate={delegateGroupsMock[0]} setOpenTroubleshoter={setOpenTroubleshoterFn} />
      </TestWrapper>
    )
    act(() => {
      fireEvent.click(container.firstChild!)
    })
    expect(container).toMatchSnapshot()
  })
  test('click on delegate item action', async () => {
    const { getAllByText, container } = render(
      <TestWrapper>
        <DelegatesListingItem delegate={delegateGroupsMock[1]} setOpenTroubleshoter={setOpenTroubleshoterFn} />
      </TestWrapper>
    )
    const menuBtn = container.querySelector('button') as HTMLButtonElement
    userEvent.click(menuBtn!)
    userEvent.click(getAllByText('delegates.troubleshootOption')[0]!)
    expect(document.body.innerHTML).toContain('troubleshoot')
  })
  test('click on delegate item delete action', async () => {
    const { getAllByText, container, queryAllByText } = render(
      <TestWrapper>
        <DelegatesListingItem delegate={delegateGroupsMock[1]} setOpenTroubleshoter={setOpenTroubleshoterFn} />
      </TestWrapper>
    )
    const menuBtn = container.querySelector('button') as HTMLButtonElement
    act(() => {
      fireEvent.click(menuBtn!)
    })
    await waitFor(() => {
      expect(getAllByText('delete')[0]).toBeDefined()
    })
    const deleteBtn = getAllByText('delete')[0]
    act(() => {
      fireEvent.click(deleteBtn!)
    })
    expect(document.body.querySelector('[class*="useConfirmationDialog"]')).toBeDefined()
    const modalDeleteBtn = queryAllByText('delete')[1]
    act(() => {
      fireEvent.click(modalDeleteBtn!)
    })
    waitFor(() => {
      expect(document.body.innerHTML).not.toContain('useConfirmationDialog')
    })
  })

  test('click on delegate item and expand it', async () => {
    const { container } = render(
      <TestWrapper>
        <DelegatesListingItem delegate={delegateGroupsMock[1]} setOpenTroubleshoter={setOpenTroubleshoterFn} />
      </TestWrapper>
    )
    const expandRowBtn = container.querySelector('[data-icon="chevron-right"]') as HTMLButtonElement
    act(() => {
      fireEvent.click(expandRowBtn!)
    })

    waitFor(() => {
      expect(document.body.innerHTML).toContain('delegates.noInstances')
    })
  })
})
