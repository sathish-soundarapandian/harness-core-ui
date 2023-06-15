/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormData } from '@connectors/interfaces/ConnectorInterface'
import type { ConnectorConfigDTO } from 'services/cd-ng'

type InitializeSplunkConnectorArgs = {
  prevStepData?: ConnectorConfigDTO
  accountId: string
  projectIdentifier?: string
  orgIdentifier?: string
}

export function initializeSplunkConnector({
  prevStepData,
  projectIdentifier,
  accountId,
  orgIdentifier
}: InitializeSplunkConnectorArgs): FormData {
  const defaultObj = {
    url: '',
    username: '',
    passwordRef: undefined,
    accountId: accountId,
    projectIdentifier,
    orgIdentifier
  }

  if (!prevStepData) {
    return defaultObj
  }

  const { spec, ...prevData } = prevStepData
  return {
    ...defaultObj,
    url: prevData?.url || spec?.splunkUrl || '',
    username: prevData?.username || spec?.username,
    passwordRef: prevData?.passwordRef || spec?.passwordRef
  }
}
