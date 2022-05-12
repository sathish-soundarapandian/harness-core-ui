/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { AdvancedOptions } from '../AdvancedOptions'

const mockGetCallFunction = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegateSelectorsUpTheHierarchy: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return []
  })
}))
describe('<AdvancedOptions/> tests', () => {
  const baseProps = {
    pipeline: {
      name: 'Some Pipeline',
      identifier: 'Some_Pipeline',
      allowStageExecutions: false,
      timeout: '20m',
      stages: []
    },
    onApplyChanges: jest.fn(),
    onDiscard: jest.fn()
  }

  test('should match snapshot', async () => {
    const { container } = render(
      <TestWrapper>
        <AdvancedOptions {...baseProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('discard and apply should work as expected when values are changed', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <AdvancedOptions {...baseProps} />
      </TestWrapper>
    )

    await act(async () => {
      fireEvent.click(getByText('common.discard'))
    })
    expect(baseProps.onDiscard).toBeCalledWith()

    act(() => {
      fireEvent.change(container.querySelector('input[name="timeout"]')!, { target: { value: '30m' } })
    })
    act(() => {
      fireEvent.click(container.querySelector('input[name="allowStageExecutions"][value="true"]')!)
    })
    await act(async () => {
      fireEvent.click(getByText('applyChanges'))
    })
    expect(baseProps.onApplyChanges).toBeCalledWith({
      allowStageExecutions: true,
      identifier: 'Some_Pipeline',
      name: 'Some Pipeline',
      timeout: '30m',
      stages: []
    })
  })

  test('should not set timeout when field is cleared', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <AdvancedOptions {...baseProps} />
      </TestWrapper>
    )
    act(() => {
      fireEvent.change(container.querySelector('input[name="timeout"]')!, { target: { value: '' } })
    })
    await act(async () => {
      fireEvent.click(getByText('applyChanges'))
    })
    expect(baseProps.onApplyChanges).toBeCalledWith({
      allowStageExecutions: false,
      identifier: 'Some_Pipeline',
      name: 'Some Pipeline',
      stages: []
    })
  })
})
