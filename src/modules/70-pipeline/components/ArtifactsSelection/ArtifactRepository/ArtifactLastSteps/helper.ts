/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

interface RequestOptions {
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
  connectorRef: string
  repository: string
}

interface ResponseRequestOptions {
  queryParams: {
    accountIdentifier: string
    orgIdentifier: string
    projectIdentifier: string
    connectorRef: string
    repository: string
  }
  requestOptions: {
    headers?: any
  }
  lazy: boolean
  debounce: number
}

export const getRequestOptions = ({
  accountId,
  orgIdentifier,
  projectIdentifier,
  connectorRef,
  repository
}: RequestOptions): ResponseRequestOptions => {
  return {
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    },
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      connectorRef,
      repository: repository
    },
    lazy: true,
    debounce: 300
  }
}
