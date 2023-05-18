/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import type { Target, Variation } from 'services/cf'
import ItemVariationDialog, { ItemVariationDialogProps } from '../ItemVariationDialog'
import { mockVariations } from './utils.mocks'

const mockItems: ItemVariationDialogProps['items'] = [
  { identifier: 'i1', name: 'Item 1' },
  { identifier: 'i2', name: 'Item 2' },
  { identifier: 'i3', name: 'Item 3' }
]

const renderComponent = (props: Partial<ItemVariationDialogProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <ItemVariationDialog
        title="dialog title"
        itemPlaceholder="item placeholder"
        itemLabel="item label"
        isOpen={true}
        closeDialog={jest.fn()}
        items={mockItems}
        selectedItems={[]}
        variations={mockVariations}
        onChange={jest.fn()}
        {...props}
      />
    </TestWrapper>
  )

describe('ItemVariationDialog', () => {
  test('it should display the dialog when isOpen is true', async () => {
    const title = 'TEST'
    const Subject: FC<{ isOpen: boolean }> = ({ isOpen }) => (
      <TestWrapper>
        <ItemVariationDialog
          title={title}
          itemLabel="item label"
          itemPlaceholder="item placeholder"
          isOpen={isOpen}
          closeDialog={jest.fn()}
          items={mockItems}
          selectedItems={[]}
          variations={mockVariations}
          onChange={jest.fn()}
        />
      </TestWrapper>
    )

    const { rerender } = render(<Subject isOpen={false} />)
    expect(screen.queryByText(title)).not.toBeInTheDocument()

    rerender(<Subject isOpen={true} />)
    expect(screen.queryByText(title)).toBeInTheDocument()
  })

  test('it should display the passed title', async () => {
    const title = 'TEST MODULE TITLE'
    renderComponent({ title })

    expect(screen.getByText(title)).toBeInTheDocument()
  })

  test('it should display a select to choose items', async () => {
    const itemLabel = 'TEST ITEM LABEL'
    renderComponent({ itemLabel })

    expect(screen.getByText(itemLabel)).toBeInTheDocument()

    const inputEl = document.querySelector('[name="items"]')
    expect(inputEl).toBeInTheDocument()

    await userEvent.click(inputEl as HTMLInputElement)

    await waitFor(() => {
      mockItems.forEach(({ name }) => expect(screen.getByText(name)).toBeInTheDocument())
    })
  })

  test('it should display a select to choose variation', async () => {
    renderComponent()

    expect(screen.getByText('cf.pipeline.flagConfiguration.variationServed')).toBeInTheDocument()

    const inputEl = document.querySelector('[name="variation"]')
    expect(inputEl).toBeInTheDocument()

    await userEvent.click(inputEl as HTMLInputElement)

    await waitFor(() => {
      mockVariations.forEach(({ name, identifier }) =>
        expect(screen.getByText((name || identifier) as string)).toBeInTheDocument()
      )
    })
  })

  test('it should call the closeDialog function when the cancel button is clicked', async () => {
    const closeDialogMock = jest.fn()
    renderComponent({ closeDialog: closeDialogMock })

    const btn = screen.getByRole('button', { name: 'cancel' })
    expect(btn).toBeInTheDocument()
    expect(closeDialogMock).not.toHaveBeenCalled()

    await userEvent.click(btn)

    await waitFor(() => expect(closeDialogMock).toHaveBeenCalled())
  })

  test('it should call the onChange function when the form is filled out and submitted', async () => {
    const onChangeMock = jest.fn()
    const closeDialogMock = jest.fn()
    renderComponent({ onChange: onChangeMock, closeDialog: closeDialogMock })

    expect(onChangeMock).not.toHaveBeenCalled()
    expect(closeDialogMock).not.toHaveBeenCalled()

    await userEvent.click(document.querySelector('[name="items"]') as HTMLInputElement)
    await waitFor(() => {
      expect(screen.getByText(mockItems[0].name)).toBeInTheDocument()
      expect(screen.getByText(mockItems[1].name)).toBeInTheDocument()
    })
    await userEvent.click(screen.getByText(mockItems[0].name))
    await userEvent.click(screen.getByText(mockItems[1].name))

    await userEvent.click(document.querySelector('[name="variation"]') as HTMLInputElement)
    await waitFor(() =>
      expect(screen.getByText((mockVariations[0].name || mockVariations[0].identifier) as string)).toBeInTheDocument()
    )
    await userEvent.click(screen.getByText((mockVariations[0].name || mockVariations[0].identifier) as string))

    await userEvent.click(screen.getByRole('button', { name: 'done' }))

    await waitFor(() => {
      expect(onChangeMock).toHaveBeenCalledWith([mockItems[0], mockItems[1]], mockVariations[0])
      expect(closeDialogMock).toHaveBeenCalled()
    })
  })

  test('it should not call the onChange function when the form is not filled out and submit button is clicked', async () => {
    const onChangeMock = jest.fn()
    renderComponent({ onChange: onChangeMock })

    expect(onChangeMock).not.toHaveBeenCalled()

    await userEvent.click(screen.getByRole('button', { name: 'done' }))

    await waitFor(() => expect(onChangeMock).not.toHaveBeenCalled())
  })

  test('it should pre-select selectedItems', async () => {
    const selectedItems = [mockItems[0], mockItems[2]] as Target[]
    renderComponent({ selectedItems })

    selectedItems.forEach(({ name }) => expect(screen.getByText(name)).toBeInTheDocument())
  })

  test('it should pre-select selectedVariation', async () => {
    const selectedVariation = mockVariations[1] as Variation
    renderComponent({ selectedVariation })

    expect(document.querySelector('[name="variation"]')).toHaveValue(
      selectedVariation.name || selectedVariation.identifier
    )
  })
})
