/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { TestWrapper } from '@common/utils/testUtils'
import {
  useGetLicensesAndSummary,
  useGetCDLicenseUsageForServiceInstances,
  useGetCDLicenseUsageForServices
} from 'services/cd-ng'
import { useGetLicenseUsage } from 'services/cf'
import { useGetUsage } from 'services/ci'
import { useGetCCMLicenseUsage } from 'services/ce'
import { ModuleName } from 'framework/types/ModuleName'
import type { ModuleType } from 'framework/featureStore/featureStoreUtil'
import { useGetUsageAndLimit } from '../useGetUsageAndLimit'

enum status {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  ERROR = 'ERROR'
}
enum Editions {
  ENTERPRISE = 'ENTERPRISE'
}

enum LicenseType {
  PAID = 'PAID',
  TRIAL = 'TRIAL'
}
jest.mock('services/cd-ng')
const useGetLicensesAndSummaryMock = useGetLicensesAndSummary as jest.MockedFunction<any>
const useGetCDLicenseUsageForServiceInstancesMock = useGetCDLicenseUsageForServiceInstances as jest.MockedFunction<any>
const useGetCDLicenseUsageForServicesMock = useGetCDLicenseUsageForServices as jest.MockedFunction<any>
useGetCDLicenseUsageForServiceInstancesMock.mockImplementation(() => {
  return {
    data: {
      data: {
        activeServiceInstances: {
          count: 200,
          displayName: 'Last 30 Days'
        }
      }
    }
  }
})

useGetCDLicenseUsageForServicesMock.mockImplementation(() => {
  return {
    data: {
      data: {
        activeServices: {
          count: 23,
          displayName: 'Last 30 Days'
        }
      }
    }
  }
})

jest.mock('services/cf')
const useGetFFLicenseUsageMock = useGetLicenseUsage as jest.MockedFunction<any>
useGetFFLicenseUsageMock.mockImplementation(() => {
  return {
    data: {
      activeClientMAUs: {
        count: 32,
        displayName: 'Last 30 Days'
      },
      activeFeatureFlagUsers: {
        count: 55
      }
    },
    status: 'SUCCESS'
  }
})
jest.mock('services/ci')
const useGetCILicenseUsageMock = useGetUsage as jest.MockedFunction<any>
useGetCILicenseUsageMock.mockImplementation(() => {
  return {
    data: {
      data: {
        activeCommitters: {
          count: 23,
          displayName: 'Last 30 Days'
        }
      },
      status: 'SUCCESS'
    }
  }
})

jest.mock('services/ce')
const useGetCCMLicenseUsageMock = useGetCCMLicenseUsage as jest.MockedFunction<any>
useGetCCMLicenseUsageMock.mockImplementation(() => {
  return {
    data: {
      data: {
        activeSpend: {
          count: 29,
          displayName: 'Last 30 Days'
        }
      },
      status: 'SUCCESS'
    }
  }
})

