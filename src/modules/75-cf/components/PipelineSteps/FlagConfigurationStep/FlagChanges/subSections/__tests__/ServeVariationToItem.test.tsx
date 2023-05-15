/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import ServeVariationToItem, { ServeVariationToItemProps } from '../ServeVariationToItem'
import * as ItemVariationDialog from '../ItemVariationDialog'
import { mockVariations } from './utils.mocks'

const getProfileInitials = (str: string): string =>
  str
    .split(' ')
    .map(([firstLetter]) => firstLetter.toUpperCase())
    .join('')

const mockItems: ServeVariationToItemProps['items'] = [
  { identifier: 'i1', name: 'Item 1' },
  { identifier: 'i2', name: 'Item 2' },
  { identifier: 'i3', name: 'Item 3' }
]

const renderComponent = (props: Partial<ServeVariationToItemProps> = {}): RenderResult =>
  render(
    <TestWrapper>
      <ServeVariationToItem
        dialogTitle="Add item"
        itemLabel="item label"
        itemPlaceholder="item placeholder"
        itemFieldName="items"
        serveItemString="item"
        serveItemsString="items"
        variations={mockVariations}
        items={mockItems}
        selectedItems={[]}
        setField={jest.fn()}
        instructionType="TEST"
        instructionIdentifier="TestIdentifier"
        {...props}
      />
    </TestWrapper>
  )

describe('ServeVariationToItem', () => {
  let dialogSpy: jest.SpyInstance
  beforeEach(() => {
    dialogSpy = jest.spyOn(ItemVariationDialog, 'default').mockReturnValue(<span />)
    jest.clearAllMocks()
  })

  test('it should call setField with the type and identifier', async () => {
    const instructionType = 'TEST INSTRUCTION TYPE'
    const instructionIdentifier = 'TEST_IDENTIFIER'
    const setFieldMock = jest.fn()

    renderComponent({ instructionType, instructionIdentifier, setField: setFieldMock })

    await waitFor(() => {
      expect(setFieldMock).toHaveBeenCalledWith('type', instructionType)
      expect(setFieldMock).toHaveBeenCalledWith('identifier', instructionIdentifier)
    })
  })

  test('it should open the dialog when the add button is pressed', async () => {
    const dialogTitle = 'TEST BUTTON TEXT'

    renderComponent({ dialogTitle })

    expect(dialogSpy).toHaveBeenCalledWith(expect.objectContaining({ isOpen: false }), {})

    const btn = screen.getByRole('button', { name: dialogTitle })
    expect(btn).toBeInTheDocument()

    await userEvent.click(btn)

    await waitFor(() => {
      expect(dialogSpy).toHaveBeenCalledWith(expect.objectContaining({ isOpen: true }), {})
    })
  })

  test('it should close the dialog when the handleCloseDialog function is invoked', async () => {
    const dialogTitle = 'TEST BUTTON TEXT'

    renderComponent({ dialogTitle })

    await userEvent.click(screen.getByRole('button', { name: dialogTitle }))

    expect(dialogSpy).toHaveBeenLastCalledWith(expect.objectContaining({ isOpen: true }), {})
    await act(dialogSpy.mock.calls[1][0].closeDialog)

    await waitFor(() => {
      expect(dialogSpy).toHaveBeenLastCalledWith(expect.objectContaining({ isOpen: false }), {})
    })
  })

  test('it should display the selected variation', async () => {
    const selectedItems = [mockItems[0], mockItems[2]]
    const selectedVariation = mockVariations[0]
    const serveItemsString = 'items'

    renderComponent({ selectedItems, selectedVariationId: selectedVariation.identifier, serveItemsString })

    const variationParagraph = document.querySelector('.variationParagraph')
    expect(variationParagraph).toBeInTheDocument()
    expect(variationParagraph).toHaveTextContent(
      `cf.pipeline.flagConfiguration.serve${selectedVariation.name}${serveItemsString}:`
    )
  })

  test('it should display the selected items', async () => {
    const selectedItems = [mockItems[0], mockItems[2]]
    const selectedVariationId = mockVariations[0].identifier

    renderComponent({ selectedItems, selectedVariationId })

    selectedItems.forEach(({ name, identifier }) =>
      expect(screen.getByText(getProfileInitials(name || identifier))).toBeInTheDocument()
    )
  })

  test('it should display the count of selected items', async () => {
    const selectedItems = [mockItems[0], mockItems[2]]
    const selectedVariationId = mockVariations[0].identifier

    renderComponent({ selectedItems, selectedVariationId })

    expect(screen.getByText(`(${selectedItems.length})`)).toBeInTheDocument()
  })

  test('it should display the singular for a single item', async () => {
    const selectedItems = [mockItems[0]]
    const selectedVariationId = mockVariations[0].identifier
    const serveItemString = 'SINGLE ITEM'

    const { container } = renderComponent({ selectedItems, selectedVariationId, serveItemString })

    expect(container).toHaveTextContent(serveItemString)
  })

  test('it should display the plural for multiple items', async () => {
    const selectedItems = [mockItems[0], mockItems[1], mockItems[2]]
    const selectedVariationId = mockVariations[0].identifier
    const serveItemsString = 'MULTIPLE ITEMS'

    const { container } = renderComponent({ selectedItems, selectedVariationId, serveItemsString })

    expect(container).toHaveTextContent(serveItemsString)
  })
})
