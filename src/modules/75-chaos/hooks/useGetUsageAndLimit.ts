/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useGet, UseGetProps } from 'restful-react'
import { getConfig } from 'services/config'

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

export interface ChaosLicenseUsageDTO {
  accountIdentifier?: string
  totalChaosExperimentRuns?: UsageDataDTO
  totalChaosInfrastructures?: UsageDataDTO
  module?: string
  timestamp?: number
}

export interface ResponseChaosLicenseUsageDTO {
  correlationId?: string
  data?: ChaosLicenseUsageDTO
  metaData?: { [key: string]: any }
  status?: 'SUCCESS' | 'FAILURE' | 'ERROR'
}

export interface GetChaosLicenseUsageQueryParams {
  accountIdentifier: string
  timestamp?: number
}

export type UseGetChaosLicenseUsageProps = Omit<
  UseGetProps<ResponseChaosLicenseUsageDTO, unknown, GetChaosLicenseUsageQueryParams, void>,
  'path'
>

/**
 * Gets License Usage for SRM
 */
export const useGetCHAOSLicenseUsage = (props: UseGetChaosLicenseUsageProps) =>
  useGet<ResponseChaosLicenseUsageDTO, unknown, GetChaosLicenseUsageQueryParams, void>(
    `/usage/${props.queryParams?.accountIdentifier}`,
    {
      base: getConfig('chaos/manager/api'),
      ...props
    }
  )
