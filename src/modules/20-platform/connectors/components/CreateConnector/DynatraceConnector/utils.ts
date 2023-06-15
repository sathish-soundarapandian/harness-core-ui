/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormData } from '@connectors/interfaces/ConnectorInterface'
import type { ConnectorConfigDTO } from 'services/cd-ng'

type InitializeDynatraceConnectorArgs = {
  prevStepData?: ConnectorConfigDTO
  accountId: string
  projectIdentifier?: string
  orgIdentifier?: string
}

export function initializeDynatraceConnectorWithStepData({
  prevStepData,
  accountId,
  projectIdentifier,
  orgIdentifier
}: InitializeDynatraceConnectorArgs): FormData {
  const defaultObj = {
    url: undefined,
    accountId,
    projectIdentifier,
    orgIdentifier
  }

  if (!prevStepData) {
    return defaultObj
  }

  const { spec, ...prevData } = prevStepData
  const updatedInitialValues = {
    ...defaultObj,
    ...spec,
    ...prevData
  }

  return updatedInitialValues
}
