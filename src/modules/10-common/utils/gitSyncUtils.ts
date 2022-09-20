/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo, isEmpty } from 'lodash-es'
import type { GitSyncConfig } from 'services/cd-ng'
import type { StoreMetadata } from '@common/constants/GitSyncTypes'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { folderPathName, yamlFileExtension } from './StringUtils'

export const getRepoDetailsByIndentifier = (identifier: string | undefined, repos: GitSyncConfig[]) => {
  return repos.find((repo: GitSyncConfig) => repo.identifier === identifier)
}

export const validateFilePath = (filePath: string): boolean => {
  if (!filePath.endsWith(yamlFileExtension)) {
    return false
  } else {
    const fullPath = filePath.slice(0, filePath.length - yamlFileExtension.length)
    const subPaths = fullPath.split('/')
    return subPaths.every((folderName: string) => {
      return folderName.length && folderName.match(folderPathName)?.length
    })
  }
}

interface ParentEntityQueryParams {
  parentEntityConnectorRef?: string
  parentEntityRepoName?: string
  branch?: string
  parentEntityAccountIdentifier?: string
  parentEntityOrgIdentifier?: string
  parentEntityProjectIdentifier?: string
}

export const createParentEntityQueryParams = (
  storeMetadata: StoreMetadata | undefined,
  params: ProjectPathProps,
  optionalBranch?: string
): ParentEntityQueryParams => {
  const parentEntityIds = {
    parentEntityAccountIdentifier: params.accountId,
    parentEntityOrgIdentifier: params.orgIdentifier,
    parentEntityProjectIdentifier: params.projectIdentifier
  }

  return {
    parentEntityConnectorRef: storeMetadata?.connectorRef,
    parentEntityRepoName: storeMetadata?.repoName,
    branch: defaultTo(storeMetadata?.branch, optionalBranch),
    ...(!isEmpty(storeMetadata?.connectorRef) ? parentEntityIds : {})
  }
}
