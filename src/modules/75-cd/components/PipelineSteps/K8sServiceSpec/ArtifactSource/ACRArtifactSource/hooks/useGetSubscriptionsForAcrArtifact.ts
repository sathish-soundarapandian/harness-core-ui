/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { GetDataError } from 'restful-react'
import {
  ResponseAzureSubscriptionsDTO,
  useGetAzureSubscriptions,
  useGetAzureSubscriptionsForAcrArtifact,
  Failure
} from 'services/cd-ng'

export interface Params {
  connectorRef?: string
  accountId: string
  projectIdentifier: string
  orgIdentifier: string
  useArtifactV1Data?: boolean
  serviceId?: string
  subscriptionsFqnPath: string
}

interface ReturnType {
  subscriptionsData: ResponseAzureSubscriptionsDTO | null
  refetchSubscriptions: (options?: { queryParams: any }) => Promise<void>
  loadingSubscriptions: boolean
  subscriptionsError: GetDataError<Failure | Error> | null
}

export function useGetSubscriptionsForAcrArtifact(params: Params): ReturnType {
  const {
    connectorRef,
    accountId,
    projectIdentifier,
    orgIdentifier,
    useArtifactV1Data,
    serviceId,
    subscriptionsFqnPath
  } = params

  const {
    data: subscriptionsV1Data,
    refetch: refetchV1Subscriptions,
    loading: loadingV1Subscriptions,
    error: subscriptionsV1Error
  } = useGetAzureSubscriptions({
    queryParams: {
      connectorRef,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true,
    debounce: 300
  })

  const {
    data: subscriptionsV2Data,
    refetch: refetchV2Subscriptions,
    loading: loadingV2Subscriptions,
    error: subscriptionsV2Error
  } = useGetAzureSubscriptionsForAcrArtifact({
    queryParams: {
      connectorRef,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      serviceId,
      fqnPath: subscriptionsFqnPath
    },
    lazy: true,
    debounce: 300
  })

  return useArtifactV1Data
    ? {
        subscriptionsData: subscriptionsV1Data,
        refetchSubscriptions: refetchV1Subscriptions,
        loadingSubscriptions: loadingV1Subscriptions,
        subscriptionsError: subscriptionsV1Error
      }
    : {
        subscriptionsData: subscriptionsV2Data,
        refetchSubscriptions: refetchV2Subscriptions,
        loadingSubscriptions: loadingV2Subscriptions,
        subscriptionsError: subscriptionsV2Error
      }
}
