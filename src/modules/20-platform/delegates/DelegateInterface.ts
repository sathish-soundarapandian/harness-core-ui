/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export interface DelegateInfoDTO {
  name: string
  identifier: string
  description?: string
  orgIdentifier?: string
  projectIdentifier?: string
  tags?: {
    [key: string]: string
  }
  type: 'K8sCluster'
}

export interface DelegateConfigDTO {
  [key: string]: any
}

export interface DelegateProfile {
  uuid: string
  accountId?: string
  name?: string
  description?: string
  primary?: boolean
  approvalRequired?: boolean
  startupScript?: string
  selectors?: string[]
  lastUpdatedAt?: number
  scopingRules?: string[]
}
