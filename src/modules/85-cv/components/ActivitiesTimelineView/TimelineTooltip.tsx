/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@harness/uicore'
import type { EventData } from './ActivitiesTimelineView'

export function verificationResultToIcon(verificationResult: EventData['verificationResult']): IconName | undefined {
  switch (verificationResult) {
    case 'VERIFICATION_PASSED':
      return 'deployment-success-legacy'
    case 'VERIFICATION_FAILED':
    case 'ERROR':
      return 'deployment-failed-legacy'
    case 'IN_PROGRESS':
    case 'NOT_STARTED':
      return 'deployment-inprogress-legacy'
    default:
      return undefined
  }
}
