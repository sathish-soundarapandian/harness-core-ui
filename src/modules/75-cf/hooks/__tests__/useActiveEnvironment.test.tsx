/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { renderHook, RenderHookResult } from '@testing-library/react-hooks'
import { TestWrapper } from '@common/utils/testUtils'
import useActiveEnvironment, { UseActiveEnvironmentPayload } from '../useActiveEnvironment'

const renderActiveEnvironmentHook = (
  activeEnvironment = 'TEST_ENV'
): RenderHookResult<void, UseActiveEnvironmentPayload> =>
  renderHook(() => useActiveEnvironment(), {
    wrapper: ({ children }) => <TestWrapper queryParams={{ activeEnvironment }}>{children}</TestWrapper>
  })

describe('useActiveEnvironment', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('it should return activeEnvironment and withActiveEnvironment', async () => {
    const { result } = renderActiveEnvironmentHook()

    expect(result.current).toHaveProperty('activeEnvironment')
    expect(result.current).toHaveProperty('withActiveEnvironment')
  })

  describe('activeEnvironment', () => {
    test.each(['test', ''])('it should return the active environment as "%s"', async (activeEnvironment: string) => {
      const { result } = renderActiveEnvironmentHook(activeEnvironment)

      expect(result.current).toHaveProperty('activeEnvironment', activeEnvironment)
    })
  })

  describe('withActiveEnvironment', () => {
    test('it should append a query string with the active environment', async () => {
      const env = 'test123'
      const url = 'test/url'

      const { result } = renderActiveEnvironmentHook(env)

      expect(result.current.withActiveEnvironment(url)).toEqual(`${url}?activeEnvironment=${env}`)
    })

    test('it should add the active environment to an existing query string', async () => {
      const env = 'test123'
      const url = 'test/url?test=123'

      const { result } = renderActiveEnvironmentHook(env)

      expect(result.current.withActiveEnvironment(url)).toEqual(`${url}&activeEnvironment=${env}`)
    })

    test('it should modify the active environment if it already exists', async () => {
      const env = 'test123'
      const { result } = renderActiveEnvironmentHook(env)

      expect(result.current.withActiveEnvironment('test/url?activeEnvironment=test456&test=123')).toEqual(
        `test/url?activeEnvironment=${env}&test=123`
      )
    })

    test('it should use the environment override instead of the activeEnvironment if passed', async () => {
      const env = 'test123'
      const envOverride = 'test456'
      const url = 'test/url'
      const { result } = renderActiveEnvironmentHook(env)

      const output = result.current.withActiveEnvironment(url, envOverride)
      expect(output).not.toContain(env)
      expect(output).toEqual(`${url}?activeEnvironment=${envOverride}`)
    })
  })
})
