/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'

import * as cdNgServices from 'services/cd-ng'

import { TestWrapper } from '@common/utils/testUtils'

import EnvironmentGroupsResourceModal from '../EnvironmentGroupsResourceModal'
import mockData from './environmentGroupsMockData.json'

const props = {
  searchTerm: '',
  onSelectChange: jest.fn(),
  selectedData: [],
  resourceScope: {
    accountIdentifier: ''
  }
}

describe('Environment Group Resource Modal', () => {
  test('renders environment group list', async () => {
    jest.spyOn(cdNgServices, 'useGetEnvironmentGroupList').mockImplementation(() => ({
      loading: false,
      mutate: jest.fn().mockResolvedValue(mockData),
      cancel: jest.fn(),
      error: null
    }))

    act(() => {
      render(
        <TestWrapper pathParams={{ accountIdentifier: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
          <EnvironmentGroupsResourceModal {...props}></EnvironmentGroupsResourceModal>
        </TestWrapper>
      )
    })

    await waitFor(() => expect(screen.queryByText('common.environmentGroup.label')).toBeInTheDocument())
    await waitFor(() => expect(screen.queryByText('Env Group 1')).toBeInTheDocument())
  })

  test('renders no data', async () => {
    jest.spyOn(cdNgServices, 'useGetEnvironmentGroupList').mockImplementation(() => ({
      loading: false,
      mutate: jest.fn().mockResolvedValue({
        ...mockData,
        data: {
          ...mockData.data,
          totalPages: 0,
          totalItems: 0,
          pageItemCount: 0,
          pageSize: 10,
          content: [],
          pageIndex: 0,
          empty: true
        }
      }),
      cancel: jest.fn(),
      error: null
    }))

    act(() => {
      render(
        <TestWrapper pathParams={{ accountIdentifier: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
          <EnvironmentGroupsResourceModal {...props}></EnvironmentGroupsResourceModal>
        </TestWrapper>
      )
    })

    await waitFor(() => expect(screen.queryByText('noData')).toBeInTheDocument())
    await waitFor(() => expect(screen.queryByText('common.environmentGroup.label')).not.toBeInTheDocument())
  })

  test('renders loading spinner', async () => {
    jest.spyOn(cdNgServices, 'useGetEnvironmentGroupList').mockImplementation(() => ({
      loading: true,
      mutate: jest.fn().mockResolvedValue(null),
      cancel: jest.fn(),
      error: null
    }))

    act(() => {
      render(
        <TestWrapper pathParams={{ accountIdentifier: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}>
          <EnvironmentGroupsResourceModal {...props}></EnvironmentGroupsResourceModal>
        </TestWrapper>
      )
    })

    await waitFor(() => expect(screen.queryByText('Loading, please wait...')).toBeInTheDocument())
    await waitFor(() => expect(screen.queryByText('common.environmentGroup.label')).not.toBeInTheDocument())
  })
})
