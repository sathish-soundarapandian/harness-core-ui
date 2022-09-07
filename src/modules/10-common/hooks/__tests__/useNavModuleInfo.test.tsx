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

  test('test with empty array', () => {
    const { result } = renderHook(() => useNavModuleInfo([ModuleName.CD]), {
      wrapper: TestWrapper,
      initialProps: { path: '/account/my_account_id/cd/orgs/my_org/projects/my_project' }
    })

    expect(result.current[0].icon).toBe('cd-main')
    expect(result.current[0].label).toBe('common.purpose.cd.continuous')
    expect(result.current[0].shouldVisible).toBe(false)
  })
})
