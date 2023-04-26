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
import SubscriptionUsageView from '../overview/SubscriptionUsageView'
import { licenseData } from './CDUsageInfo.test'

const featureFlags = {
  CVNG_ENABLED: true,
  CING_ENABLED: true,
  CENG_ENABLED: true,
  CFNG_ENABLED: true,
  CHAOS_ENABLED: true
}

describe('Subscriptions graph view undefined module flow  ', () => {
  test('it renders the subscriptions page with no data service table', async () => {
    const { container } = render(
      <TestWrapper
        defaultAppStoreValues={{ featureFlags }}
        defaultLicenseStoreValues={{
          licenseInformation: {
            CF: { edition: 'FREE', status: 'ACTIVE' }
          }
        }}
      >
        <SubscriptionUsageView licenseData={licenseData} module={ModuleName.CF} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
})
