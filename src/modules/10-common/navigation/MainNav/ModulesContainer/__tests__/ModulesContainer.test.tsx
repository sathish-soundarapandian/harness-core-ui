/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act } from 'react-dom/test-utils'
import { fireEvent, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { ModuleName } from 'framework/types/ModuleName'
import ModulesContainer from '../ModulesContainer'

jest.mock('framework/PreferenceStore/PreferenceStoreContext')

jest.mock('lodash-es', () => ({
  ...(jest.requireActual('lodash-es') as Record<string, any>),
  debounce: jest.fn(fn => {
    fn.cancel = jest.fn()
    return fn
  })
}))

const setModuleConfigPreference = jest.fn()

describe('Modules containter test', () => {
  test('render', () => {
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

    const { container, queryByText } = render(
      <TestWrapper
        path={routes.toConnectorDetails({ accountId: 'testId' })}
        defaultFeatureFlagValues={{ CDNG_ENABLED: true, CING_ENABLED: true, CFNG_ENABLED: true, CHAOS_ENABLED: true }}
      >
        <ModulesContainer />
      </TestWrapper>
    )
    // checking length of nav items
    expect(container.querySelectorAll('[class*="navItem"]').length).toBe(3)
    // selected modules should be defined
    expect(queryByText('deploymentsText')).toBeDefined()
    expect(queryByText('buildsText')).toBeDefined()
    expect(queryByText('featureFlagsText')).toBeDefined()
  })

  test('chevron should be disabled when selectedModules are less than equal to window size', () => {
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

    const { container } = render(
      <TestWrapper
        path={routes.toConnectorDetails({ accountId: 'testId' })}
        defaultFeatureFlagValues={{ CDNG_ENABLED: true, CING_ENABLED: true, CFNG_ENABLED: true, CHAOS_ENABLED: true }}
      >
        <ModulesContainer />
      </TestWrapper>
    )

    expect(container.querySelector('[class*="chevron"]')).toBeNull()
  })

  test('selected modules greater than window size', () => {
    const selectedModules = [ModuleName.CD, ModuleName.CI, ModuleName.CF, ModuleName.CHAOS]
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

    const { container } = render(
      <TestWrapper
        path={routes.toConnectorDetails({ accountId: 'testId' })}
        defaultFeatureFlagValues={{ CDNG_ENABLED: true, CING_ENABLED: true, CFNG_ENABLED: true, CHAOS_ENABLED: true }}
      >
        <ModulesContainer />
      </TestWrapper>
    )
    expect(container.querySelector('span[data-icon="main-caret-down"]')).not.toBeNull()
  })

  test('test up and down chevron click', () => {
    const selectedModules = [ModuleName.CD, ModuleName.CI, ModuleName.CF, ModuleName.CHAOS]
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

    const { container } = render(
      <TestWrapper
        path={routes.toConnectorDetails({ accountId: 'testId' })}
        defaultFeatureFlagValues={{ CDNG_ENABLED: true, CING_ENABLED: true, CFNG_ENABLED: true, CHAOS_ENABLED: true }}
      >
        <ModulesContainer />
      </TestWrapper>
    )
    expect(container.querySelector('span[data-icon="main-caret-up"]')).toBeNull()
    fireEvent.click(container.querySelector('span[data-icon="main-caret-down"]')!)
    expect(container.querySelector('span[data-icon="main-caret-up"]')).not.toBeNull()
    fireEvent.click(container.querySelector('span[data-icon="main-caret-up"]')!)
    expect(container.querySelector('span[data-icon="main-caret-up"]')).toBeNull()
  })

  test('test when preference is not defined', () => {
    ;(usePreferenceStore as jest.Mock).mockImplementation(() => {
      return {
        setPreference: setModuleConfigPreference,
        preference: undefined,
        clearPreference: jest.fn
      }
    })

    const { container } = render(
      <TestWrapper
        path={routes.toConnectorDetails({ accountId: 'testId' })}
        defaultFeatureFlagValues={{ CDNG_ENABLED: true, CING_ENABLED: true, CFNG_ENABLED: true, CHAOS_ENABLED: true }}
      >
        <ModulesContainer />
      </TestWrapper>
    )
    expect(container.querySelectorAll('[class*="navItem"]').length).toBe(0)
  })

  test('test on scroll', async () => {
    const selectedModules = [ModuleName.CD, ModuleName.CI, ModuleName.CF, ModuleName.CHAOS]
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

    const { container, queryByText } = render(
      <TestWrapper
        path={routes.toConnectorDetails({ accountId: 'testId' })}
        defaultFeatureFlagValues={{ CDNG_ENABLED: true, CING_ENABLED: true, CFNG_ENABLED: true, CHAOS_ENABLED: true }}
      >
        <ModulesContainer />
      </TestWrapper>
    )
    const scrollableContainer = container.querySelector('[class*="modules"]')

    queryByText('common.chaosText')?.scrollIntoView()

    await act(async () => {
      fireEvent.scroll(scrollableContainer!, { target: { scrollY: 10 } })
    })

    expect(container.querySelector('span[data-icon="main-caret-up"]')).toBeNull()
    expect(container.querySelector('span[data-icon="main-caret-down"]')).not.toBeNull()
  })
})
