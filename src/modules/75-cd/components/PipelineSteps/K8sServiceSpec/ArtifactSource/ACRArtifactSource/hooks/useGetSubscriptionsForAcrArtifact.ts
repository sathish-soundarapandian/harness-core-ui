/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import type { GetDataError } from 'restful-react'

import { useMutateAsGet } from '@common/hooks/useMutateAsGet'
import { ResponseAzureSubscriptionsDTO, Failure, useGetAzureSubscriptionsForAcrArtifactWithYaml } from 'services/cd-ng'

export interface Params {
  connectorRef?: string
  accountId: string
  projectIdentifier: string
  orgIdentifier: string
  useArtifactV1Data?: boolean
  serviceId?: string
  subscriptionsFqnPath: string
  pipelineRuntimeYaml: string
}

interface ReturnType {
  subscriptionsData: ResponseAzureSubscriptionsDTO | null
  refetchSubscriptions: any
  loadingSubscriptions: boolean
  subscriptionsError: GetDataError<Failure | Error> | null
}

export function useGetSubscriptionsForAcrArtifact(params: Params): ReturnType {
  const { connectorRef, accountId, projectIdentifier, orgIdentifier } = params

  const {
    data: subscriptionsData,
    refetch: refetchSubscriptions,
    loading: loadingSubscriptions,
    error: subscriptionsError
  } = useMutateAsGet(useGetAzureSubscriptionsForAcrArtifactWithYaml, {
    body: params.pipelineRuntimeYaml,
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: {
      connectorRef,
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,

      fqnPath: params.subscriptionsFqnPath
    },
    lazy: true,
    debounce: 300
  })

  return {
    subscriptionsData: subscriptionsData,
    refetchSubscriptions: refetchSubscriptions,
    loadingSubscriptions: loadingSubscriptions,
    subscriptionsError: subscriptionsError
  }
}
