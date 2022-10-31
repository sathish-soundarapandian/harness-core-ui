/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, getByRole, getByText, render, waitFor } from '@testing-library/react'
import { defaultTo } from 'lodash-es'
import { findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import { mockTemplates } from '@templates-library/TemplatesTestHelper'
import { ContextMenuProps, DTListCardContextMenu } from '../DTListCardContextMenu'

const template = defaultTo(mockTemplates.data?.content?.[0], {})

const baseProps: ContextMenuProps = {
  template: template,
  onDelete: jest.fn(),
  onPreview: jest.fn(),
  onOpenEdit: jest.fn()
}

describe('<DTListCardContextMenu /> tests', () => {
  test('should match snapshot', async () => {
    const { container } = render(
      <TestWrapper>
        <DTListCardContextMenu {...baseProps} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should call correct method on click of menu items', async () => {
    const { container } = render(
      <TestWrapper>
        <DTListCardContextMenu {...baseProps} />
      </TestWrapper>
    )

    const menuBtn = getByRole(container, 'button', { name: 'more' })
    act(() => {
      fireEvent.click(menuBtn)
    })

    const popover = findPopoverContainer() as HTMLElement
    await waitFor(() => popover)

    const previewBtn = getByText(popover, 'connectors.ceAws.crossAccountRoleExtention.step1.p2')
    fireEvent.click(previewBtn)
    expect(baseProps.onPreview).toBeCalledWith(template)

    const editBtn = getByText(popover, 'templatesLibrary.openEditTemplate')
    fireEvent.click(editBtn)
    expect(baseProps.onOpenEdit).toBeCalledWith(template)

    const deleteBtn = getByText(popover, 'pipeline.removeTemplateLabel')
    fireEvent.click(deleteBtn)
    expect(baseProps.onDelete).toBeCalledWith(template)
  })
})
