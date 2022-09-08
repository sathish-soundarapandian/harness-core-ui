/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { renderHook } from '@testing-library/react-hooks'
import { TestWrapper } from '@common/utils/testUtils'
import { ModuleName } from 'framework/types/ModuleName'
import useNavModuleInfo from '../useNavModuleInfo'

describe('useModuleInfo tests', () => {
  test('test with empty array', () => {
    const { result } = renderHook(() => useNavModuleInfo([]), {
      wrapper: TestWrapper,
      initialProps: { path: '/account/my_account_id/cd/orgs/my_org/projects/my_project' }
    })

    expect(result.current.length).toBe(0)
  })

  test('test cd', () => {
    const { result } = renderHook(() => useNavModuleInfo([ModuleName.CD]), {
      wrapper: TestWrapper,
      initialProps: { path: '/account/my_account_id/cd/orgs/my_org/projects/my_project' }
    })

    expect(result.current[0].icon).toBe('cd-main')
    expect(result.current[0].label).toBe('common.purpose.cd.continuous')
    expect(result.current[0].shouldVisible).toBe(false)
  })

  test('test ci', () => {
    const { result } = renderHook(() => useNavModuleInfo([ModuleName.CI]), {
      wrapper: TestWrapper,
      initialProps: { path: '/account/my_account_id/cd/orgs/my_org/projects/my_project' }
    })

    expect(result.current[0].icon).toBe('ci-main')
    expect(result.current[0].label).toBe('common.purpose.ci.continuous')
    expect(result.current[0].shouldVisible).toBe(false)
  })

  test('test cv', () => {
    const { result } = renderHook(() => useNavModuleInfo([ModuleName.CV]), {
      wrapper: TestWrapper,
      initialProps: { path: '/account/my_account_id/cd/orgs/my_org/projects/my_project' }
    })

    expect(result.current[0].icon).toBe('cv-main')
    expect(result.current[0].label).toBe('common.purpose.cv.serviceReliability')
    expect(result.current[0].shouldVisible).toBe(false)
  })

  test('test cf', () => {
    const { result } = renderHook(() => useNavModuleInfo([ModuleName.CF]), {
      wrapper: TestWrapper,
      initialProps: { path: '/account/my_account_id/cd/orgs/my_org/projects/my_project' }
    })

    expect(result.current[0].icon).toBe('ff-solid')
    expect(result.current[0].label).toBe('common.purpose.cf.continuous')
    expect(result.current[0].shouldVisible).toBe(false)
  })

  test('test ce', () => {
    const { result } = renderHook(() => useNavModuleInfo([ModuleName.CE]), {
      wrapper: TestWrapper,
      initialProps: { path: '/account/my_account_id/cd/orgs/my_org/projects/my_project' }
    })

    expect(result.current[0].icon).toBe('ce-main')
    expect(result.current[0].label).toBe('common.purpose.ce.cloudCost')
    expect(result.current[0].shouldVisible).toBe(false)
  })

  test('test sto', () => {
    const { result } = renderHook(() => useNavModuleInfo([ModuleName.STO]), {
      wrapper: TestWrapper,
      initialProps: { path: '/account/my_account_id/cd/orgs/my_org/projects/my_project' }
    })

    expect(result.current[0].icon).toBe('sto-color-filled')
    expect(result.current[0].label).toBe('common.purpose.sto.continuous')
    expect(result.current[0].shouldVisible).toBe(false)
  })

  test('test CHAOS', () => {
    const { result } = renderHook(() => useNavModuleInfo([ModuleName.CHAOS]), {
      wrapper: TestWrapper,
      initialProps: { path: '/account/my_account_id/cd/orgs/my_org/projects/my_project' }
    })

    expect(result.current[0].icon).toBe('chaos-main')
    expect(result.current[0].label).toBe('common.chaosText')
    expect(result.current[0].shouldVisible).toBe(false)
  })

  test('test SCM', () => {
    const { result } = renderHook(() => useNavModuleInfo([ModuleName.SCM]), {
      wrapper: TestWrapper,
      initialProps: { path: '/account/my_account_id/cd/orgs/my_org/projects/my_project' }
    })

    expect(result.current[0].icon).toBe('gitops-green')
    expect(result.current[0].label).toBe('common.purpose.scm.name')
    expect(result.current[0].shouldVisible).toBe(false)
  })
})
