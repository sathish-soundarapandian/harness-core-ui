/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React, { useRef } from 'react'

import { HarnessReactAPIClient as AuditServiceClient } from '@harnessio/react-audit-service-client'
import { IDPServiceAPIClient } from '@harnessio/react-idp-service-client'
import { PipelineServiceAPIClient } from '@harnessio/react-pipeline-service-client'
import { NGManagerServiceAPIClient } from '@harnessio/react-ng-manager-client'
import { SSCAServiceAPIClient } from '@harnessio/react-ssca-service-client'

import SessionToken from 'framework/utils/SessionToken'

type UseOpenApiClientsReturn = {
  auditServiceClientRef: React.MutableRefObject<AuditServiceClient>
  idpServiceClientRef: React.MutableRefObject<IDPServiceAPIClient>
  pipelineServiceClientRef: React.MutableRefObject<PipelineServiceAPIClient>
  ngManagerServiceClientRef: React.MutableRefObject<NGManagerServiceAPIClient>
  sscaServiceClientRef: React.MutableRefObject<SSCAServiceAPIClient>
}

export const getOpenAPIClientInitiator = (
  globalResponseHandler: (response: Response) => void,
  accountId: string
): any => {
  const responseInterceptor = (response: Response): Response => {
    globalResponseHandler(response.clone())
    return response
  }
  const urlInterceptor = (url: string): string => {
    return window.getApiBaseUrl(url)
  }
  const getRequestHeaders = (): Record<string, string> => {
    return { token: SessionToken.getToken(), 'Harness-Account': accountId }
  }
  return { responseInterceptor, urlInterceptor, getRequestHeaders }
}

const useOpenApiClients = (
  globalResponseHandler: (response: Response) => void,
  accountId: string
): UseOpenApiClientsReturn => {
  const openAPIClientInitiator = getOpenAPIClientInitiator(globalResponseHandler, accountId)
  const auditServiceClientRef = useRef<AuditServiceClient>(new AuditServiceClient(openAPIClientInitiator))
  const idpServiceClientRef = useRef<IDPServiceAPIClient>(new IDPServiceAPIClient(openAPIClientInitiator))
  const pipelineServiceClientRef = useRef<PipelineServiceAPIClient>(
    new PipelineServiceAPIClient(openAPIClientInitiator)
  )
  const sscaServiceClientRef = useRef<SSCAServiceAPIClient>(new SSCAServiceAPIClient(openAPIClientInitiator))
  const ngManagerServiceClientRef = useRef<NGManagerServiceAPIClient>(
    new NGManagerServiceAPIClient(openAPIClientInitiator)
  )

  return {
    auditServiceClientRef,
    idpServiceClientRef,
    pipelineServiceClientRef,
    ngManagerServiceClientRef,
    sscaServiceClientRef
  }
}

export default useOpenApiClients
