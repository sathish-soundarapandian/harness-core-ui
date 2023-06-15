/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act } from 'react-dom/test-utils'
import { render, waitFor, fireEvent, createEvent } from '@testing-library/react'
import user from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import UploadJSON from '@connectors/components/CreateConnector/PdcConnector/components/UploadJSON'

const setJsonValueFn = jest.fn()

const fileValues = [{ hosts: 'localhost' }]

const createBubbledEvent = (type: string, props = {}) => {
  const event = new Event(type, { bubbles: true })
  Object.assign(event, props)
  return event
}

const showError = jest.fn()
jest.mock('@common/exports', () => ({
  useToaster: () => ({
    showError: showError
  })
}))

describe('Test TestConnection component', () => {
  test('Render component with pass api request', async () => {
    const { container } = render(
      <TestWrapper path="/account/pass" pathParams={{}}>
        <UploadJSON setJsonValue={setJsonValueFn} />
      </TestWrapper>
    )

    const str = JSON.stringify(fileValues)
    const blob = new Blob([str])
    const file = new File([blob], 'values.json', {
      type: 'application/JSON'
    })
    File.prototype.text = jest.fn().mockResolvedValueOnce(str)
    const input = container.querySelector('input')
    act(() => {
      user.upload(input!, file)
    })

    waitFor(() => {
      expect(setJsonValueFn).toBeCalled()
    })
  })
  test('Render component with test file error parsing', async () => {
    const { container } = render(
      <TestWrapper path="/account/pass" pathParams={{}}>
        <UploadJSON setJsonValue={setJsonValueFn} />
      </TestWrapper>
    )

    const fileErrorContent = '[{hosts: localhost},}]'
    const blob = new Blob([fileErrorContent])
    const file = new File([blob], 'values.json', {
      type: 'application/JSON'
    })
    File.prototype.text = jest.fn().mockResolvedValueOnce(fileErrorContent)
    const input = container.querySelector('input')
    act(() => {
      user.upload(input!, file)
    })

    waitFor(() => {
      expect(setJsonValueFn).toBeCalled()
    })
  })
  test('drag and drop test error, missing dataTransfer', () => {
    const { container } = render(
      <TestWrapper path="/account/pass" pathParams={{}}>
        <UploadJSON setJsonValue={setJsonValueFn} />
      </TestWrapper>
    )
    const input = container.querySelector('input')!
    input.dispatchEvent(createBubbledEvent('dragstart', { clientX: 0, clientY: 0 }))

    input.dispatchEvent(createBubbledEvent('drop', { clientX: 0, clientY: 1 }))

    waitFor(() => {
      expect(setJsonValueFn).toBeCalled()
    })
  })
  test('drag and drop test - files', async () => {
    const { container, queryByText } = render(
      <TestWrapper path="/account/pass" pathParams={{}}>
        <UploadJSON setJsonValue={setJsonValueFn} />
      </TestWrapper>
    )
    const input = container.querySelector('input')!

    const fileName = 'file1'
    const fileContent = JSON.stringify([{ hosts: 'localhost' }])
    const blob = new Blob([fileContent])
    const file = new File([blob], fileName, {
      type: 'application/JSON'
    })
    const eventData = { dataTransfer: { files: [file] } }

    act(() => {
      const dragStartEvent = Object.assign(createEvent.dragStart(input), eventData)
      fireEvent(input, dragStartEvent)
      fireEvent.dragEnter(input)
    })

    act(() => {
      fireEvent.dragEnd(input)
      fireEvent.dragLeave(input)

      const dropEffectEvent = Object.assign(createEvent.dragOver(input), eventData)
      fireEvent(input, dropEffectEvent)

      const dropEvent = Object.assign(createEvent.drop(input), eventData)
      fireEvent(input, dropEvent)
    })

    await waitFor(() => {
      expect(queryByText(fileName)).toBeDefined()
    })
  })
  test('drag and drop test - incorrect files', () => {
    const { container } = render(
      <TestWrapper path="/account/pass" pathParams={{}}>
        <UploadJSON setJsonValue={setJsonValueFn} />
      </TestWrapper>
    )
    const input = container.querySelector('input')!

    const eventData = { dataTransfer: { files: [''] } }

    act(() => {
      const dragStartEvent = Object.assign(createEvent.dragStart(input), eventData)

      fireEvent(input, dragStartEvent)
      fireEvent.dragEnter(input)
      fireEvent.dragEnd(input)
      fireEvent.dragLeave(input)

      const dropEffectEvent = Object.assign(createEvent.dragOver(input), eventData)
      fireEvent(input, dropEffectEvent)

      const dropEvent = Object.assign(createEvent.drop(input), eventData)
      fireEvent(input, dropEvent)
    })

    waitFor(() => {
      expect(setJsonValueFn).toBeCalled()
    })
  })
  test('test on click component', () => {
    const { container, queryByText } = render(
      <TestWrapper path="/account/pass" pathParams={{}}>
        <UploadJSON setJsonValue={setJsonValueFn} />
      </TestWrapper>
    )
    const parentContainer = container.querySelector('div')!

    act(() => {
      fireEvent.click(parentContainer!)
    })

    waitFor(() => {
      expect(queryByText('connectors.pdc.hostsUpload1')).not.toBeDefined()
    })
  })
})
