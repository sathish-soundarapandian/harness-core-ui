/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as licenseStoreContextMock from 'framework/LicenseStore/LicenseStoreContext'
import * as FeatureFlag from '@common/hooks/useFeatureFlag'
import { useHostedBuilds } from '../useHostedBuild'

// tc1 CI edition = FREE, licenseType = TRIAL, status = ACTIVE
// tc2 CI edition = FREE, licenseType = PAID, status = ACTIVE
// tc3 CI edition = TEAM, licenseType = TRIAL, status = ACTIVE
// tc4 CI edition = TEAM, licenseType = PAID, status = ACTIVE
// tc5 CI edition = COMMUNITY, licenseType = TRIAL, status = ACTIVE
// tc6 CI edition = COMMUNITY, licenseType = PAID, status = ACTIVE
// tc7 CI edition = COMMUNITY, no licenseType, status = ACTIVE
// tc8 CI no edition, licenseType = PAID, status = ACTIVE
// tc9 CI edition = FREE, licenseType = TRIAL, status = EXPIRED
// tc10 FF HOSTED_BUILDS is true
// tc11 FF HOSTED_BUILDS is false

jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
  HOSTED_BUILDS: false
})

describe('Test useHostedBuilds', () => {
  test('tc1', () => {
    jest.spyOn(licenseStoreContextMock, 'useLicenseStore').mockReturnValue({
      licenseInformation: { CI: { edition: 'FREE', licenseType: 'TRIAL', status: 'ACTIVE' } }
    } as any)
    expect(useHostedBuilds().enabledHostedBuildsForFreeUsers).toBe(true)
    expect(useHostedBuilds().enabledHostedBuilds).toBe(true)
  })

  test('tc2', () => {
    jest.spyOn(licenseStoreContextMock, 'useLicenseStore').mockReturnValue({
      licenseInformation: { CI: { edition: 'FREE', licenseType: 'PAID', status: 'ACTIVE' } }
    } as any)
    expect(useHostedBuilds().enabledHostedBuildsForFreeUsers).toBe(true)
    expect(useHostedBuilds().enabledHostedBuilds).toBe(true)
  })

  test('tc3', () => {
    jest.spyOn(licenseStoreContextMock, 'useLicenseStore').mockReturnValue({
      licenseInformation: { CI: { edition: 'TEAM', licenseType: 'TRIAL', status: 'ACTIVE' } }
    } as any)
    expect(useHostedBuilds().enabledHostedBuildsForFreeUsers).toBe(false)
    expect(useHostedBuilds().enabledHostedBuilds).toBe(false)
  })

  test('tc4', () => {
    jest.spyOn(licenseStoreContextMock, 'useLicenseStore').mockReturnValue({
      licenseInformation: { CI: { edition: 'TEAM', licenseType: 'PAID', status: 'ACTIVE' } }
    } as any)
    expect(useHostedBuilds().enabledHostedBuildsForFreeUsers).toBe(false)
    expect(useHostedBuilds().enabledHostedBuilds).toBe(true)
  })

  test('tc5', () => {
    jest.spyOn(licenseStoreContextMock, 'useLicenseStore').mockReturnValue({
      licenseInformation: { CI: { edition: 'COMMUNITY', licenseType: 'TRIAL', status: 'ACTIVE' } }
    } as any)
    expect(useHostedBuilds().enabledHostedBuildsForFreeUsers).toBe(false)
    expect(useHostedBuilds().enabledHostedBuilds).toBe(false)
  })

  test('tc6', () => {
    jest.spyOn(licenseStoreContextMock, 'useLicenseStore').mockReturnValue({
      licenseInformation: { CI: { edition: 'COMMUNITY', licenseType: 'PAID', status: 'ACTIVE' } }
    } as any)
    expect(useHostedBuilds().enabledHostedBuildsForFreeUsers).toBe(false)
    expect(useHostedBuilds().enabledHostedBuilds).toBe(false)
  })

  test('tc7', () => {
    jest.spyOn(licenseStoreContextMock, 'useLicenseStore').mockReturnValue({
      licenseInformation: { CI: { edition: 'COMMUNITY', status: 'ACTIVE' } }
    } as any)
    expect(useHostedBuilds().enabledHostedBuildsForFreeUsers).toBe(false)
    expect(useHostedBuilds().enabledHostedBuilds).toBe(false)
  })

  test('tc8', () => {
    jest.spyOn(licenseStoreContextMock, 'useLicenseStore').mockReturnValue({
      licenseInformation: { CI: { licenseType: 'TRIAL', status: 'ACTIVE' } }
    } as any)
    expect(useHostedBuilds().enabledHostedBuildsForFreeUsers).toBe(false)
    expect(useHostedBuilds().enabledHostedBuilds).toBe(false)
  })

  test('tc9', () => {
    jest.spyOn(licenseStoreContextMock, 'useLicenseStore').mockReturnValue({
      licenseInformation: { CI: { edition: 'FREE', licenseType: 'TRIAL', status: 'EXPIRED' } }
    } as any)
    expect(useHostedBuilds().enabledHostedBuildsForFreeUsers).toBe(false)
    expect(useHostedBuilds().enabledHostedBuilds).toBe(false)
  })

  test('tc10', () => {
    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      HOSTED_BUILDS: true
    })
    expect(useHostedBuilds().enabledHostedBuildsForFreeUsers).toBe(true)
    expect(useHostedBuilds().enabledHostedBuilds).toBe(false)
  })

  test('tc11', () => {
    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      HOSTED_BUILDS: false
    })
    expect(useHostedBuilds().enabledHostedBuildsForFreeUsers).toBe(false)
    expect(useHostedBuilds().enabledHostedBuilds).toBe(false)
  })
})
