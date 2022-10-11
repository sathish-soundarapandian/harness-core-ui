/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ExecutorInfoDTO } from 'services/pipeline-ng'
import type { StringKeys } from 'framework/strings'

export const mapTriggerTypeToStringID = (triggerType: ExecutorInfoDTO['triggerType']): StringKeys => {
  switch (triggerType) {
    case 'WEBHOOK':
    case 'WEBHOOK_CUSTOM':
      return 'execution.triggerType.WEBHOOK'
    case 'SCHEDULER_CRON':
      return 'triggers.scheduledLabel'
    case 'ARTIFACT':
      return 'pipeline.artifactTriggerConfigPanel.artifact'
    case 'MANIFEST':
      return 'manifestsText'
    default:
      return 'execution.triggerType.MANUAL'
  }
}
