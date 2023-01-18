/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseStringsReturn } from 'framework/strings'
import { FilterTypes } from '../../CVMonitoredService.types'

export const getListTitle = (
  getString: UseStringsReturn['getString'],
  type: FilterTypes,
  serviceCount: number
): string => {
  // Replace if with switch while adding more cases
  if (type === FilterTypes.RISK) {
    return getString('cv.monitoredServices.showingServiceAtRisk', { serviceCount })
  }

  return getString('cv.monitoredServices.showingAllServices', { serviceCount })
}

/**
 * The switch will be enabled when
 *
 * 1. SRM Active license is present (AND)
 * 2. CVNG_LICENSE_ENFORCEMENT FF is disabled (OR)
 * 3.a. If the service is not enabled else where (AND) enforcement "allowed" is true (OR)
 * 3.b. If the service is enabled else where
 *
 *  (OR)
 *
 * 1. CVNG_ENABLED FF is present
 *
 */
export function getIsSwitchEnabled({
  isSRMLicensePresentAndActive,
  isSRMEnforcementLicenseEnabled,
  serviceMonitoringEnabled,
  srmServicesFeatureEnabled,
  isSRMEnabled
}: {
  isSRMLicensePresentAndActive?: boolean
  isSRMEnforcementLicenseEnabled?: boolean
  serviceMonitoringEnabled?: boolean
  srmServicesFeatureEnabled?: boolean
  isSRMEnabled?: boolean
}): boolean {
  if (isSRMLicensePresentAndActive) {
    return Boolean(!isSRMEnforcementLicenseEnabled || serviceMonitoringEnabled || srmServicesFeatureEnabled)
  } else if (isSRMEnabled) {
    // This condition will be removed when CVNG_ENABLED FF is removed
    return true
  }

  return false
}
