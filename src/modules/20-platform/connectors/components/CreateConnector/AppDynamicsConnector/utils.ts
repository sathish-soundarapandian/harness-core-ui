/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormData } from '@connectors/interfaces/ConnectorInterface'
import { AppDynamicsAuthType } from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { ConnectorConfigDTO } from 'services/cd-ng'

type InitializeAppDConnectorArgs = {
  prevStepData?: ConnectorConfigDTO
  accountId: string
  projectIdentifier?: string
  orgIdentifier?: string
}

export function initializeAppDConnector({
  prevStepData,
  accountId,
  projectIdentifier,
  orgIdentifier
}: InitializeAppDConnectorArgs): FormData {
  const defaultObj = {
    url: '',
    accountName: '',
    accountId,
    username: '',
    authType: AppDynamicsAuthType.USERNAME_PASSWORD,
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
    url: prevData?.url || spec?.controllerUrl || '',
    accountName: prevData?.accountName || spec?.accountname || '',
    password: prevData?.password || spec?.passwordRef,
    clientSecretRef: prevData?.clientSecretRef || spec?.clientSecretRef,
    authType: prevData?.authType || spec?.authType || AppDynamicsAuthType.USERNAME_PASSWORD,
    username: prevData?.username || spec?.username || '',
    clientId: prevData?.clientId || spec?.clientId
  }
}
