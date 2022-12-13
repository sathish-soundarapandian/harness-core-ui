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
  STOLicenseSummaryDTO,
  useGetCDLicenseUsageForServiceInstances,
  useGetCDLicenseUsageForServices,
  CVLicenseSummaryDTO
} from 'services/cd-ng'
import { useDeepCompareEffect } from '@common/hooks'
import { useGetLicenseUsage as useGetFFUsage } from 'services/cf'
import { useGetUsage as useGetCIUsage } from 'services/ci'
import { useGetUsage as useGetSTOUsage } from 'services/sto'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { ModuleName } from 'framework/types/ModuleName'
import { useGetCCMLicenseUsage } from 'services/ce'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { useGetLicenseUsage } from 'services/cv'

export interface UsageAndLimitReturn {
  limitData: LimitReturn
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
  sto?: {
    activeDevelopers?: UsageProp
    activeScans?: UsageProp
  }
  cv?: {
    activeServices?: UsageProp
  }
}

interface LimitProps {
  ci?: {
    totalDevelopers?: number
  }
  ff?: {
    totalClientMAUs?: number
    totalFeatureFlagUnits?: number
  }
  cd?: {
    totalServiceInstances?: number
    totalWorkload?: number
  }
  ccm?: {
    totalSpendLimit?: number
  }
  sto?: {
    totalDevelopers?: number
    totalScans?: number
  }
  cv?: {
    totalServices?: number
  }
}

interface LimitReturn {
  limit?: LimitProps
  loadingLimit?: boolean
  limitErrorMsg?: string
  refetchLimit?: () => void
}

function useGetLimit(module: ModuleName): LimitReturn {
  const { accountId } = useParams<AccountPathProps>()

  function getLimitByModule(): LimitProps | undefined {
    let moduleLimit
    switch (module) {
      case ModuleName.CI: {
        moduleLimit = {
          ci: {
            totalDevelopers: (limitData?.data as CILicenseSummaryDTO)?.totalDevelopers
          }
        }
        break
      }
      case ModuleName.CF: {
        const cfData = limitData?.data as CFLicenseSummaryDTO
        moduleLimit = {
          ff: {
            totalClientMAUs: cfData?.totalClientMAUs,
            totalFeatureFlagUnits: cfData?.totalFeatureFlagUnits
          }
        }
        break
      }
      case ModuleName.CD: {
        const cdData = limitData?.data as CDLicenseSummaryDTO
        moduleLimit = {
          cd: {
            totalServiceInstances: cdData?.totalServiceInstances,
            totalWorkload: cdData?.totalWorkload
          }
        }
        break
      }
      case ModuleName.CE: {
        moduleLimit = {
          ccm: {
            totalSpendLimit: (limitData?.data as CELicenseSummaryDTO)?.totalSpendLimit
          }
        }
        break
      }

      case ModuleName.STO: {
        moduleLimit = {
          sto: {
            totalDevelopers: (limitData?.data as STOLicenseSummaryDTO)?.totalDevelopers
          }
        }
        break
      }

      case ModuleName.CV: {
        moduleLimit = {
          cv: {
            totalServices: (limitData?.data as CVLicenseSummaryDTO)?.totalServices
          }
        }
        break
      }
    }
    return moduleLimit
  }

  const {
    data: limitData,
    loading: loadingLimit,
    error: limitError,
    refetch: refetchLimit
  } = useGetLicensesAndSummary({
    queryParams: { moduleType: module as GetLicensesAndSummaryQueryParams['moduleType'] },
    accountIdentifier: accountId
  })

  const [limitReturn, setLimitReturn] = useState<LimitReturn>({})

  const limit = getLimitByModule()

  useDeepCompareEffect(() => {
    setLimitReturn({
      limit,
      limitErrorMsg: limitError?.message,
      loadingLimit,
      refetchLimit
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limitData, loadingLimit, limitError])

  return limitReturn
}

const timestamp = moment.now()

function useGetCCMTimeStamp(): number {
  const { licenseInformation } = useLicenseStore()
  return licenseInformation?.CE?.startTime || 0
}

export function useGetUsage(module: ModuleName): UsageReturn {
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
  const {
    data: stoUsageData,
    loading: loadingSTOUsage,
    error: stoUsageError,
    refetch: refetchSTOUsage
  } = useGetSTOUsage({
    queryParams: {
      accountIdentifier: accountId,
      timestamp
    },
    lazy: module !== ModuleName.STO
  })

  const {
    data: cvUsageData,
    loading: loadingCVUsage,
    error: cvUsageError,
    refetch: refetchCVUsage
  } = useGetLicenseUsage({
    queryParams: {
      accountIdentifier: accountId,
      timestamp
    },
    lazy: module !== ModuleName.CV
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
      case ModuleName.STO:
        setUsageData({
          usage: {
            sto: {
              activeDevelopers: stoUsageData?.data?.activeDevelopers,
              activeScans: stoUsageData?.data?.activeScans
            }
          },
          loadingUsage: loadingSTOUsage,
          usageErrorMsg: stoUsageError?.message,
          refetchUsage: refetchSTOUsage
        })
        break

      case ModuleName.CV:
        setUsageData({
          usage: {
            cv: {
              activeServices: cvUsageData?.data?.activeServices
            }
          },
          loadingUsage: loadingCVUsage,
          usageErrorMsg: cvUsageError?.message,
          refetchUsage: refetchCVUsage
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
    stoUsageData,
    stoUsageError,
    loadingSTOUsage,
    refetchSTOUsage,
    loadingCDSIUsage,
    loadingCDUsage,
    cvUsageData,
    loadingCVUsage,
    cvUsageError
  ])

  return usageData
}

export function useGetUsageAndLimit(module: ModuleName): UsageAndLimitReturn {
  const limit = useGetLimit(module)
  const usage = useGetUsage(module)
  return { limitData: limit, usageData: usage }
}
