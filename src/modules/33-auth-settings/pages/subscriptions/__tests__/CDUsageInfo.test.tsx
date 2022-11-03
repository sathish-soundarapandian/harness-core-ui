/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ModuleName } from 'framework/types/ModuleName'
import CDUsageInfo from '../overview/CDUsageInfo'

jest.mock('@common/hooks/useGetUsageAndLimit', () => {
  return {
    useGetUsageAndLimit: () => {
      return useGetUsageAndLimitReturnMock
    }
  }
})
const useGetUsageAndLimitReturnMock = {
  limitData: {
    limit: {
      cd: {
        totalServiceInstances: 100,
        totalWorkload: 200
      }
    }
  },
  usageData: {
    usage: {
      cd: {
        activeServiceInstances: {
          count: 20,
          displayName: 'Last 30 Days'
        },
        activeServices: {
          count: 45,
          displayName: 'Last 30 Days'
        }
      }
    }
  }
}
enum Edition {
  ENTERPRISE = 'ENTERPRISE'
}
enum LicenseType {
  PAID = 'PAID'
}
enum ModuleType {
  CD = 'CD'
}
enum Status {
  ACTIVE = 'ACTIVE'
}

describe('CDUsageInfo', () => {
  test('CDUsageInfo', () => {
    const data = {
      id: '622596d705bb66724f02cf12',
      accountIdentifier: 'zEaak-FLS425IEO7OLzMUg',
      moduleType: ModuleType.CD,
      edition: Edition.ENTERPRISE,
      licenseType: LicenseType.PAID,
      status: Status.ACTIVE,
      startTime: 1633977619398,
      expiryTime: 1766494425000,
      premiumSupport: false,
      selfService: false,
      createdAt: 1646630615316,
      lastModifiedAt: 1646630615316,
      cdLicenseType: 'SERVICES',
      workloads: 100
    }
    const { container } = render(
      <TestWrapper>
        <CDUsageInfo licenseData={data} module={ModuleName.CD} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
