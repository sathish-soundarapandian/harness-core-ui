/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import * as cvServices from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import { DatadogLogsHealthSource } from '../DatadogLogsHealthSource'
import { template } from './mock'

jest.mock('@cv/hooks/IndexedDBHook/IndexedDBHook', () => ({
  useIndexedDBHook: jest.fn().mockReturnValue({ isInitializingDB: false, dbInstance: { get: jest.fn() } }),
  CVObjectStoreNames: {}
}))

describe('DatadogLogsHealthSource unit tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  beforeAll(() => {
    // useGetDatadogLogIndexes, useGetDatadogLogSampleData
    jest
      .spyOn(cvServices, 'useGetDatadogLogIndexes')
      .mockImplementation(() => ({ loading: false, error: null, data: {}, refetch: jest.fn() } as any))
    jest
      .spyOn(cvServices, 'useGetDatadogLogSampleData')
      .mockImplementation(() => ({ loading: false, error: null, data: {}, refetch: jest.fn() } as any))
  })

  test('Datadog log renders when values are runtime', async () => {
    // render component with mock health source which contains DatadogLog queries
    const onSubmit = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <DatadogLogsHealthSource data={template.runtimeData} onSubmit={onSubmit} isTemplate={true} />
      </TestWrapper>
    )
    expect(container.querySelector('input[name="indexes"]')).toHaveValue('<+input>')
    expect(container.querySelector('input[name="serviceInstanceIdentifierTag"]')).toHaveValue('<+input>')
    expect(container.querySelector('input[name="query"]')).toHaveValue('<+input>')
    act(() => {
      fireEvent.click(getByText('submit'))
    })
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(expect.anything(), expect.objectContaining(template.payload))
    )
    expect(container).toMatchSnapshot()
  })

  test('Datadog log renders when values are fixed', async () => {
    // render component with mock health source which contains DatadogLog queries
    const onSubmit = jest.fn()
    const fixedData = template.runtimeData
    fixedData.connectorId = 'datadoglog'
    fixedData.connectorRef = 'datadoglog'
    const { container, getByText } = render(
      <TestWrapper>
        <DatadogLogsHealthSource data={fixedData} onSubmit={onSubmit} isTemplate={true} />
      </TestWrapper>
    )
    expect(container.querySelector('input[name="indexes"]')).toHaveValue('')
    expect(container.querySelector('input[name="serviceInstanceIdentifierTag"]')).toHaveValue('')
    expect(container.querySelector('textarea[name="query"]')).toHaveValue('')
    await fillAtForm([
      { container, type: InputTypes.TEXTAREA, fieldId: 'query', value: 'test query' },
      { container, type: InputTypes.TEXTFIELD, fieldId: 'indexes', value: 'main' }
    ])

    // change one value to runtime
    const fixedInputIcon = container.querySelector(
      'div[data-id="serviceInstanceIdentifierTag-2"] span[data-icon="fixed-input"]'
    )
    fireEvent.click(fixedInputIcon!)
    const runtimeBtn = await getByText('Runtime input')
    expect(runtimeBtn).toBeInTheDocument()
    fireEvent.click(runtimeBtn)

    expect(container.querySelector('textarea[name="query"]')).toHaveValue('test query')
    expect(container.querySelector('input[name="serviceInstanceIdentifierTag"]')).toHaveValue('<+input>')

    act(() => {
      fireEvent.click(getByText('submit'))
    })
    const updatedPayload = template.payload
    updatedPayload.spec.connectorRef = 'datadoglog'
    updatedPayload.spec.queries[0].query = 'test query'
    updatedPayload.spec.queries[0].indexes = [] as any
    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith(expect.anything(), expect.objectContaining(updatedPayload))
    )
  })
})
