/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CommandBlock from '@common/CommandBlock/CommandBlock'
jest.mock('clipboard-copy', () => jest.fn())
global.URL.createObjectURL = jest.fn()
describe('CommandBlock', () => {
  test('test command block', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <CommandBlock allowCopy={true} commandSnippet={'test'} allowDownload={true} />
      </TestWrapper>
    )
    await waitFor(() => {
      expect(container.querySelector('button[aria-label="common.copied"]')).toBeDefined()
    })
    await act(async () => {
      fireEvent.click(container.querySelector('button[aria-label="common.copied"]') as HTMLElement)
    })
    await waitFor(() => {
      expect(getByText('common.download')).toBeDefined()
    })
    await act(async () => {
      fireEvent.click(getByText('common.download'))
    })
    expect(container).toMatchSnapshot()
  })

  test('test command block telemetry and other options', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <CommandBlock
          allowCopy={true}
          commandSnippet={'test'}
          allowDownload={true}
          ignoreWhiteSpaces={true}
          downloadFileProps={{ downloadFileName: 'testname', downloadFileExtension: 'xdf' }}
          telemetryProps={{
            copyTelemetryProps: {
              eventName: 'test',
              properties: { category: 'test category' }
            },
            downloadTelemetryProps: {
              eventName: 'test',
              properties: { category: 'test category' }
            }
          }}
        />
      </TestWrapper>
    )
    await waitFor(() => {
      expect(container.querySelector('button[aria-label="common.copied"]')).toBeDefined()
    })
    await act(async () => {
      fireEvent.click(container.querySelector('button[aria-label="common.copied"]') as HTMLElement)
    })
    await waitFor(() => {
      expect(getByText('common.download')).toBeDefined()
    })
    await act(async () => {
      fireEvent.click(getByText('common.download'))
    })
    expect(container).toMatchSnapshot()
  })
})
