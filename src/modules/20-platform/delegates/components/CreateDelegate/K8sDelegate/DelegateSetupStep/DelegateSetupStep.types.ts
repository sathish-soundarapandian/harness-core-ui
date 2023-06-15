/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { StringsMap } from 'stringTypes'

export enum DelegateType {
  HELM_CHART = 'HELM_DELEGATE',
  KUBERNETES = 'KUBERNETES'
}

export interface DelegateInstallerDetails {
  text: keyof StringsMap
  value: string
  icon: string
}

export enum k8sPermissionType {
  CLUSTER_ADMIN = 'CLUSTER_ADMIN',
  CLUSTER_VIEWER = 'CLUSTER_VIEWER',
  NAMESPACE_ADMIN = 'NAMESPACE_ADMIN'
}
