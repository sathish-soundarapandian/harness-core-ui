/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { renderHook, RenderHookResult } from '@testing-library/react-hooks'
import React from 'react'
import useCurrentModule, { UseCurrentModulePayload } from '@common/hooks/useCurrentModule'
import { TestWrapper } from '@common/utils/testUtils'

const renderUseCurrentModuleHook = (module = ''): RenderHookResult<undefined, UseCurrentModulePayload> =>
  renderHook(() => useCurrentModule(), {
    wrapper: ({ children }) => (
      <TestWrapper
        path={module ? '/account/:accountId/:module/' : '/account/:accountId'}
        pathParams={{ accountId: 'acc123', module }}
      >
        {children}
      </TestWrapper>
    )
  })

describe('useCurrentModule', () => {
  beforeEach(() => jest.resetAllMocks())

  test('it should return the module name from the router params', function () {
    const moduleName = 'cd'

    const { result } = renderUseCurrentModuleHook(moduleName)

    expect(result.current).toHaveProperty('module', moduleName)
  })

  test('it should return the isModule function which should return true when the module name from the router params is passed', async () => {
    const { result } = renderUseCurrentModuleHook('cf')

    expect(result.current).toHaveProperty('isModule')
    expect(result.current.isModule('CD')).toBeFalsy()
    expect(result.current.isModule('CF')).toBeTruthy()
  })

  test('it should return the module as undefined and isModule should return false when the router params do not include a module', async () => {
    const { result } = renderUseCurrentModuleHook()

    expect(result.current).toHaveProperty('module', undefined)
    expect(result.current).toHaveProperty('isModule')
    expect(result.current.isModule('CD')).toBeFalsy()
    expect(result.current.isModule('CF')).toBeFalsy()
  })
})
