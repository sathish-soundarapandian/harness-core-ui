/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo } from 'lodash-es'
import type { StringKeys } from 'framework/strings/StringsContext'
import type { AuditEventData, NodeExecutionEventData } from 'services/audit'
import { sanitize } from '@common/utils/JSONUtils'

export const getPipelineExecutionEventAdditionalDetails = (
  auditEventData?: AuditEventData
): Record<StringKeys, string | undefined> => {
  const additionalDetailsMap = {} as Record<StringKeys, string | undefined>
  const { accountIdentifier, orgIdentifier, projectIdentifier, pipelineIdentifier, stageIdentifier, stageType } =
    defaultTo(auditEventData, {}) as NodeExecutionEventData

  additionalDetailsMap['pipeline.pipelineExecutionEventData.accountIdentifier'] = accountIdentifier
  additionalDetailsMap['pipeline.pipelineExecutionEventData.orgIdentifier'] = orgIdentifier
  additionalDetailsMap['pipeline.pipelineExecutionEventData.projectIdentifier'] = projectIdentifier
  additionalDetailsMap['pipeline.pipelineExecutionEventData.pipelineIdentifier'] = pipelineIdentifier
  additionalDetailsMap['pipeline.pipelineExecutionEventData.stageIdentifier'] = stageIdentifier
  additionalDetailsMap['pipeline.pipelineExecutionEventData.stageType'] = stageType

  return sanitize(additionalDetailsMap)
}
