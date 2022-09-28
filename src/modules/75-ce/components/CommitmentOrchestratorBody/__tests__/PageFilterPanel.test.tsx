/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, findByText, fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import PageFilterPanel from '../PageFilterPanel'

const mockedFiltersResponse = {
  response: {
    region: ['ap-south-1', 'us-west-1', 'us-east-1', 'ap-southeast-1', 'eu-west-2', 'ca-central-1', 'us-west-2'],
    instance_family: ['t2', 'm5', 'i3', 'c5', 'c6a', 't3a', 'm4', 't3'],
    account_id: ['357919113896', '868001352780']
  }
}

jest.mock('services/lw-co', () => ({
  useFetchFilters: jest.fn().mockImplementation(() => ({
    mutate: jest.fn(() => Promise.resolve(mockedFiltersResponse))
  }))
}))

describe('Filter Panel', () => {
  const assertFilterSelection = async (container: HTMLElement, name: string, value: string) => {
    const regionsDropdown = container.querySelector(`input[name="${name}"]`) as HTMLInputElement
    const regionsCaret = container
      .querySelector(`input[name="${name}"] + [class*="bp3-input-action"]`)
      ?.querySelector('[data-icon="chevron-down"]')
    fireEvent.click(regionsCaret!)
    const regionToSelect = await findByText(container, value)
    act(() => {
      fireEvent.click(regionToSelect)
    })
    expect(regionsDropdown.value).toBe(value)
  }

  test('render and change region filter', async () => {
    const fn = jest.fn()
    const { container } = render(
      <TestWrapper>
        <PageFilterPanel applyFilter={fn} />
      </TestWrapper>
    )

    await assertFilterSelection(container, 'region', 'ap-south-1')

    expect(fn).toHaveBeenCalled()
  })

  test('render and change instance family filter', async () => {
    const fn = jest.fn()
    const { container } = render(
      <TestWrapper>
        <PageFilterPanel applyFilter={fn} />
      </TestWrapper>
    )

    await assertFilterSelection(container, 'instanceFamily', 't2')

    expect(fn).toHaveBeenCalled()
  })

  test('render and change account id filter', async () => {
    const fn = jest.fn()
    const { container } = render(
      <TestWrapper>
        <PageFilterPanel applyFilter={fn} />
      </TestWrapper>
    )

    await assertFilterSelection(container, 'accountId', '357919113896')

    expect(fn).toHaveBeenCalled()
  })
})
