/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useParams } from 'react-router-dom'
import { Get, GetProps, useGet, UseGetProps } from 'restful-react'
import type { GetState } from 'restful-react/dist/Get'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { getConfig, getUsingFetch, GetUsingFetchProps } from 'services/config'
import React from 'react'
import type { Error, Failure } from '../ci'

export interface ErrorResponse {
  message: string
  status: number
  data: {
    message: string
  }
}

export interface IssueCounts {
  critical: number
  high: number
  medium: number
  low: number
  info: number
  unassigned: number
}

export function useIssueCounts(
  pipelineId: string,
  executionIds: string
): GetState<Record<string, IssueCounts>, ErrorResponse> {
  const { projectIdentifier: projectId, orgIdentifier: orgId, accountId } = useParams<PipelinePathProps>()

  return useGet<Record<string, IssueCounts>, ErrorResponse>({
    base: getConfig('sto/api'),
    path: 'v2/frontend/issue-counts',
    queryParams: {
      accountId,
      orgId,
      projectId,
      pipelineId,
      executionIds
    }
  })
}

// License

export interface ReferenceDTO {
  accountIdentifier?: string
  count?: number
  identifier?: string
  name?: string
  orgIdentifier?: string
  projectIdentifier?: string
}

export interface UsageDataDTO {
  count?: number
  displayName?: string
  references?: ReferenceDTO[]
}

export interface STOUsageResult {
  accountIdentifier?: string
  activeDevelopers?: UsageDataDTO
  activeScans?: UsageDataDTO
  module?: string
  timestamp?: number
}

export interface ResponseSTOUsageResult {
  correlationId?: string
  data?: STOUsageResult
  metaData?: { [key: string]: any }
  status?: 'SUCCESS' | 'FAILURE' | 'ERROR'
}

export interface GetUsageQueryParams {
  accountId: string
  timestamp: number
}

export type GetUsageProps = Omit<GetProps<ResponseSTOUsageResult, Failure | Error, GetUsageQueryParams, void>, 'path'>

/**
 * Get usage
 */
export const GetUsage = (props: GetUsageProps) => (
  <Get<ResponseSTOUsageResult, Failure | Error, GetUsageQueryParams, void>
    path={`/usage`}
    base={getConfig('sto/api')}
    {...props}
  />
)

export type UseGetUsageProps = Omit<
  UseGetProps<ResponseSTOUsageResult, Failure | Error, GetUsageQueryParams, void>,
  'path'
>

/**
 * Get usage
 */
export const useGetUsage = (props: UseGetUsageProps) =>
  useGet<ResponseSTOUsageResult, Failure | Error, GetUsageQueryParams, void>(`/usage`, {
    base: getConfig('sto/api'),
    ...props
  })

/**
 * Get usage
 */
export const getUsagePromise = (
  props: GetUsingFetchProps<ResponseSTOUsageResult, Failure | Error, GetUsageQueryParams, void>,
  signal?: RequestInit['signal']
) =>
  getUsingFetch<ResponseSTOUsageResult, Failure | Error, GetUsageQueryParams, void>(
    getConfig('sto/api'),
    `/usage`,
    props,
    signal
  )
