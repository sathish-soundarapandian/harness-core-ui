/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { SortMethod } from '@common/utils/sortUtils'
import * as cdng from 'services/cd-ng'
import ServiceAccountsResourceModalBody from '../ServiceAccountsResourceModalBody'
import data from './mock.json'
const props = {
  searchTerm: '',
  sortMethod: SortMethod.LastModifiedDesc,
  onSelectChange: jest.fn(),
  selectedData: [],
  resourceScope: {
    accountIdentifier: ''
  }
}
let showedError = false
jest.mock('@harness/uicore', () => ({
  ...jest.requireActual('@harness/uicore'),
  useToaster: jest.fn(() => ({
    showSuccess: jest.fn(),
    showError: jest.fn().mockImplementation(() => {
      showedError = true
    })
  }))
}))
describe('Service Accounts Resource Modal Body test', () => {
  test('initializes ok ', async () => {
    const sampleDataSpy = jest.spyOn(cdng, 'useListAggregatedServiceAccounts')
    sampleDataSpy.mockReturnValueOnce({
      cancel: jest.fn(),
      loading: false,
      data: data,
      mutate: jest.fn().mockImplementation(() => data)
    } as any)
    const { getByText } = render(
      <TestWrapper>
        <ServiceAccountsResourceModalBody {...props} />
      </TestWrapper>
    )
    await waitFor(() => getByText('SAWdsfdsfdsfd97j'))
    expect(getByText('SAWdsfdsfdsfd97j')).toBeTruthy()
  })
  test('no data ', async () => {
    const sampleDataSpy = jest.spyOn(cdng, 'useListAggregatedServiceAccounts')
    sampleDataSpy.mockReturnValueOnce({
      cancel: jest.fn(),
      loading: false,
      data: {
        status: 'SUCCESS',
        data: null,
        metaData: null,
        correlationId: '57d206c8-6adfdsfd8-4aca-b089-1a188824dac8'
      },
      mutate: jest.fn().mockImplementation(() => data)
    } as any)
    const { getByText } = render(
      <TestWrapper>
        <ServiceAccountsResourceModalBody {...props} />
      </TestWrapper>
    )

    await waitFor(() => getByText('noData'))
    expect(getByText('noData')).toBeTruthy()
  })

  test('loading state ', async () => {
    const sampleDataSpy = jest.spyOn(cdng, 'useListAggregatedServiceAccounts')
    sampleDataSpy.mockReturnValueOnce({
      cancel: jest.fn(),
      loading: true,
      data: data,
      mutate: jest.fn().mockImplementation(() => data)
    } as any)
    const { getByText } = render(
      <TestWrapper>
        <ServiceAccountsResourceModalBody {...props} />
      </TestWrapper>
    )
    await waitFor(() => getByText('Loading, please wait...'))
    expect(getByText('Loading, please wait...')).toBeTruthy()
  })
  test('error value  ', async () => {
    const sampleDataSpy = jest.spyOn(cdng, 'useListAggregatedServiceAccounts')
    sampleDataSpy.mockReturnValueOnce({
      cancel: jest.fn(),
      loading: false,
      error: 'error',
      data: data,
      mutate: jest.fn().mockImplementation(() => data)
    } as any)
    render(
      <TestWrapper>
        <ServiceAccountsResourceModalBody {...props} />
      </TestWrapper>
    )

    await waitFor(() => showedError)
    expect(showedError).toBeTruthy()
  })
})
