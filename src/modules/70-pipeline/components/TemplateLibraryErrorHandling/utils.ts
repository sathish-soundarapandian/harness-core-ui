/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isEmpty } from 'lodash-es'
import type { ErrorNodeSummary } from 'services/template-ng'

export enum TemplateErrorEntity {
  PIPELINE = 'Pipeline',
  TEMPLATE = 'Template'
}

export const getTitleFromErrorNodeSummary = (
  errorNodeSummary: ErrorNodeSummary,
  entity: TemplateErrorEntity
): string => {
  const { nodeInfo, templateResponse } = errorNodeSummary
  if (templateResponse) {
    return `${templateResponse.templateEntityType}: ${templateResponse?.name}: ${templateResponse.identifier} (${templateResponse?.versionLabel})`
  } else {
    return `${entity}: ${nodeInfo?.name}`
  }
}

export const getFirstLeafNode = (errorNodeSummary: ErrorNodeSummary): ErrorNodeSummary => {
  if (!errorNodeSummary.childrenErrorNodes || isEmpty(errorNodeSummary.childrenErrorNodes)) {
    return errorNodeSummary
  } else {
    return getFirstLeafNode(errorNodeSummary.childrenErrorNodes[0])
  }
}
