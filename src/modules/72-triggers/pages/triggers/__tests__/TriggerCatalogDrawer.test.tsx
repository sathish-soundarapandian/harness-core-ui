/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { queryByText, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as pipelineNg from 'services/pipeline-ng'
import TriggerCatalogDrawer from '../views/TriggerCatalogDrawer'
import {
  triggerCatalogErrorResponse,
  triggerCatalogFailureResponse,
  triggerCatalogSuccessResponse
} from './TriggerCatalogResponseMockData'

function WrapperComponent(): JSX.Element {
  return (
    <TestWrapper>
      <TriggerCatalogDrawer hideDrawer={jest.fn()} />
    </TestWrapper>
  )
}

describe('TriggerCatalogDrawer tests', () => {
  test('TriggerCatalogDrawer Data Loading', async () => {
    jest.spyOn(pipelineNg, 'useGetTriggerCatalog').mockReturnValue({ loading: true } as any)
    const { container } = render(<WrapperComponent />)
    expect(container).toMatchSnapshot()
  })

  test('TriggerCatalogDrawer Data with Status: Success', async () => {
    jest
      .spyOn(pipelineNg, 'useGetTriggerCatalog')
      .mockReturnValue({ data: triggerCatalogSuccessResponse, loading: false } as any)
    const { container } = render(<WrapperComponent />)
    await waitFor(() => expect(() => queryByText(document.body, 'Triggers')).toBeDefined())
    expect(container).toMatchSnapshot()
  })

  test('TriggerCatalogDrawer Data Loading Error', () => {
    jest
      .spyOn(pipelineNg, 'useGetTriggerCatalog')
      .mockReturnValue({ error: { message: 'ERROR: Something went wrong' } } as any)
    const { container } = render(<WrapperComponent />)
    expect(container).toMatchSnapshot()
  })

  test('TriggerCatalogDrawer Data with Status: ERROR', () => {
    jest.spyOn(pipelineNg, 'useGetTriggerCatalog').mockReturnValue({ data: triggerCatalogErrorResponse } as any)
    const { container } = render(<WrapperComponent />)
    expect(container).toMatchSnapshot()
  })

  test('TriggerCatalogDrawer Data with Status: FAILURE', () => {
    jest.spyOn(pipelineNg, 'useGetTriggerCatalog').mockReturnValue({ data: triggerCatalogFailureResponse } as any)
    const { container } = render(<WrapperComponent />)
    expect(container).toMatchSnapshot()
  })
})
