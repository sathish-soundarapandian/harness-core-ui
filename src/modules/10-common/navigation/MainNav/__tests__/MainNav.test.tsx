/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
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
const zendeskCreate = {
  loading: false,
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      code: 201,
      message: 'ticket created'
    }
  }
}

jest.mock('services/resourcegroups', () => ({
  useGetCoveoToken: jest.fn(() =>
    Promise.resolve({
      data: {
        code: 201,
        token: 'dummyToken'
      }
    })
  ),
  useCreateZendeskTicket: jest.fn(() => Promise.resolve(zendeskCreate))
}))

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
  test('when new nav bar is enabled and no modules in preference store', () => {
    const { container } = render(
      <TestWrapper>
        <MainNav />
      </TestWrapper>
    )

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
        defaultLicenseStoreValues={{ licenseInformation: { CD: { status: 'ACTIVE' }, CHAOS: { status: 'ACTIVE' } } }}
      >
        <MainNav />
      </TestWrapper>
    )

    expect(queryByText('deploymentsText')).not.toBeNull()
    expect(queryByText('buildsText')).not.toBeNull()
    expect(queryByText('featureFlagsText')).not.toBeNull()
  })

  test('test when one of the feature flag of selected modules turns off', () => {
    const selectedModules = [ModuleName.CD, ModuleName.CF]
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
        defaultLicenseStoreValues={{ licenseInformation: { CD: { status: 'ACTIVE' }, CHAOS: { status: 'ACTIVE' } } }}
      >
        <MainNav />
      </TestWrapper>
    )

    expect(setModuleConfigPreference).toBeCalledWith({
      orderedModules,
      selectedModules: [ModuleName.CD, ModuleName.CF]
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
      <TestWrapper>
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
        defaultLicenseStoreValues={{
          licenseInformation: { CD: { status: 'ACTIVE' }, CHAOS: { status: 'ACTIVE' } }
        }}
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
