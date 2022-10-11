/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { noop } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import ModuleList from '../ModuleList'

jest.mock('../../ModuleConfigurationScreen/ModuleConfigurationScreen', () => {
  return () => {
    return 'Module config screen'
  }
})

describe('ModuleList', () => {
  test('should render correctly without modules', () => {
    const { container, getByText, getByTestId } = render(
      <TestWrapper>
        <ModuleList isOpen={true} close={noop} usePortal={false} />
      </TestWrapper>
    )

    expect(container.querySelector('[data-icon="customize"]')).not.toBeNull()
    expect(getByText('common.moduleList.title')).toBeDefined()
    expect(getByTestId('grouplistContainer').children.length).toEqual(0)
    expect(container).toMatchSnapshot()
  })

  test('should render correctly with modules enabled and disabled', () => {
    const { queryByText } = render(
      <TestWrapper
        defaultAppStoreValues={{
          featureFlags: {
            CDNG_ENABLED: true,
            CING_ENABLED: true,
            CVNG_ENABLED: true,
            CFNG_ENABLED: true
          }
        }}
      >
        <ModuleList isOpen={true} close={noop} usePortal={false} />
      </TestWrapper>
    )
    expect(queryByText('common.purpose.ci.continuous')).toBeDefined()
    expect(queryByText('common.purpose.cd.continuous')).toBeDefined()
    expect(queryByText('common.purpose.cf.continuous')).toBeDefined()
    expect(queryByText('common.purpose.cv.serviceReliability')).toBeDefined()
    expect(queryByText('common.purpose.ce.cloudCost')).toBeNull()
    expect(queryByText('common.purpose.sto.continuous')).toBeNull()
    expect(queryByText('common.chaosText')).toBeNull()
  })

  test('render module config screen by clicking on settings icon', () => {
    const clickOnConfig = jest.fn()
    const { container, queryByText } = render(
      <TestWrapper
        defaultAppStoreValues={{
          featureFlags: {
            CDNG_ENABLED: true,
            CING_ENABLED: true,
            CVNG_ENABLED: true,
            CFNG_ENABLED: true
          }
        }}
      >
        <ModuleList isOpen={true} close={noop} usePortal={false} onConfigIconClick={clickOnConfig} />
      </TestWrapper>
    )
    const customizeIcon = container.querySelector('[data-icon="customize"]')
    fireEvent.click(customizeIcon!)
    expect(queryByText('common.moduleList.title')).not.toBeNull()
    expect(clickOnConfig).toBeCalled()
  })

  test('click on customise without passing onConfigClick', () => {
    const clickOnConfig = jest.fn()
    const { container, queryByText } = render(
      <TestWrapper
        defaultAppStoreValues={{
          featureFlags: {
            CDNG_ENABLED: true,
            CING_ENABLED: true,
            CVNG_ENABLED: true,
            CFNG_ENABLED: true
          }
        }}
      >
        <ModuleList isOpen={true} close={noop} usePortal={false} />
      </TestWrapper>
    )
    const customizeIcon = container.querySelector('[data-icon="customize"]')
    fireEvent.click(customizeIcon!)
    expect(queryByText('common.moduleList.title')).not.toBeNull()
    expect(clickOnConfig).not.toBeCalled()
    expect(queryByText('Module config screen')).toBeNull()
  })

  test('render module config screen by clicking on module tooltip', () => {
    const { container, queryByText } = render(
      <TestWrapper
        defaultAppStoreValues={{
          featureFlags: {
            CDNG_ENABLED: true
          }
        }}
      >
        <ModuleList isOpen={true} close={noop} usePortal={false} />
      </TestWrapper>
    )
    const tooltip = container.querySelector('[data-icon="tooltip-icon"]')
    fireEvent.click(tooltip!)
    expect(queryByText('Module config screen')).not.toBeNull()
  })
})
