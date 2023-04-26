/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ModuleName } from 'framework/types/ModuleName'
import * as useUsage from '@common/hooks/useGetUsageAndLimit'
import type { UsageAndLimitReturn } from '@common/hooks/useGetUsageAndLimit'
import CETUsageInfo from '../overview/CETUsageInfo'

enum Edition {
  ENTERPRISE = 'ENTERPRISE'
}
enum LicenseType {
  PAID = 'PAID'
}
enum ModuleType {
  CET = 'CET'
}
enum Status {
  ACTIVE = 'ACTIVE'
}

const licenseData = {
  id: '622596d705bb66724f02cf12',
  accountIdentifier: 'zEaak-FLS425IEO7OLzMUg',
  moduleType: ModuleType.CET,
  edition: Edition.ENTERPRISE,
  licenseType: LicenseType.PAID,
  status: Status.ACTIVE,
  startTime: 1633977619398,
  expiryTime: 1766494425000,
  premiumSupport: false,
  selfService: false,
  createdAt: 1646630615316,
  lastModifiedAt: 1646630615316,
  numberOfAgents: 100
}

describe('CETUsageInfo', () => {
  test('CETUsageInfo', () => {
    const data: UsageAndLimitReturn = {
      limitData: {
        limit: {}
      },
      usageData: {
        usage: {
          cet: {
            activeAgents: {
              count: 20,
              displayName: 'Current'
            }
          }
        }
      }
    }

    jest.spyOn(useUsage, 'useGetUsageAndLimit').mockReturnValue(data)

    const { container } = render(
      <TestWrapper>
        <CETUsageInfo module={ModuleName.CET} licenseData={licenseData} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('CETUsageInfo Empty Data', () => {
    const emptyLicenseData = {}
    const data: UsageAndLimitReturn = {
      limitData: {
        limit: {}
      },
      usageData: {
        usage: {}
      }
    }

    jest.spyOn(useUsage, 'useGetUsageAndLimit').mockReturnValue(data)

    const { container } = render(
      <TestWrapper>
        <CETUsageInfo module={ModuleName.CET} licenseData={emptyLicenseData} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('CETUsageInfo Empty Data 2', () => {
    const emptyLicenseData = {}
    const data: UsageAndLimitReturn = {
      limitData: {
        limit: {}
      },
      usageData: {
        usage: {
          cet: {}
        }
      }
    }

    jest.spyOn(useUsage, 'useGetUsageAndLimit').mockReturnValue(data)

    const { container } = render(
      <TestWrapper>
        <CETUsageInfo module={ModuleName.CET} licenseData={emptyLicenseData} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('CETUsageInfo Empty Data3', () => {
    const emptyLicenseData = {}
    const data: UsageAndLimitReturn = {
      limitData: {
        limit: {}
      },
      usageData: {
        usage: {
          cet: {
            activeAgents: {}
          }
        }
      }
    }

    jest.spyOn(useUsage, 'useGetUsageAndLimit').mockReturnValue(data)

    const { container } = render(
      <TestWrapper>
        <CETUsageInfo module={ModuleName.CET} licenseData={emptyLicenseData} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('CETUsageInfo UsageError', () => {
    const data: UsageAndLimitReturn = { limitData: {}, usageData: { usageErrorMsg: 'usage error' } }

    jest.spyOn(useUsage, 'useGetUsageAndLimit').mockReturnValue(data)

    const { container } = render(
      <TestWrapper>
        <CETUsageInfo module={ModuleName.CET} licenseData={licenseData} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('CETUsageInfo LimitError', () => {
    const data: UsageAndLimitReturn = { limitData: { limitErrorMsg: 'limit error' }, usageData: {} }

    jest.spyOn(useUsage, 'useGetUsageAndLimit').mockReturnValue(data)

    const { container } = render(
      <TestWrapper>
        <CETUsageInfo module={ModuleName.CET} licenseData={licenseData} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('CETUsageInfo loading', () => {
    const data: UsageAndLimitReturn = { limitData: { loadingLimit: true }, usageData: { loadingUsage: true } }

    jest.spyOn(useUsage, 'useGetUsageAndLimit').mockReturnValue(data)

    const { container } = render(
      <TestWrapper>
        <CETUsageInfo module={ModuleName.CET} licenseData={licenseData} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
