/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { BuildCreditInfoTable } from '../overview/BuildCreditInfoTable'

enum Edition {
  ENTERPRISE = 'ENTERPRISE'
}
enum LicenseType {
  PAID = 'PAID'
}
enum ModuleType {
  CI = 'CI'
}
enum Status {
  ACTIVE = 'ACTIVE'
}

describe('Build Credit Info test ', () => {
  test('Build Credit Info', () => {
    const data = {
      id: '622596d705bb66724f02cf12',
      accountIdentifier: 'zEaak-FLS425IEO7OLzMUg',
      moduleType: ModuleType.CI,
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
        <BuildCreditInfoTable
          licenseData={data}
          data={[
            { quantity: 1000, expiryTime: 1234567789, purchaseTime: 12345675678 },
            { quantity: 2000, expiryTime: 1234567789, purchaseTime: 12345675678 }
          ]}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot('build credit table')
  })
  test('Build Credit Info with emmpty credit data', () => {
    const data = {
      id: '622596d705bb66724f02cf12',
      accountIdentifier: 'zEaak-FLS425IEO7OLzMUg',
      moduleType: ModuleType.CI,
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
        <BuildCreditInfoTable licenseData={data} data={[]} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot('build credit table with empty credit data')
  })
})
