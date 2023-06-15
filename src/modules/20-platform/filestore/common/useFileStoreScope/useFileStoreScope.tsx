/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { useParams } from 'react-router-dom'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getParamsByScope, getParamsByScopeAndPath } from '@filestore/utils/FileStoreUtils'

interface useFileStoreScopeProps {
  scope: string
  isModalView: boolean
  scopeValue: string
  pathValue: string
}

export interface ScopedObjectDTO {
  accountIdentifier: string
  orgIdentifier?: string
  projectIdentifier?: string
  path?: string
}

export const useFileStoreScope = ({
  scope,
  pathValue = '',
  scopeValue = ''
}: useFileStoreScopeProps): ScopedObjectDTO => {
  const params = useParams<ProjectPathProps & ModulePathParams>()
  const { accountId, orgIdentifier, projectIdentifier } = params
  if (pathValue && scope === scopeValue) {
    return getParamsByScopeAndPath(scopeValue, pathValue, { accountId, orgIdentifier, projectIdentifier })
  }

  return getParamsByScope(scope, { accountId, orgIdentifier, projectIdentifier })
}
