/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, getByText, screen, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DelegateSelectorsV2 from '../DelegateSelectorsV2'
import { mockDelegateSelectorsResponse, mockSelectedData } from './DelegateSelectorsMockData'

const props = {
  data: mockDelegateSelectorsResponse.data.resource,
  onTagInputChange: jest.fn(),
  selectedItems: mockSelectedData
}
describe('Test DelegateSelectorsV2', () => {
  test('renders selected items', async () => {
    render(
      <TestWrapper>
        <DelegateSelectorsV2 {...props} />
      </TestWrapper>
    )

    await waitFor(() => {
      mockSelectedData.forEach(item => expect(screen.getByText(item)).toBeInTheDocument())
    })
  })

  test('Click option tag', () => {
    const onTagInputChange = jest.fn()
    const { container } = render(
      <TestWrapper>
        <DelegateSelectorsV2 {...props} onTagInputChange={onTagInputChange} />
      </TestWrapper>
    )
    const inputBox = container.getElementsByClassName('bp3-multi-select-tag-input-input')[0]
    fireEvent.change(inputBox, { target: { value: 'delegate' } })
    const option = getByText(container, 'delegate1')
    fireEvent.click(option)
    expect(option).not.toBeNull()
    expect(onTagInputChange).toHaveBeenLastCalledWith(['delegate-selector', 'delegate-selector3', 'delegate1'])
  })

  test('remove selected tag', () => {
    const onTagInputChange = jest.fn()
    const { container } = render(
      <TestWrapper>
        <DelegateSelectorsV2 {...props} onTagInputChange={onTagInputChange} />
      </TestWrapper>
    )
    expect(getByText(container, mockSelectedData[0])).toBeInTheDocument()
    const removeTag = container.getElementsByClassName('bp3-tag-remove')[0]
    fireEvent.click(removeTag)
    expect(onTagInputChange).toHaveBeenLastCalledWith(['delegate-selector3'])
  })

  test('throw error for invalid tag', async () => {
    const invalidTag = '${special-#$$%%^-characters'
    const { container } = render(
      <TestWrapper>
        <DelegateSelectorsV2 {...props} />
      </TestWrapper>
    )
    const inputBox = container.getElementsByClassName('bp3-multi-select-tag-input-input')[0]
    fireEvent.change(inputBox, { target: { value: invalidTag } })
    const option = getByText(container, `Create "${invalidTag}"`)
    fireEvent.click(option)

    expect(await screen.findByText(/delegate.DelegateSelectorErrMsgSplChars/)).toBeInTheDocument()
  })

  test('add new tag', async () => {
    const validTag = 'valid-tag'
    const onTagInputChange = jest.fn()
    const { baseElement } = render(
      <TestWrapper>
        <DelegateSelectorsV2 {...props} onTagInputChange={onTagInputChange} />
      </TestWrapper>
    )
    const inputBox = baseElement.getElementsByClassName('bp3-multi-select-tag-input-input')[0]
    fireEvent.change(inputBox, { target: { value: validTag } })
    const option = await screen.findByText(`Create "${validTag}"`)
    fireEvent.click(option)

    expect(onTagInputChange).toHaveBeenLastCalledWith(['delegate-selector', 'delegate-selector3', 'valid-tag'])
  })
})