describe('useGetUsageAndLimit', () => {
  test('should fetch CI usage and limit when module is CI', () => {
    useGetLicensesAndSummaryMock.mockImplementation(() => {
      return {
        data: {
          data: {
            totalDevelopers: 100
          },
          status: 'SUCCESS'
        }
      }
    })

    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper>{children}</TestWrapper>
    )
    const data = {
      status: status.SUCCESS,
      data: {
        totalDevelopers: 100,
        edition: 'ENTERPRISE' as Editions,
        licenseType: LicenseType.PAID,
        moduleType: 'CI' as ModuleType,
        maxExpiryTime: 1766494425000,
        totalWorkload: 100,
        totalServiceInstances: 1000
      },
      metaData: undefined,
      correlationId: '002d4b3d-d594-4cf8-bb01-609a16b91a12'
    }
    const { result } = renderHook(() => useGetUsageAndLimit(ModuleName.CI, undefined, data, false), { wrapper })
    expect(result.current.limitData.limit?.ci?.totalDevelopers).toBe(100)
    expect(result.current.limitData.limit?.ff).toBeUndefined()
    expect(result.current.usageData.usage?.ci?.activeCommitters?.count).toBe(23)
    expect(result.current.usageData.usage?.ff).toBeUndefined()
  })
  test('should fetch FF usage and limit when module is FF', async () => {
    useGetLicensesAndSummaryMock.mockImplementation(() => {
      return {
        data: {
          data: {
            totalClientMAUs: 200,
            totalFeatureFlagUnits: 300
          },
          status: 'SUCCESS'
        }
      }
    })
    const data = {
      status: status.SUCCESS,
      data: {
        totalClientMAUs: 200,
        totalFeatureFlagUnits: 300,
        edition: 'ENTERPRISE' as Editions,
        licenseType: LicenseType.PAID,
        moduleType: 'CF' as ModuleType,
        maxExpiryTime: 1766494425000,
        totalWorkload: 100,
        totalServiceInstances: 1000
      },
      metaData: undefined,
      correlationId: '002d4b3d-d594-4cf8-bb01-609a16b91a12'
    }
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper>{children}</TestWrapper>
    )
    const { result } = renderHook(() => useGetUsageAndLimit(ModuleName.CF, undefined, data), { wrapper })
    expect(result.current.limitData.limit?.ci).toBeUndefined()
    expect(result.current.limitData.limit?.ff?.totalClientMAUs).toBe(200)
    expect(result.current.limitData.limit?.ff?.totalFeatureFlagUnits).toBe(300)
    expect(result.current.usageData.usage?.ci).toBeUndefined()
    expect(result.current.usageData.usage?.ff?.activeClientMAUs?.count).toBe(32)
    expect(result.current.usageData.usage?.ff?.activeFeatureFlagUsers?.count).toBe(55)
  })

  test('should fetch CCM usage and limit when module is CCM', async () => {
    useGetLicensesAndSummaryMock.mockImplementation(() => {
      return {
        data: {
          data: {
            totalSpendLimit: 1000
          },
          status: 'SUCCESS'
        }
      }
    })
    const data = {
      status: status.SUCCESS,
      data: {
        totalSpendLimit: 1000,
        edition: 'ENTERPRISE' as Editions,
        licenseType: LicenseType.PAID,
        moduleType: 'CE' as ModuleType,
        maxExpiryTime: 1766494425000,
        totalWorkload: 100,
        totalServiceInstances: 1000
      },
      metaData: undefined,
      correlationId: '002d4b3d-d594-4cf8-bb01-609a16b91a12'
    }
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper>{children}</TestWrapper>
    )
    const { result } = renderHook(() => useGetUsageAndLimit(ModuleName.CE, undefined, data), { wrapper })
    expect(result.current.limitData.limit?.ci).toBeUndefined()
    expect(result.current.limitData.limit?.ff).toBeUndefined()
    expect(result.current.limitData.limit?.ccm?.totalSpendLimit).toBe(1000)
    expect(result.current.usageData.usage?.ci).toBeUndefined()
    expect(result.current.usageData.usage?.ff).toBeUndefined()
    expect(result.current.usageData.usage?.ccm?.activeSpend?.count).toBe(29)
  })

  test('should fetch CD usage and limit when module is CD', async () => {
    useGetLicensesAndSummaryMock.mockImplementation(() => {
      return {
        data: {
          data: {
            totalServiceInstances: 1000,
            totalWorkload: 100
          },
          status: 'SUCCESS'
        }
      }
    })

    const data = {
      status: status.SUCCESS,
      data: {
        edition: 'ENTERPRISE' as Editions,
        licenseType: LicenseType.PAID,
        moduleType: 'CD' as ModuleType,
        maxExpiryTime: 1766494425000,
        totalWorkload: 100,
        totalServiceInstances: 1000
      },
      metaData: undefined,
      correlationId: '002d4b3d-d594-4cf8-bb01-609a16b91a12'
    }
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper>{children}</TestWrapper>
    )
    const { result } = renderHook(() => useGetUsageAndLimit(ModuleName.CD, undefined, data, false), { wrapper })
    expect(result.current.limitData.limit?.ci).toBeUndefined()
    expect(result.current.limitData.limit?.ff).toBeUndefined()
    expect(result.current.limitData.limit?.cd?.totalServiceInstances).toBe(1000)
    expect(result.current.limitData.limit?.cd?.totalWorkload).toBe(100)
    expect(result.current.usageData.usage?.ci).toBeUndefined()
    expect(result.current.usageData.usage?.ff).toBeUndefined()
    expect(result.current.usageData.usage?.cd?.activeServiceInstances?.count).toBe(200)
    expect(result.current.usageData.usage?.cd?.activeServices?.count).toBe(23)
  })
})
