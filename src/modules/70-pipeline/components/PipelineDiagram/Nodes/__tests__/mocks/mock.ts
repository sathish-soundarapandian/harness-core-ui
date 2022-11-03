/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@harness/icons'

export const IconNodeData = {
  id: '60157c9d-7dc3-4c5c-a2bc-c02aa392fbc5',
  identifier: 'diamondStep',
  name: 'diamondStep',
  type: 'HarnessApproval',
  icon: 'harness-with-color' as IconName,
  data: {
    graphType: 'STEP_GRAPH',
    step: {
      type: 'HarnessApproval',
      name: 'diamondStep',
      identifier: 'diamondStep',
      spec: {},
      timeout: '1d'
    },
    isInComplete: false,
    loopingStrategyEnabled: false,
    conditionalExecutionEnabled: false,
    isTemplateNode: false,
    isNestedGroup: false
  },
  children: []
}
