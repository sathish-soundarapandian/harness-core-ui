/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import {
  VariableSuccessResponseWithData,
  VariableSuccessResponseWithNoData
} from '@variables/pages/variables/__tests__/mock/variableResponse'
import * as cdngServices from 'services/cd-ng'
import VariableResourceModalBody from '../VariableResourceModalBody'

const props = {
  searchTerm: '',
  onSelectChange: jest.fn(),
  selectedData: [],
  resourceScope: {
    accountIdentifier: ''
  }
}

jest.mock('services/cd-ng', () => ({
  useGetVariablesList: jest.fn().mockImplementation(() => {
    return { data: VariableSuccessResponseWithData, loading: false }
  })
}))
describe('Secret Resource Modal Body test', () => {
  test('initializes ok ', async () => {
    jest
      .spyOn(cdngServices, 'useGetVariablesList')
      .mockImplementation(() => ({ data: VariableSuccessResponseWithData, loading: false } as any))
    const { container, getByText } = render(
      <TestWrapper>
        <VariableResourceModalBody {...props}></VariableResourceModalBody>
      </TestWrapper>
    )
    await waitFor(() => getByText('variableLabel'))
    expect(container).toMatchSnapshot()
  })
  test('initializes with No data ', async () => {
    jest
      .spyOn(cdngServices, 'useGetVariablesList')
      .mockImplementation(() => ({ data: VariableSuccessResponseWithNoData, loading: false } as any))
    const { getByText } = render(
      <TestWrapper>
        <VariableResourceModalBody {...props}></VariableResourceModalBody>
      </TestWrapper>
    )
    await waitFor(() => getByText('noData'))
    expect(getByText('noData')).toBeDefined()
  })

  test('render page at account level when loading state', async () => {
    const mockListRefect = jest.fn()
    jest
      .spyOn(cdngServices, 'useGetVariablesList')
      .mockImplementation(
        () => ({ error: VariableSuccessResponseWithNoData, loading: true, refetch: mockListRefect } as any)
      )
    const { getByText } = render(
      <TestWrapper>
        <VariableResourceModalBody {...props}></VariableResourceModalBody>
      </TestWrapper>
    )
    await waitFor(() => getByText('Loading, please wait...'))
    expect(getByText('Loading, please wait...')).toBeDefined()
  })
})
