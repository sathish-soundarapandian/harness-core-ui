/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { CopyText } from '@common/components/CopyText/CopyText'
import type { Duration } from '@common/exports'
import type { useExpandErrorModal } from '@pipeline/components/ExpandErrorModal/useExpandErrorModal'
import type { useExecutionContext } from '@pipeline/context/ExecutionContext'
export interface TIUIAppCustomProps {
  customComponents: {
    CopyText: typeof CopyText
    Duration: typeof Duration
  }
  customHooks: {
    useExecutionContext: typeof useExecutionContext
    useExpandErrorModal: typeof useExpandErrorModal
  }
}
