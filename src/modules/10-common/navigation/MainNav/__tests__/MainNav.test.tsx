/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { ModuleName } from 'framework/types/ModuleName'
import { DEFAULT_MODULES_ORDER } from '@common/hooks/useNavModuleInfo'
import MainNav from '../MainNav'

jest.mock('framework/PreferenceStore/PreferenceStoreContext')
;(usePreferenceStore as jest.Mock).mockImplementation(() => {
  return {
    setPreference: setModuleConfigPreference,
    preference: {
      orderedModules: [],
      selectedModules: []
    },
    clearPreference: jest.fn
  }
})

jest.mock('services/cd-ng', () => ({
  useGetAccountNGMock: jest.fn().mockImplementation(() => {
    return {
      data: {
        data: {
          name: 'account name',
          identifier: 'id1',
          cluster: 'free',
          defaultExperience: 'NG'
        }
      },
      refetch: jest.fn()
    }
  }),
  useGetAccountNG: jest.fn().mockImplementation(() => {
    return {
      data: {
        data: {
          name: 'account name',
          identifier: 'id1',
          cluster: 'free',
          defaultExperience: 'NG'
        }
      },
      refetch: jest.fn()
    }
  })
}))

const setModuleConfigPreference = jest.fn()

describe('main nav tests', () => {
  test('render when none of the modules are enabled', () => {
    const { container, queryByText } = render(
      <TestWrapper>
        <MainNav />
      </TestWrapper>
    )
    expect(container.querySelectorAll('[class*="navItem"]').length).toBe(4)
    expect(queryByText('common.home')).not.toBeNull()
    expect(queryByText('common.accountSettings')).not.toBeNull()
    expect(queryByText('common.myProfile')).not.toBeNull()
    expect(queryByText('buildsText')).toBeNull()
  })

  test('when modules are enabled', () => {
    const { queryByText } = render(
      <TestWrapper
        defaultFeatureFlagValues={{ CING_ENABLED: true, CFNG_ENABLED: true, CHAOS_ENABLED: true }}
        defaultLicenseStoreValues={{ licenseInformation: { CD: { status: 'ACTIVE' } } }}
      >
        <MainNav />
      </TestWrapper>
    )
    expect(queryByText('deploymentsText')).not.toBeNull()
    expect(queryByText('buildsText')).not.toBeNull()
    expect(queryByText('featureFlagsText')).not.toBeNull()
  })

  test('when ng dashbpard is enabled', () => {
    const { queryByText } = render(
      <TestWrapper
        defaultFeatureFlagValues={{
          CING_ENABLED: true,
          CFNG_ENABLED: true,
          CHAOS_ENABLED: true,
          NG_DASHBOARDS: true
        }}
      >
        <MainNav />
      </TestWrapper>
    )

    expect(queryByText('common.dashboards')).not.toBeNull()
  })

  test('when new nav bar is enabled and no modules in preference store', () => {
    const { container } = render(
      <TestWrapper
        defaultFeatureFlagValues={{
          CING_ENABLED: true,
          CFNG_ENABLED: true,
          CHAOS_ENABLED: true,
          NEW_LEFT_NAVBAR_SETTINGS: true
        }}
      >
        <MainNav />
      </TestWrapper>
    )

    screen.debug(container, 1000000)
    expect(container.querySelectorAll('[class*="navItem"]').length).toBe(5)
  })

  test('when new nav bar is enabled and preference store has modules', () => {
    const selectedModules = [ModuleName.CD, ModuleName.CI, ModuleName.CF]
    ;(usePreferenceStore as jest.Mock).mockImplementation(() => {
      return {
        setPreference: setModuleConfigPreference,
        preference: {
          orderedModules: [ModuleName.CD, ModuleName.CI, ModuleName.CF, ModuleName.CHAOS],
          selectedModules
        },
        clearPreference: jest.fn
      }
    })

    const { queryByText } = render(
      <TestWrapper
        defaultFeatureFlagValues={{
          CING_ENABLED: true,
          CFNG_ENABLED: true,
          CHAOS_ENABLED: true,
          NEW_LEFT_NAVBAR_SETTINGS: true
        }}
        defaultLicenseStoreValues={{ licenseInformation: { CD: { status: 'ACTIVE' } } }}
      >
        <MainNav />
      </TestWrapper>
    )

    expect(queryByText('deploymentsText')).not.toBeNull()
    expect(queryByText('buildsText')).not.toBeNull()
    expect(queryByText('featureFlagsText')).not.toBeNull()
  })

  test('test when one of the feature flag of selected modules turns off', () => {
    const selectedModules = [ModuleName.CD, ModuleName.CI, ModuleName.CF]
    const orderedModules = DEFAULT_MODULES_ORDER
    ;(usePreferenceStore as jest.Mock).mockImplementation(() => {
      return {
        setPreference: setModuleConfigPreference,
        preference: {
          orderedModules,
          selectedModules
        },
        clearPreference: jest.fn
      }
    })

    render(
      <TestWrapper
        defaultFeatureFlagValues={{
          CING_ENABLED: true,
          CFNG_ENABLED: false,
          CHAOS_ENABLED: true,
          NEW_LEFT_NAVBAR_SETTINGS: true
        }}
        defaultLicenseStoreValues={{ licenseInformation: { CD: { status: 'ACTIVE' } } }}
      >
        <MainNav />
      </TestWrapper>
    )

    expect(setModuleConfigPreference).toBeCalledWith({
      orderedModules,
      selectedModules: [ModuleName.CD, ModuleName.CI]
    })
  })

  test('test when there are no ordered modules', () => {
    ;(usePreferenceStore as jest.Mock).mockImplementation(() => {
      return {
        setPreference: setModuleConfigPreference,
        preference: {
          orderedModules: [],
          selectedModules: []
        },
        clearPreference: jest.fn
      }
    })

    render(
      <TestWrapper
        defaultFeatureFlagValues={{
          CING_ENABLED: true,
          CFNG_ENABLED: false,
          CHAOS_ENABLED: true,
          NEW_LEFT_NAVBAR_SETTINGS: true
        }}
      >
        <MainNav />
      </TestWrapper>
    )

    expect(setModuleConfigPreference).toBeCalledWith({
      orderedModules: DEFAULT_MODULES_ORDER,
      selectedModules: []
    })
  })

  test('test when a new module is added', () => {
    const selectedModules = [ModuleName.CD, ModuleName.CI, ModuleName.CF]
    const orderedModules = [...DEFAULT_MODULES_ORDER]
    orderedModules.pop()
    ;(usePreferenceStore as jest.Mock).mockImplementation(() => {
      return {
        setPreference: setModuleConfigPreference,
        preference: {
          orderedModules: orderedModules,
          selectedModules: selectedModules
        },
        clearPreference: jest.fn
      }
    })

    render(
      <TestWrapper
        defaultFeatureFlagValues={{
          CING_ENABLED: true,
          CFNG_ENABLED: true,
          CHAOS_ENABLED: true,
          NEW_LEFT_NAVBAR_SETTINGS: true
        }}
        defaultLicenseStoreValues={{ licenseInformation: { CD: { status: 'ACTIVE' } } }}
      >
        <MainNav />
      </TestWrapper>
    )

    expect(setModuleConfigPreference).toBeCalledWith({
      orderedModules: DEFAULT_MODULES_ORDER,
      selectedModules
    })
  })
})
