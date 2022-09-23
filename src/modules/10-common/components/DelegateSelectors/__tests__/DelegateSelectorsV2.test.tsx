/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, getByText } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DelegateSelectorsV2 from '../DelegateSelectorsV2'
import { mockDelegateSelectorsResponse, mockSelectedData } from './DelegateSelectorsMockData'

const props = {
  data: mockDelegateSelectorsResponse.data.resource,
  onTagInputChange: jest.fn(),
  selectedItems: mockSelectedData
}
describe('Test DelegateSelectorsV2', () => {
  test('Test snapshot', () => {
    const { container } = render(
      <TestWrapper>
        <DelegateSelectorsV2 {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Click option tag', () => {
    const { container } = render(
      <TestWrapper>
        <DelegateSelectorsV2 {...props} />
      </TestWrapper>
    )
    const inputBox = container.getElementsByClassName('bp3-multi-select-tag-input-input')[0]
    fireEvent.change(inputBox, { target: { value: 'delegate' } })
    const option = getByText(container, 'delegate1')
    fireEvent.click(option)
    expect(option).not.toBeNull()
  })

  test('remove selected tag', async () => {
    const { container } = render(
      <TestWrapper>
        <DelegateSelectorsV2 {...props} />
      </TestWrapper>
    )
    expect(getByText(container, mockSelectedData[0])).toBeInTheDocument()
    const removeTag = container.getElementsByClassName('bp3-tag-remove')[0]
    fireEvent.click(removeTag)
  })

  test('throw error for invalid tag', async () => {
    const invalidTag = '${special-#$$%%^-characters'
    const { container, baseElement } = render(
      <TestWrapper>
        <DelegateSelectorsV2 {...props} />
      </TestWrapper>
    )
    const inputBox = container.getElementsByClassName('bp3-multi-select-tag-input-input')[0]
    fireEvent.change(inputBox, { target: { value: invalidTag } })
    const option = getByText(container, `Create "${invalidTag}"`)
    fireEvent.click(option)
    expect(baseElement.innerHTML).toContain('delegate.DelegateSelectorErrMsgSplChars')
  })

  test('add new tag', async () => {
    const validTag = 'valid-tag'
    const { container, baseElement } = render(
      <TestWrapper>
        <DelegateSelectorsV2 {...props} />
      </TestWrapper>
    )
    const inputBox = container.getElementsByClassName('bp3-multi-select-tag-input-input')[0]
    fireEvent.change(inputBox, { target: { value: validTag } })
    const option = getByText(container, `Create "${validTag}"`)
    fireEvent.click(option)
    expect(baseElement.innerHTML).toContain(validTag)
  })
})
