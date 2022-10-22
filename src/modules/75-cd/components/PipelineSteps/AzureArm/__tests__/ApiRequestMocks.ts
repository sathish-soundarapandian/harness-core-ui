/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as cdServices from 'services/cd-ng'

export const useGetAzureSubscriptions = (error = false, loading = false) =>
  jest.spyOn(cdServices, 'useGetAzureSubscriptions').mockReturnValue({
    loading,
    error: error && { message: 'useGetAzureSubscriptions error' },
    data: !error && { data: { subscriptions: [{ subscriptionName: 'test', subscriptionId: 'test' }] } },
    refetch: jest.fn()
  } as any)

export const useGetAzureResourceGroupsBySubscription = (error = false, loading = false) =>
  jest.spyOn(cdServices, 'useGetAzureResourceGroupsBySubscription').mockReturnValue({
    loading,
    error: error && { message: 'useGetAzureResourceGroupsBySubscription error' },
    data: !error && { data: { resourceGroups: [{ resourceGroup: 'resourceGroup test' }] } },
    refetch: jest.fn()
  } as any)

export const useGetLocationsBySubscription = (error = false, loading = false) =>
  jest.spyOn(cdServices, 'useGetLocationsBySubscription').mockReturnValue({
    loading,
    error: error && { message: 'useGetLocationsBySubscription error' },
    data: !error && { data: { locations: ['location one', 'location two'] } },
    refetch: jest.fn()
  } as any)

export const useGetManagementGroups = (error = false, loading = false) =>
  jest.spyOn(cdServices, 'useGetManagementGroups').mockReturnValue({
    loading,
    error: error && { message: 'useGetManagementGroups error' },
    data: !error && { data: { managementGroups: [{ displayName: 'Easy name', name: 'abc-456' }] } },
    refetch: jest.fn()
  } as any)

export const useGetConnector = () =>
  jest.spyOn(cdServices, 'useGetConnector').mockReturnValue({
    loading: false,
    data: {
      data: {}
    },
    mutate: jest.fn(),
    refetch: jest.fn()
  } as any)
