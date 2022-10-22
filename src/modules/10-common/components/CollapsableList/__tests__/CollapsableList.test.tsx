/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { CollapsableList } from '../CollapsableList'

const selectedRecordData = {
  type: 'SecretText',
  name: 'testsecrethgj',
  identifier: 'testsecret',
  tags: {},
  description: '',
  spec: { secretManagerIdentifier: 'harnessSecretManager', valueType: 'Inline', value: null },
  scope: 'account'
}

const commonProps = {
  data: [
    {
      name: 'mocksecretname',
      identifier: 'mocksecretId',
      record: selectedRecordData
    }
  ],
  selectedScope: 'account' as any,
  pagination: { itemCount: 1, pageSize: 10, pageCount: 1, pageIndex: 0 },
  selectedRecords: [],
  setSelectedRecords: jest.fn()
}

const setSelectedRecordMock = jest.fn()

describe('Test CollapsableList', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('Should render CollapsableList: only record render is given, disable collapse', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <CollapsableList<any>
          {...commonProps}
          disableCollapse={true}
          selectedRecord={jest.fn()}
          setSelectedRecord={setSelectedRecordMock}
          recordRender={({ item, selectedScope, selected }) => {
            return (
              <>
                <span>Rendering item name {item.name}</span>
                <span>Rendering scope {selectedScope}</span>
                <span>Rendering selected {selected}</span>
              </>
            )
          }}
        />
      </TestWrapper>
    )

    await waitFor(() => expect('Rendering scope').toBeDefined())

    expect(getByText(`Rendering item name ${commonProps.data[0].name}`)).toBeDefined()
    expect(getByText(`Rendering scope ${commonProps.selectedScope}`)).toBeDefined()
    expect(container.querySelector('[class*="hideCollapseIcon"]')).not.toBeNull()
    expect(container).toMatchSnapshot()
  })

  test('Should render CollapsableList: only record render is given, enable collapse', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <CollapsableList<any>
          {...commonProps}
          selectedRecord={jest.fn()}
          setSelectedRecord={jest.fn()}
          recordRender={({ item, selectedScope, selected }) => {
            return (
              <>
                <span>Rendering item name {item.name}</span>
                <span>Rendering scope {selectedScope}</span>
                <span>Rendering selected {selected}</span>
              </>
            )
          }}
        />
      </TestWrapper>
    )

    await waitFor(() => expect('Rendering scope').toBeDefined())

    expect(getByText(`Rendering item name ${commonProps.data[0].name}`)).toBeDefined()
    expect(getByText(`Rendering scope ${commonProps.selectedScope}`)).toBeDefined()

    expect(container.querySelector('[class*="hideCollapseIcon"]')).toBeNull()
  })

  test('Should render CollapsableList: click to slect element', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <CollapsableList<any>
          {...commonProps}
          disableCollapse={false}
          selectedRecord={jest.fn()}
          setSelectedRecord={setSelectedRecordMock}
          recordRender={({ item, selectedScope, selected }) => {
            return (
              <>
                <span>Rendering item name {item.name}</span>
                <span>Rendering scope {selectedScope}</span>
                <span>Rendering selected {selected}</span>
              </>
            )
          }}
        />
      </TestWrapper>
    )

    await waitFor(() => expect('Rendering scope').toBeDefined())

    act(() => {
      const row = container.querySelector('[class*="collapeHeaderContent"]')
      if (row) {
        fireEvent.click(row)
      } else {
        throw Error('Row button was not found.')
      }
    })

    expect(getByText(`Rendering scope ${commonProps.selectedScope}`)).toBeDefined()
    expect(setSelectedRecordMock).toBeCalledTimes(1)
    expect(setSelectedRecordMock).toBeCalledWith(selectedRecordData)
  })

  test('Should render CollapsableList: click to slect element which is already selected', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <CollapsableList<any>
          {...commonProps}
          disableCollapse={false}
          selectedRecord={selectedRecordData}
          setSelectedRecord={setSelectedRecordMock}
          recordRender={({ item, selectedScope, selected }) => {
            return (
              <>
                <span>Rendering item name {item.name}</span>
                <span>Rendering scope {selectedScope}</span>
                <span>Rendering selected {selected}</span>
              </>
            )
          }}
        />
      </TestWrapper>
    )

    await waitFor(() => expect('Rendering scope').toBeDefined())

    act(() => {
      const row = container.querySelector('[class*="collapeHeaderContent"]')
      if (row) {
        fireEvent.click(row)
      } else {
        throw Error('Row button was not found.')
      }
    })

    expect(getByText(`Rendering scope ${commonProps.selectedScope}`)).toBeDefined()
    expect(setSelectedRecordMock).toBeCalledTimes(1)
    expect(setSelectedRecordMock).toBeCalledWith(undefined)
  })

  test('Should render CollapsableList: send with collapseHeader', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <CollapsableList<any>
          {...commonProps}
          disableCollapse={false}
          selectedRecord={jest.fn()}
          setSelectedRecord={setSelectedRecordMock}
          recordRender={({ item, selectedScope, selected }) => {
            return (
              <>
                <span>Rendering item name {item.name}</span>
                <span>Rendering scope {selectedScope}</span>
                <span>Rendering selected {selected}</span>
              </>
            )
          }}
          collapsedRecordRender={({ item, selectedScope, selected }) => {
            return (
              <>
                <span>Rendering collapsed item id {item.identifier}</span>
                <span>Rendering collapsed scope {selectedScope}</span>
                <span>Rendering collapsed selected {selected}</span>
              </>
            )
          }}
        />
      </TestWrapper>
    )

    await waitFor(() => expect('Rendering scope').toBeDefined())

    expect(getByText(`Rendering item name ${commonProps.data[0].name}`)).toBeDefined()
    expect(getByText(`Rendering scope ${commonProps.selectedScope}`)).toBeDefined()

    act(() => {
      const collapseArrow = container.querySelector('[class*="leftSection"]')
      if (collapseArrow) {
        fireEvent.click(collapseArrow)
      } else {
        throw Error('collapseArrow button was not found.')
      }
    })

    expect(getByText(`Rendering collapsed item id ${commonProps.data[0].identifier}`)).toBeDefined()
    expect(getByText(`Rendering collapsed scope ${commonProps.selectedScope}`)).toBeDefined()
  })
})
