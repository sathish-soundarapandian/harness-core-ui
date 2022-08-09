/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import { Scope } from '@common/interfaces/SecretsInterface'
import { getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import type { ReleaseRepoManifest } from 'services/cd-ng'
import { GitRepoName, ManifestStoreMap } from '../../Manifesthelper'

const getRepoNameBasedOnScopeReleaseRepo = (initialValues: ReleaseRepoManifest, prevStepData: any): string => {
  const connectorScope = getScopeFromValue(initialValues?.connectorRef)
  switch (connectorScope) {
    case Scope.ACCOUNT:
      return initialValues?.connectorRef === `account.${prevStepData.connectorRef.connector.identifier}`
        ? initialValues?.repoName
        : ''

    case Scope.PROJECT:
      return prevStepData?.connectorRef?.connector?.identifier === initialValues?.connectorRef
        ? initialValues?.repoName
        : ''

    case Scope.ORG:
      return `${prevStepData.connectorRef.scope}.${prevStepData.connectorRef.connector.identifier}` ===
        initialValues?.connectorRef
        ? initialValues?.repoName
        : ''

    default:
      return ''
  }
}

export const getRepositoryNameReleaseRepo = (prevStepData: any, initialValues: ReleaseRepoManifest): string => {
  const gitConnectionType: string = prevStepData?.store === ManifestStoreMap.Git ? 'connectionType' : 'type'
  const connectionType =
    prevStepData?.connectorRef?.connector?.spec?.[gitConnectionType] === GitRepoName.Repo ||
    prevStepData?.urlType === GitRepoName.Repo
      ? GitRepoName.Repo
      : GitRepoName.Account

  if (getMultiTypeFromValue(prevStepData?.connectorRef) !== MultiTypeInputType.FIXED) {
    return prevStepData.connectorRef
  } else {
    if (connectionType === GitRepoName.Repo) {
      return prevStepData.connectorRef?.connector?.spec.url
    }
    return getRepoNameBasedOnScopeReleaseRepo(initialValues, prevStepData)
  }
}
