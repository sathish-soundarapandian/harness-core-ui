/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, act, waitFor } from '@testing-library/react'
import routes from '@common/RouteDefinitions'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { FeatureFlag } from '@common/featureFlags'
import * as featureFlags from '@common/hooks/useFeatureFlag'
import DefineHealthSource from '../DefineHealthSource'

const createModeProps: TestWrapperProps = {
  path: routes.toCVAddMonitoringServicesSetup({ ...accountPathProps, ...projectPathProps }),
  pathParams: {
    accountId: '1234_accountId',
    projectIdentifier: '1234_project',
    orgIdentifier: '1234_org'
  }
}

const onNextMock = jest.fn().mockResolvedValue(jest.fn())
const onPrevious = jest.fn().mockResolvedValue(jest.fn())

jest.mock('@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs', () => ({
  ...(jest.requireActual('@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs') as any),
  get SetupSourceTabsContext() {
    return React.createContext({
      tabsInfo: [],
      sourceData: {},
      onNext: onNextMock,
      onPrevious: onPrevious
    })
  }
}))

jest.mock('@cv/hooks/IndexedDBHook/IndexedDBHook', () => ({
  useIndexedDBHook: jest.fn().mockReturnValue({
    isInitializingDB: false,
    dbInstance: {
      put: jest.fn(),
      get: jest.fn().mockReturnValue(undefined)
    }
  }),
  CVObjectStoreNames: {}
}))

describe('DefineHealthSource', () => {
  test.only('should have proper validation', async () => {
    const { getByText } = render(
      <TestWrapper {...createModeProps}>
        <SetupSourceTabs data={{}} tabTitles={['Tab1']} determineMaxTab={() => 1}>
          <DefineHealthSource />
        </SetupSourceTabs>
      </TestWrapper>
    )
    // next button visible
    expect(getByText('next')).not.toBeNull()
    await act(async () => {
      //click next
      fireEvent.click(getByText('next'))
      // check error texts
      await waitFor(() => expect(getByText('cv.onboarding.selectProductScreen.validationText.source')).not.toBeNull())
      await waitFor(() => expect(getByText('cv.onboarding.selectProductScreen.validationText.name')).not.toBeNull())
    })
  })

  test('Click on custom health card', async () => {
    jest.spyOn(featureFlags, 'useFeatureFlag').mockImplementation(flag => {
      if (flag === FeatureFlag.CHI_CUSTOM_HEALTH_LOGS) {
        return true
      }
      return false
    })
    const { getByText, container } = render(
      <TestWrapper {...createModeProps}>
        <SetupSourceTabs data={{}} tabTitles={['Tab1']} determineMaxTab={() => 1}>
          <DefineHealthSource />
        </SetupSourceTabs>
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('CustomHealth')).not.toBeNull())
    fireEvent.click(container.querySelector('[data-icon="service-custom-connector"]')!)
    await waitFor(() => expect(container.querySelector('[class*="Card--badge"]')).not.toBeNull())
    expect(container.querySelector('input[placeholder="- cv.healthSource.featurePlaceholder -"]')).not.toBeNull()
  })
})
