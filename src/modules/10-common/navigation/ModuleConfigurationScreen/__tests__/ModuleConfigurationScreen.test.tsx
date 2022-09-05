/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ModuleName } from 'framework/types/ModuleName'
import { usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { DEFAULT_MODULES_ORDER } from '@common/hooks/useNavModuleInfo'
import ModulesConfigurationScreen from '../ModuleConfigurationScreen'
import type { ModuleCarouselProps } from '../ModuleDetailsSection/ModuleCarousel'
import type { ModuleSortableListProps } from '../ModuleSortableList/ModuleSortableList'

jest.mock('framework/PreferenceStore/PreferenceStoreContext')

jest.mock('../useGetContentfulModules', () => {
  return () => {
    return {
      contentfulModuleMap: {},
      loading: false
    }
  }
})

const setModuleConfigPreference = jest.fn()

jest.mock('../ModuleSortableList/ModuleSortableList', () => {
  return (props: ModuleSortableListProps) => {
    return (
      <>
        <div data-testId={'selected-modules-length'}>{props.selectedModules.length}</div>
      </>
    )
  }
})

jest.mock('../ModuleDetailsSection/ModuleCarousel', () => {
  return (props: ModuleCarouselProps) => {
    return <>{props.module ? <div data-testId={`test-active-module-${props.module}`}></div> : null}</>
  }
})

// jest.spyOn(preferenceStore, 'usePreferenceStore').mockReturnValue({
//   setPreference: setModuleConfigPreference,
//   preference: {
//     orderedModules: [ModuleName.CD, ModuleName.CI],
//     selectedModules: [ModuleName.CD]
//   },
//   clearPreference: jest.fn
// })

describe('Module Configuration screen', () => {
  beforeEach(() => {
    ;(usePreferenceStore as jest.Mock).mockImplementation(() => {
      return {
        setPreference: setModuleConfigPreference,
        preference: {
          orderedModules: [ModuleName.CD, ModuleName.CI],
          selectedModules: [ModuleName.CD]
        },
        clearPreference: jest.fn
      }
    })
  })
  test('should render correctly', () => {
    const { container, queryByText } = render(
      <TestWrapper path="/account/:accountId" pathParams={{ accountId: 'dummy' }}>
        <ModulesConfigurationScreen onClose={jest.fn} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
    expect(queryByText('common.moduleConfig.selectModules')).toBeDefined()
    expect(queryByText('Module Sortable List')).toBeDefined()
    expect(queryByText('Module Carousel')).toBeDefined()
  })

  test('test when hide reordering is enabled', () => {
    const { queryByText } = render(
      <TestWrapper path="/account/:accountId" pathParams={{ accountId: 'dummy' }}>
        <ModulesConfigurationScreen hideReordering onClose={jest.fn} />
      </TestWrapper>
    )

    expect(queryByText('common.moduleConfig.selectModules')).toBeDefined()
    expect(queryByText('Module Sortable List')).toBeNull()
    expect(queryByText('Module Carousel')).toBeDefined()
  })

  test('test when hide header is enabled', () => {
    const { queryByText } = render(
      <TestWrapper path="/account/:accountId" pathParams={{ accountId: 'dummy' }}>
        <ModulesConfigurationScreen hideReordering hideHeader onClose={jest.fn} />
      </TestWrapper>
    )

    expect(queryByText('common.moduleConfig.selectModules')).toBeNull()
    expect(queryByText('Module Sortable List')).toBeNull()
    expect(queryByText('Module Carousel')).toBeDefined()
  })

  test('test with passing active module', () => {
    const { getByTestId } = render(
      <TestWrapper path="/account/:accountId" pathParams={{ accountId: 'dummy' }}>
        <ModulesConfigurationScreen activeModule={ModuleName.CI} onClose={jest.fn} />
      </TestWrapper>
    )

    expect(getByTestId('test-active-module-CI')).toBeDefined()
  })

  test('test click on reset to default', async () => {
    const { queryByText } = render(
      <TestWrapper path="/account/:accountId" pathParams={{ accountId: 'dummy' }}>
        <ModulesConfigurationScreen activeModule={ModuleName.CI} onClose={jest.fn} />
      </TestWrapper>
    )

    const restoreToDefault = queryByText('common.moduleConfig.restoreDefault')
    fireEvent.click(restoreToDefault!)
    expect(restoreToDefault).toBeDefined()

    expect(setModuleConfigPreference).toBeCalledWith({ selectedModules: [], orderedModules: DEFAULT_MODULES_ORDER })
  })

  test('test empty ordered modules from preference store', async () => {
    const { queryByText, container } = render(
      <TestWrapper path="/account/:accountId" pathParams={{ accountId: 'dummy' }}>
        <ModulesConfigurationScreen activeModule={ModuleName.CI} onClose={jest.fn} />
      </TestWrapper>
    )
    jest.resetAllMocks()
    // eslint-disable-next-line
    // @ts-ignore
    usePreferenceStore.mockImplementation(() => {
      return {
        setPreference: setModuleConfigPreference,
        preference: {
          orderedModules: [],
          selectedModules: []
        },
        clearPreference: jest.fn
      }
    })

    screen.debug(container, 1000000)
    const restoreToDefault = queryByText('common.moduleConfig.restoreDefault')
    fireEvent.click(restoreToDefault!)
    expect(restoreToDefault).toBeDefined()
  })
})
