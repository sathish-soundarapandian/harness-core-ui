/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Editions } from '@common/constants/SubscriptionTypes'
import { isOnPrem } from '@common/utils/utils'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { useModuleInfo } from './useModuleInfo'

export function useAnyEnterpriseLicense(): boolean {
  const { licenseInformation } = useLicenseStore()

  if (isOnPrem()) return true

  const anyEntitlement = Object.values(licenseInformation).find(license => license?.edition === Editions.ENTERPRISE)
  return !!anyEntitlement
}

export function useCurrentEnterpriseLicense(): boolean {
  const { licenseInformation } = useLicenseStore()
  const module = useModuleInfo().module

  if (isOnPrem()) return true

  const moduleEntitlement = module
    ? licenseInformation?.[module?.toUpperCase()]
    : { edition: 'FREE', status: 'EXPIRED' } // default so we don't display HPE if theres an error getting license/module info

  const currentModuleEntitlement = moduleEntitlement?.edition === Editions.ENTERPRISE

  return currentModuleEntitlement
}
