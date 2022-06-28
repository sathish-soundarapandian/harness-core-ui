/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useContext } from 'react'
import { AppStoreContext, FeatureFlagMap } from 'framework/AppStore/AppStoreContext'
import type { FeatureFlag } from '@common/featureFlags'

/**
 * Usage if you need a single flag:
 *
 * const enabled = useFeatureFlag("FLAG_NAME")
 *
 * OR, if you need multiple flags:
 *
 * const { FLAG_NAME_1, FLAG_NAME_2 } = useFeatureFlags()
 *
 */

export function useFeatureFlag(flag: FeatureFlag): boolean {
  const { featureFlags } = useContext(AppStoreContext)
  return !!featureFlags[flag]
}

export function useFeatureFlags(): FeatureFlagMap {
  const { featureFlags } = useContext(AppStoreContext)
  return featureFlags
}
