/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ExecutorInfoDTO } from 'services/pipeline-ng'
import type { StringKeys, UseStringsReturn } from 'framework/strings'
import { getReadableDateTime } from '@common/utils/dateUtils'
import type { TriggerTypeIconAndExecutionText } from './types'

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

export const mapTriggerTypeToIconAndExecutionText = (
  triggerType: ExecutorInfoDTO['triggerType'],
  getString: UseStringsReturn['getString']
): TriggerTypeIconAndExecutionText | undefined => {
  switch (triggerType) {
    case 'SCHEDULER_CRON': {
      return {
        iconName: 'stopwatch',
        getText: (startTs?: number, triggeredBy?: string) =>
          getString('pipeline.triggeredByCron', { start: getReadableDateTime(startTs), triggeredBy })
      }
    }
    case 'WEBHOOK': {
      return {
        iconName: 'trigger-execution',
        getText: () => getString('pipeline.triggeredBy', { triggerType: getString('execution.triggerType.WEBHOOK') })
      }
    }
    case 'ARTIFACT': {
      return {
        iconName: 'trigger-artifact',
        getText: () =>
          getString('pipeline.triggeredBy', { triggerType: getString('pipeline.artifactTriggerConfigPanel.artifact') })
      }
    }
    case 'MANIFEST': {
      return {
        iconName: 'service-helm',
        getText: () => getString('pipeline.triggeredBy', { triggerType: getString('manifestsText') })
      }
    }
    case 'WEBHOOK_CUSTOM': {
      return {
        iconName: 'trigger-execution',
        getText: () => getString('pipeline.triggeredByThirdParty')
      }
    }
    case 'MANUAL': {
      return {
        iconName: 'person',
        getText: () => getString('pipeline.manuallyTriggered')
      }
    }
  }
}
