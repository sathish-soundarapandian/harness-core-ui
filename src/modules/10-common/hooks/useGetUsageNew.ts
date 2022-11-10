/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useState } from 'react'
import moment from 'moment'
import { useParams } from 'react-router-dom'
import {
  useGetLicensesAndSummary,
  GetLicensesAndSummaryQueryParams,
  CILicenseSummaryDTO,
  CFLicenseSummaryDTO,
  CELicenseSummaryDTO,
  CDLicenseSummaryDTO,
  useGetCDLicenseUsageForServiceInstances,
  useGetCDLicenseUsageForServices
} from 'services/cd-ng'
import { useDeepCompareEffect } from '@common/hooks'
import { useGetLicenseUsage as useGetFFUsage } from 'services/cf'
import { useGetUsage as useGetCIUsage } from 'services/ci'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { ModuleName } from 'framework/types/ModuleName'
import { useGetCCMLicenseUsage } from 'services/ce'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'

export interface UsageDataReturn {
  usageData: UsageReturn
}

interface UsageReturn {
  usage?: UsageProps
  loadingUsage?: boolean
  usageErrorMsg?: string
  refetchUsage?: () => void
}

interface UsageProp {
  count?: number
  displayName?: string
}

interface UsageProps {
  ci?: {
    activeCommitters?: UsageProp
  }
  ff?: {
    activeClientMAUs?: UsageProp
    activeFeatureFlagUsers?: UsageProp
  }
  ccm?: {
    activeSpend?: UsageProp
  }
  cd?: {
    activeServices?: UsageProp
    activeServiceInstances?: UsageProp
    serviceLicenses?: UsageProp
  }
}

const timestamp = moment.now()

function useGetCCMTimeStamp(): number {
  const { licenseInformation } = useLicenseStore()
  return licenseInformation?.CE?.startTime || 0
}

function useGetUsage(module: ModuleName): UsageReturn {
  const { accountId } = useParams<AccountPathProps>()
  const [usageData, setUsageData] = useState<UsageReturn>({})
  const {
    data: ciUsageData,
    loading: loadingCIUsage,
    error: ciUsageError,
    refetch: refetchCIUsage
  } = useGetCIUsage({
    queryParams: {
      accountIdentifier: accountId,
      timestamp
    },
    lazy: module !== ModuleName.CI
  })

  const {
    data: ffUsageData,
    loading: loadingFFUsage,
    error: ffUsageError,
    refetch: refetchFFUsage
  } = useGetFFUsage({
    queryParams: {
      accountIdentifier: accountId,
      timestamp
    },
    lazy: module !== ModuleName.CF
  })

  const {
    data: ccmUsageData,
    loading: loadingCCMUsage,
    error: ccmUsageError,
    refetch: refetchCCMUsage
  } = useGetCCMLicenseUsage({
    queryParams: {
      accountIdentifier: accountId,
      timestamp: useGetCCMTimeStamp()
    },
    lazy: module !== ModuleName.CE
  })

  const {
    data: cdSIUsageData,
    loading: loadingCDSIUsage,
    error: cdSIUsageError,
    refetch: refetchCDSIUsage
  } = useGetCDLicenseUsageForServiceInstances({
    queryParams: {
      accountIdentifier: accountId,
      timestamp
    },
    lazy: module !== ModuleName.CD
  })

  const {
    data: cdUsageData,
    loading: loadingCDUsage,
    error: cdUsageError,
    refetch: refetchCDUsage
  } = useGetCDLicenseUsageForServices({
    queryParams: {
      accountIdentifier: accountId,
      timestamp
    },
    lazy: module !== ModuleName.CD
  })

  function setUsageByModule(): void {
    switch (module) {
      case ModuleName.CI:
        setUsageData({
          usage: {
            ci: {
              activeCommitters: ciUsageData?.data?.activeCommitters
            }
          },
          loadingUsage: loadingCIUsage,
          usageErrorMsg: ciUsageError?.message,
          refetchUsage: refetchCIUsage
        })
        break
      case ModuleName.CF:
        setUsageData({
          usage: {
            ff: {
              activeClientMAUs: ffUsageData?.activeClientMAUs,
              activeFeatureFlagUsers: ffUsageData?.activeFeatureFlagUsers
            }
          },
          loadingUsage: loadingFFUsage,
          usageErrorMsg: ffUsageError?.message,
          refetchUsage: refetchFFUsage
        })
        break
      case ModuleName.CE:
        setUsageData({
          usage: {
            ccm: {
              activeSpend: ccmUsageData?.data?.activeSpend
            }
          },
          loadingUsage: loadingCCMUsage,
          usageErrorMsg: ccmUsageError?.message,
          refetchUsage: refetchCCMUsage
        })
        break
      case ModuleName.CD:
        setUsageData({
          usage: {
            cd: {
              activeServiceInstances: cdSIUsageData?.data?.activeServiceInstances,
              activeServices: cdUsageData?.data?.activeServices,
              serviceLicenses: cdUsageData?.data?.serviceLicenses
            }
          },
          loadingUsage: loadingCDSIUsage || loadingCDUsage,
          usageErrorMsg: cdSIUsageError?.message || cdUsageError?.message,
          refetchUsage: () => {
            refetchCDSIUsage()
            refetchCDUsage()
          }
        })
        break
    }
  }

  useDeepCompareEffect(() => {
    setUsageByModule()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    ciUsageData,
    ciUsageError,
    loadingCIUsage,
    ffUsageData,
    ffUsageError,
    loadingFFUsage,
    ccmUsageData,
    ccmUsageError,
    loadingCCMUsage,
    cdSIUsageData,
    cdUsageData,
    cdSIUsageError,
    cdUsageError,
    loadingCDSIUsage,
    loadingCDUsage
  ])

  return usageData
}

export function useGetUsageNew(module: ModuleName): UsageDataReturn {
  const usage = useGetUsage(module)
  return { usageData: usage }
}
