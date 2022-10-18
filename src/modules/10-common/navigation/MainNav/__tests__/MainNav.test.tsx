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

const setModuleConfigPreference = jest.fn()

describe('main nav tests', () => {
  test('render when none of the modules are enabled', () => {
    const { container, queryByText } = render(
      <TestWrapper>
        <MainNav />
      </TestWrapper>
    )
    expect(container.querySelectorAll('[class*="navItem"]').length).toBe(3)
    expect(queryByText('common.home')).not.toBeNull()
    expect(queryByText('common.accountSettings')).not.toBeNull()
    expect(queryByText('common.myProfile')).not.toBeNull()
    expect(queryByText('buildsText')).toBeNull()
  })

  test('when modules are enabled', () => {
    const { queryByText } = render(
      <TestWrapper
        defaultFeatureFlagValues={{ CDNG_ENABLED: true, CING_ENABLED: true, CFNG_ENABLED: true, CHAOS_ENABLED: true }}
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
          CDNG_ENABLED: true,
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
          CDNG_ENABLED: true,
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
    expect(container.querySelectorAll('[class*="navItem"]').length).toBe(4)
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
          CDNG_ENABLED: true,
          CING_ENABLED: true,
          CFNG_ENABLED: true,
          CHAOS_ENABLED: true,
          NEW_LEFT_NAVBAR_SETTINGS: true
        }}
      >
        <MainNav />
      </TestWrapper>
    )

    expect(queryByText('deploymentsText')).not.toBeNull()
    expect(queryByText('buildsText')).not.toBeNull()
    expect(queryByText('featureFlagsText')).not.toBeNull()
  })
})
