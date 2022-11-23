/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { ChangeSourceTypes } from '@cv/pages/ChangeSource/ChangeSourceDrawer/ChangeSourceDrawer.constants'

export const getIconByChangeType = (type: string | undefined): { name: IconName; size: number; color?: string } => {
  switch (type) {
    case ChangeSourceTypes.HarnessCD:
    case ChangeSourceTypes.HarnessCDNextGen:
      return { name: 'cd-main', size: 24 }
    case ChangeSourceTypes.PagerDuty:
      return { name: 'service-pagerduty', size: 24 }
    case ChangeSourceTypes.K8sCluster:
      return { name: 'infrastructure', size: 32, color: Color.BLACK }
    default:
      return { name: 'circle', size: 0 }
  }
}
