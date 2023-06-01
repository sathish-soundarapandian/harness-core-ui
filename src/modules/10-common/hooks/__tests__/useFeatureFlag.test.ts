/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { renderHook } from '@testing-library/react-hooks'
import { useFeatureFlag, useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { TestWrapper } from '@common/utils/testUtils'

describe('useFeatureFlag', () => {
  test('it should return true when the flag is truth', async () => {
    const { result } = renderHook(() => useFeatureFlag(FeatureFlag.CUSTOM_DASHBOARD_V2), {
      wrapper: TestWrapper,
      initialProps: {
        defaultFeatureFlagValues: {
          CUSTOM_DASHBOARD_V2: true
        }
      }
    })

    expect(result.current).toBe(true)
  })

  test('it should return false when the flag is false', async () => {
    const { result } = renderHook(() => useFeatureFlag(FeatureFlag.CUSTOM_DASHBOARD_V2), {
      wrapper: TestWrapper,
      initialProps: {
        defaultFeatureFlagValues: {
          CUSTOM_DASHBOARD_V2: false
        }
      }
    })

    expect(result.current).toBe(false)
  })
})

describe('useFeatureFlags', () => {
  test('it should return the flags', async () => {
    const flags: Partial<Record<FeatureFlag, boolean>> = {
      CUSTOM_DASHBOARD_V2: true,
      ACCOUNT_BASIC_ROLE: false
    }

    const { result } = renderHook(() => useFeatureFlags(), {
      wrapper: TestWrapper,
      initialProps: {
        defaultFeatureFlagValues: flags
      }
    })

    expect(result.current).toEqual(expect.objectContaining(flags))
  })
})
