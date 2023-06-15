/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, act, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DelegateConfigurations, { prepareData } from '../DelegateConfigurations'
import ProfileMock from './ProfilesMock'

const mockGetCallFunction = jest.fn()
const getProfilesMock = jest.fn().mockImplementation(() => ProfileMock)
jest.mock('services/cd-ng', () => ({
  useListDelegateConfigsNgV2WithFilter: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return {
      mutate: getProfilesMock,
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  }),
  useDeleteDelegateConfigNgV2: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  }),
  useAddDelegateProfileNgV2: jest.fn().mockImplementation(() => ({
    mutate: jest.fn()
  })),
  useGetFilterList: jest.fn().mockImplementation(() => {
    return {
      refetch: jest.fn(),
      loading: false
    }
  }),
  usePostFilter: jest.fn().mockImplementation(() => {
    return {
      mutate: jest.fn()
    }
  }),
  useUpdateFilter: jest.fn().mockImplementation(() => {
    return {
      mutate: jest.fn()
    }
  }),
  useDeleteFilter: jest.fn().mockImplementation(() => {
    return {
      mutate: jest.fn()
    }
  })
}))

jest.mock('@common/exports', () => ({
  TimeAgo: jest.fn().mockImplementation(() => <div />),
  StringUtils: {
    getIdentifierFromName: (name: string) => name
  }
}))

describe('Delegates Configurations Page', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/delegates" pathParams={{ accountId: 'dummy' }}>
        <DelegateConfigurations />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
  test('test name search configs debounce', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/delegates" pathParams={{ accountId: 'dummy' }}>
        <DelegateConfigurations />
      </TestWrapper>
    )

    let searchInput: HTMLElement

    await waitFor(() => {
      searchInput = container.getElementsByTagName('input')[0]
    })

    act(() => {
      fireEvent.change(searchInput!, {
        target: { value: 'prim' }
      })
    })

    act(() => {
      fireEvent.change(searchInput!, {
        target: { value: 'primary' }
      })
    })

    await waitFor(() => {
      expect(getProfilesMock).toBeCalledTimes(2)
    })

    expect(container).toMatchSnapshot()
  })
  test('render data and add new', () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/delegates" pathParams={{ accountId: 'dummy' }}>
        <DelegateConfigurations />
      </TestWrapper>
    )

    const addBtn = container.getElementsByTagName('button')[0]
    act(() => {
      fireEvent.click(addBtn)
    })

    expect(container).toMatchSnapshot()
  })
  test('check filter panel', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/delegates" pathParams={{ accountId: 'dummy' }}>
        <DelegateConfigurations />
      </TestWrapper>
    )

    let filterOpenBtn: HTMLElement
    await waitFor(() => {
      filterOpenBtn = container.getElementsByTagName('button')[1]
    })

    act(() => {
      fireEvent.click(filterOpenBtn!)
    })

    expect(container).toMatchSnapshot()
  })
  test('test prepare data', () => {
    const preparedData = prepareData(
      {
        metadata: { name: 'name1', filterVisibility: 'EveryOne', identifier: 'name1ident' },
        formValues: { identifier: 'deliprofdent1', name: 'name1', description: '', selectors: [] }
      },
      false
    )
    const result = {
      name: 'name1',
      identifier: 'name1',
      projectIdentifier: undefined,
      orgIdentifier: undefined,
      filterVisibility: 'EveryOne',
      filterProperties: {
        filterType: 'DelegateProfile',
        identifier: 'deliprofdent1',
        name: 'name1',
        description: '',
        selectors: []
      }
    }
    expect(preparedData).toEqual(result)
  })
})
