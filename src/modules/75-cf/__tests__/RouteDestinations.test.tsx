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
    FF_PIPELINE: true,
    FFM_1512: false,
    FFM_1827: false
  }

  const renderRoutes = (flagOverrides: Partial<Record<FeatureFlag, boolean>> = {}): ReactElement[] => {
    useFeatureFlagsMock.mockReturnValue({ ...defaultFlagValues, ...flagOverrides })

    const renderer = createRenderer()
    renderer.render(<RouteDestinations />)

    return renderer.getRenderOutput().props.children
  }

  beforeEach(() => jest.resetAllMocks())

  test('it should render default routes', async () => {
    const routes = renderRoutes()

    expect(routes).toMatchSnapshot()
  })

  describe('PipelineRouteDestinations', () => {
    test('it should not return the pipeline routes when the FF_PIPELINE feature flag is false', () => {
      const routes = renderRoutes({ FF_PIPELINE: false })

      expect(routes).not.toContainEqual(
        expect.objectContaining({ type: expect.objectContaining({ name: 'PipelineRouteDestinations' }) })
      )
    })

    test('it should return the pipeline routes when the FF_PIPELINE feature flag is true', () => {
      const routes = renderRoutes({ FF_PIPELINE: true })

      expect(routes).toContainEqual(
        expect.objectContaining({ type: expect.objectContaining({ name: 'PipelineRouteDestinations' }) })
      )
    })
  })
})
