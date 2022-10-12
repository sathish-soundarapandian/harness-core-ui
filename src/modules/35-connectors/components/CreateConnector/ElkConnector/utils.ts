/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { ElkAuthType } from '@connectors/constants'
import type { FormData } from '@connectors/interfaces/ConnectorInterface'
import type { ConnectorConfigDTO } from 'services/cd-ng'

type InitializeElkConnectorArgs = {
  prevStepData?: ConnectorConfigDTO
  accountId: string
  projectIdentifier?: string
  orgIdentifier?: string
}

export function initializeElkConnector({
  prevStepData,
  accountId,
  projectIdentifier,
  orgIdentifier
}: InitializeElkConnectorArgs): FormData {
  const defaultObj = {
    url: '',
    accountId,
    username: '',
    authType: ElkAuthType.USERNAME_PASSWORD,
    password: undefined,
    projectIdentifier,
    orgIdentifier
  }

  if (!prevStepData) {
    return defaultObj
  }
  const { spec, ...prevData } = prevStepData
  return {
    ...defaultObj,
    url: prevData?.url || spec?.controllerUrl || spec?.url || '',
    password: prevData?.password || spec?.passwordRef,
    clientSecretRef: prevData?.clientSecretRef || spec?.clientSecretRef,
    authType: prevData?.authType || spec?.authType || ElkAuthType.USERNAME_PASSWORD,
    username: prevData?.username || spec?.username || '',
    clientId: prevData?.clientId || spec?.clientId,
    apiKeyId: prevData?.apiKeyId || spec?.apiKeyId,
    apiKeyRef: prevData?.apiKeyRef || spec?.apiKeyRef
  }
}
