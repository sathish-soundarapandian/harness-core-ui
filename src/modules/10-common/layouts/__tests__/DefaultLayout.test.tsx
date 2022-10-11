/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { Link } from 'react-router-dom'

import { TestWrapper } from '@common/utils/testUtils'
import featuresFactory from 'framework/featureStore/FeaturesFactory'
import { useGetLicensesAndSummary, useExtendTrialLicense, useSaveFeedback } from 'services/cd-ng'

import { BANNER_KEY } from '../FeatureBanner'
import { BannerType } from '../Constants'
import { DefaultLayout } from '../DefaultLayout'

jest.mock('@common/navigation/MainNav', () => {
  return () => {
    return <div>Main nav</div>
  }
})

jest.mock('@common/hooks/useFeatures', () => ({
  useFeatures: jest.fn(() => ({}))
}))

jest.mock('@common/hooks/useGetUsageAndLimit', () => {
  return {
    useGetUsageAndLimit: () => {
      return useGetUsageAndLimitReturnMock
    }
  }
})

jest.mock('services/cd-ng')
const useGetLicensesAndSummaryMock = useGetLicensesAndSummary as jest.MockedFunction<any>
useGetLicensesAndSummaryMock.mockImplementation(() => {
  return {
    data: {}
  }
})
const useExtendTrialLicenseMock = useExtendTrialLicense as jest.MockedFunction<any>
useExtendTrialLicenseMock.mockImplementation(() => {
  return {
    mutate: jest.fn()
  }
})
const useSaveFeedbackMock = useSaveFeedback as jest.MockedFunction<any>
useSaveFeedbackMock.mockImplementation(() => {
  return {
    mutate: jest.fn()
  }
})
const useGetUsageAndLimitReturnMock = {
  limitData: {
    limit: {}
  },
  usageData: {
    usage: {}
  }
}

jest.mock('@common/hooks/useFeatureFlag', () => ({
  useFeatureFlag: jest.fn(() => true),
  useFeatureFlags: jest.fn(() => {
    return { FEATURE_ENFORCEMENT_ENABLED: true, FREE_PLAN_ENFORCEMENT_ENABLED: false }
  })
}))

const BANNER_TEXT = 'This is a feature banner'
const DISMISS_TEST_ID = 'feature-banner-dismiss'
const TEST_PATH = '/account/my_account/:module'

function renderMessage(): { message: () => React.ReactNode; bannerType: BannerType } {
  return {
    message: () => BANNER_TEXT,
    bannerType: BannerType.INFO
  }
}

describe('<DefaultLayout /> tests', () => {
  describe('feature banner tests', () => {
    beforeEach(() => {
      featuresFactory.unregisterAllFeatures()
      window.sessionStorage.removeItem(BANNER_KEY)
    })

    test('features banner is rendered', () => {
      featuresFactory.registerFeaturesByModule('cd', { features: [], renderMessage })
      const { container, getByText } = render(
        <TestWrapper path={TEST_PATH} pathParams={{ module: 'cd' }}>
          <DefaultLayout />
        </TestWrapper>
      )

      const txt = getByText(BANNER_TEXT)

      expect(txt).toBeDefined()
      expect(container).toMatchSnapshot()
    })

    test('features banner can be dismissed', () => {
      featuresFactory.registerFeaturesByModule('cd', { features: [], renderMessage })

      const { getByTestId, getByText } = render(
        <TestWrapper path={TEST_PATH} pathParams={{ module: 'cd' }}>
          <DefaultLayout />
        </TestWrapper>
      )

      const btn = getByTestId(DISMISS_TEST_ID)

      fireEvent.click(btn)

      expect(() => getByText(BANNER_TEXT)).toThrow()
    })

    test('features banner stays dismissed for a module', async () => {
      featuresFactory.registerFeaturesByModule('cd', { features: [], renderMessage })
      featuresFactory.registerFeaturesByModule('ci', { features: [], renderMessage })

      const { getByText } = render(
        <TestWrapper path={TEST_PATH} pathParams={{ module: 'cd' }}>
          <DefaultLayout />
          <Link to="/account/my_account/ci">To CI</Link>
          <Link to="/account/my_account/cd">To CD</Link>
        </TestWrapper>
      )

      // dismiss banner
      const btn = screen.getByTestId(DISMISS_TEST_ID)
      fireEvent.click(btn)
      expect(() => getByText(BANNER_TEXT)).toThrow()

      // go to CI
      const toCI = getByText('To CI')
      fireEvent.click(toCI)

      const txt = screen.getByText(BANNER_TEXT)
      expect(txt).toBeDefined()

      // go back to CD
      const toCD = getByText('To CD')
      fireEvent.click(toCD)

      expect(() => getByText(BANNER_TEXT)).toThrow()
    })

    test('Overuse banner', () => {
      featuresFactory.registerFeaturesByModule('cd', {
        features: [],
        renderMessage: () => {
          return {
            message: () => BANNER_TEXT,
            bannerType: BannerType.OVERUSE
          }
        }
      })
      const { container, getByText } = render(
        <TestWrapper path={TEST_PATH} pathParams={{ module: 'cd' }}>
          <DefaultLayout />
        </TestWrapper>
      )

      expect(getByText('common.overuse')).toBeInTheDocument()
      expect(container).toMatchSnapshot()
    })

    test('Level up banner', () => {
      featuresFactory.registerFeaturesByModule('cd', {
        features: [],
        renderMessage: () => {
          return {
            message: () => BANNER_TEXT,
            bannerType: BannerType.LEVEL_UP
          }
        }
      })
      const { container, getByText } = render(
        <TestWrapper path={TEST_PATH} pathParams={{ module: 'cd' }}>
          <DefaultLayout />
        </TestWrapper>
      )
      expect(getByText('common.levelUp')).toBeInTheDocument()
      expect(container).toMatchSnapshot()
    })
  })
})
