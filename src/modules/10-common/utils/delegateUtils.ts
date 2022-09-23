/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@wings-software/uicore'

export const delegateTypeToIcon = (delegateType: string): IconName => {
  let icon: IconName = 'cube'

  // TODO: these strings are not finalized from backend. Use strings for now
  switch ((delegateType || '').toLowerCase()) {
    case 'kubernetes':
    case 'ce_kubernetes':
      icon = 'app-kubernetes'
      break
    case 'ecs':
      icon = 'service-ecs'
      break
    case 'docker':
      icon = 'service-dockerhub'
      break
    case 'linux':
      icon = 'cube'
      break
    case 'shell_script':
      icon = 'run-step'
      break
    case 'helm_delegate':
      icon = 'service-helm'
      break
  }

  return icon
}
