/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { useDeepCompareEffect, useQueryParams } from '@common/hooks'
import type { useFeatureFlag, useFeatureFlags } from '@common/hooks/useFeatureFlag'
import type { ALL_TIME_ZONES, formatDatetoLocale, getReadableDateTime } from '@common/utils/dateUtils'

export interface SRMCustomMicroFrontendProps {
  customHooks: {
    useQueryParams: typeof useQueryParams
    useFeatureFlag: typeof useFeatureFlag
    useFeatureFlags: typeof useFeatureFlags
    useDeepCompareEffect: typeof useDeepCompareEffect
  }
  customFunctions: {
    formatDatetoLocale: typeof formatDatetoLocale
    getReadableDateTime: typeof getReadableDateTime
  }
  customConstants: {
    ALL_TIME_ZONES: typeof ALL_TIME_ZONES
  }
}
