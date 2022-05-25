/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Editions, ModuleLicenseType } from '@common/constants/SubscriptionTypes'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { LICENSE_STATE_VALUES } from 'framework/LicenseStore/licenseStoreUtil'

export interface UseHostedBuildsReturn {
  enabledHostedBuildsForFreeUsers: boolean
  enabledHostedBuilds: boolean
}

export function useHostedBuilds(): UseHostedBuildsReturn {
  const { licenseInformation } = useLicenseStore()
  const { status, edition, licenseType } = licenseInformation['CI'] || {}
  // Hosted Builds to be only enabled for free users or paid enterprise/team users
  return {
    enabledHostedBuildsForFreeUsers: edition === Editions.FREE && status === LICENSE_STATE_VALUES.ACTIVE,
    enabledHostedBuilds:
      ((edition === Editions.FREE ||
        ([Editions.TEAM, Editions.ENTERPRISE].includes(edition as Editions) &&
          licenseType === ModuleLicenseType.PAID)) &&
        status === LICENSE_STATE_VALUES.ACTIVE) ||
      false
  }
}
