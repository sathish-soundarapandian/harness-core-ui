/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { createRenderer } from 'react-test-renderer/shallow'
import * as hooks from '@common/hooks/useFeatureFlag'
import type { FeatureFlag } from '@common/featureFlags'
import RouteDestinations from '../RouteDestinations'

jest.mock('@common/utils/YamlUtils', () => ({}))
jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/hooks/useFeatureFlag')

describe('RouteDestinations', () => {
  const useFeatureFlagsMock = jest.spyOn(hooks, 'useFeatureFlags')

  const defaultFlagValues: Partial<Record<FeatureFlag, boolean>> = {
    NG_SETTINGS: false,
    FFM_3959_FF_MFE_Environment_Detail: false,
    FFM_5256_FF_MFE_Environment_Listing: false,
    FFM_6665_FF_MFE_Target_Detail: false,
    FFM_6666_FF_MFE_Target_Group_Detail: false,
    FFM_6800_FF_MFE_Onboarding: false,
    FFM_7127_FF_MFE_Onboarding_Detail: false
  }

  const renderRoutes = (flagOverrides: Partial<Record<FeatureFlag, boolean>> = {}): ReactElement[] => {
    useFeatureFlagsMock.mockReturnValue({ ...defaultFlagValues, ...flagOverrides })

    const renderer = createRenderer()
    renderer.render(<RouteDestinations />)

    return renderer.getRenderOutput().props.children
  }

  beforeEach(() => jest.resetAllMocks())

  test('it should render default routes, including pipeline routes', async () => {
    const routes = renderRoutes()

    expect(routes).toMatchSnapshot()
    expect(routesHavePageName(routes, 'PipelineRouteDestinations')).toBeTruthy()
  })

  test('it should render the NGUI version of the env detail page when FFM_3959_FF_MFE_Environment_Detail is false', async () => {
    const routes = renderRoutes({ FFM_3959_FF_MFE_Environment_Detail: false })

    expect(routesHavePageName(routes, 'EnvironmentDetails')).toBeTruthy()
  })

  test('it should not render the NGUI version of the env detail page when FFM_3959_FF_MFE_Environment_Detail is true', async () => {
    const routes = renderRoutes({ FFM_3959_FF_MFE_Environment_Detail: true })

    expect(routesHavePageName(routes, 'EnvironmentDetails')).toBeFalsy()
  })

  test('it should render the NGUI version of the Target Groups page when FFM_5939_MFE_TARGET_GROUPS_LISTING is false', async () => {
    const routes = renderRoutes({ FFM_5939_MFE_TARGET_GROUPS_LISTING: false })

    expect(routesHavePageName(routes, 'SegmentsPage')).toBeTruthy()
  })

  test('it should not render the NGUI version of the Target Groups page when FFM_5939_MFE_TARGET_GROUPS_LISTING is true', async () => {
    const routes = renderRoutes({ FFM_5939_MFE_TARGET_GROUPS_LISTING: true })

    expect(routesHavePageName(routes, 'SegmentsPage')).toBeFalsy()
  })

  test('it should render the NGUI version of the Target Group Detail page when FFM_6666_FF_MFE_Target_Groups_Detail is false', async () => {
    const routes = renderRoutes({ FFM_6666_FF_MFE_Target_Group_Detail: false })

    expect(routesHavePageName(routes, 'TargetGroupDetailPage')).toBeTruthy()
  })

  test('it should not render the NGUI version of the Target Group Detail page when FFM_6666_FF_MFE_Target_Groups_Detail is true', async () => {
    const routes = renderRoutes({ FFM_6666_FF_MFE_Target_Group_Detail: true })

    expect(routesHavePageName(routes, 'TargetGroupDetailPage')).toBeFalsy()
  })

  test('it should render the NGUI version of the env listing page when FFM_5256_FF_MFE_Environment_Listing is false', async () => {
    const routes = renderRoutes({ FFM_5256_FF_MFE_Environment_Listing: false })

    expect(routesHavePageName(routes, 'EnvironmentsPage')).toBeTruthy()
  })

  test('it should not render the NGUI version of the env listing page when FFM_5256_FF_MFE_Environment_Listing is true', async () => {
    const routes = renderRoutes({ FFM_5256_FF_MFE_Environment_Listing: true })

    expect(routesHavePageName(routes, 'EnvironmentsPage')).toBeFalsy()
  })

  test('it should render the NGUI version of the Targets page when FFM_5951_FF_MFE_Targets_Listing is false', async () => {
    const routes = renderRoutes({ FFM_5951_FF_MFE_Targets_Listing: false })

    expect(routesHavePageName(routes, 'TargetsPage')).toBeTruthy()
  })

  test('it should not render the NGUI version of the Targets page when FFM_5951_FF_MFE_Targets_Listing is true', async () => {
    const routes = renderRoutes({ FFM_5951_FF_MFE_Targets_Listing: true })

    expect(routesHavePageName(routes, 'TargetsPage')).toBeFalsy()
  })

  test('it should render the NGUI version of the Target Detail page when FFM_6665_FF_MFE_Target_Detail is false', async () => {
    const routes = renderRoutes({ FFM_6665_FF_MFE_Target_Detail: false })

    expect(routesHavePageName(routes, 'TargetDetailPage')).toBeTruthy()
  })

  test('it should not render the NGUI version of the Target Detail page when FFM_6665_FF_MFE_Target_Detail is true', async () => {
    const routes = renderRoutes({ FFM_6665_FF_MFE_Target_Detail: true })

    expect(routesHavePageName(routes, 'TargetDetailPage')).toBeFalsy()
  })

  test('it should render the NGUI version of the Onboarding page when FFM_6800_FF_MFE_Onboarding is false', async () => {
    const routes = renderRoutes({ FFM_6800_FF_MFE_Onboarding: false })

    expect(routesHavePageName(routes, 'OnboardingPage')).toBeTruthy()
  })

  test('it should not render the NGUI version of the Onboarding listing page when FFM_6800_FF_MFE_Onboarding is true', async () => {
    const routes = renderRoutes({ FFM_6800_FF_MFE_Onboarding: true })

    expect(routesHavePageName(routes, 'OnboardingPage')).toBeFalsy()
  })

  test('it should render the NGUI version of the ConfigurePath routing page when FFM_6800_FF_MFE_Onboarding is false', async () => {
    const routes = renderRoutes({ FFM_6800_FF_MFE_Onboarding: false })

    expect(routesHavePageName(routes, 'ConfigurePath')).toBeTruthy()
  })

  test('it should not render the NGUI version of the ConfigurePath routing page when FFM_6800_FF_MFE_Onboarding is true', async () => {
    const routes = renderRoutes({ FFM_6800_FF_MFE_Onboarding: true })

    expect(routesHavePageName(routes, 'ConfigurePath')).toBeFalsy()
  })

  test('it should render the NGUI version of Onboarding Detail page when FFM_7127_FF_MFE_Onboarding_Detail is false', async () => {
    const routes = renderRoutes({ FFM_7127_FF_MFE_Onboarding_Detail: false })

    expect(routesHavePageName(routes, 'OnboardingDetailPage')).toBeTruthy()
  })

  test('it should not render the NGUI version of the Onboarding Detail page when FFM_7127_FF_MFE_Onboarding_Detail is true', async () => {
    const routes = renderRoutes({ FFM_7127_FF_MFE_Onboarding_Detail: true })

    expect(routesHavePageName(routes, 'OnboardingDetailPage')).toBeFalsy()
  })
})

// Recursively search through routes (which can contain arrays of routes) for the given page name.
function routesHavePageName(el: ReactElement | ReactElement[], componentName: string): boolean {
  if (Array.isArray(el)) {
    for (const child of el) {
      if (routesHavePageName(child, componentName)) {
        return true
      }
    }
  } else {
    if (el.props?.children) {
      if (routesHavePageName(el.props?.children, componentName)) {
        return true
      }
    }

    return typeof el.type === 'function' && el.type.name === componentName
  }
  return false
}
