/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@harness/uicore'
import type { AppDynamicsFileDefinition } from 'services/cv'

export const getIconByType = (type: AppDynamicsFileDefinition['type']): IconName => {
  switch (type) {
    case 'folder':
      return 'main-folder-open'
    case 'leaf':
      return 'main-like'
    default:
      return 'main-issue'
  }
}
