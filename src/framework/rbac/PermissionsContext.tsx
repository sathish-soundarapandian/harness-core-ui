/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { createContext, useContext, useState, useCallback } from 'react'
import { isEqual, get, omit } from 'lodash-es'
import debounce from 'p-debounce'
import produce from 'immer'

import { useGetAccessControlList, PermissionCheck, AccessControl } from 'services/rbac'

type Permissions = Map<string, boolean>

export interface PermissionRequestOptions {
  skipCache?: boolean
  skipCondition?: (permissionRequest: PermissionCheck) => boolean
}

export interface PermissionsContextProps {
  permissions: Permissions
  requestPermission: (permissionRequest?: PermissionCheck, options?: PermissionRequestOptions) => void
  checkPermission: (permissionRequest: PermissionCheck) => boolean
  cancelRequest: (permissionRequest: PermissionCheck) => void
}

export const PermissionsContext = createContext<PermissionsContextProps>({
  permissions: new Map<string, boolean>(),
  requestPermission: () => void 0,
  checkPermission: () => false,
  cancelRequest: () => void 0
})

export function usePermissionsContext(): PermissionsContextProps {
  return useContext(PermissionsContext)
}

interface PermissionsProviderProps {
  debounceWait?: number
}

export const keysToCompare = [
  'resourceScope.accountIdentifier',
  'resourceScope.orgIdentifier',
  'resourceScope.projectIdentifier',
  'resourceType',
  'resourceIdentifier',
  'permission'
]

export const getStringKeyFromObjectValues = (
  permissionRequest: PermissionCheck,
  keys: string[],
  glue = '/'
): string => {
  const { resourceAttributes = {} } = permissionRequest // To accomodate ABAC filters
  const [attributeFilterName] = Object.keys(resourceAttributes)
  const attributeFilterVal = resourceAttributes[attributeFilterName]

  // pick specific keys, get their values, and join with a `/`
  return keys
    .map(key => get(permissionRequest, key))
    .concat(attributeFilterName)
    .concat(attributeFilterVal)
    .filter(value => value)
    .join(glue)
}

let pendingRequests: PermissionCheck[] = []

export function PermissionsProvider(props: React.PropsWithChildren<PermissionsProviderProps>): React.ReactElement {
  const { debounceWait = 50 } = props
  const [permissions, setPermissions] = useState<Permissions>(new Map<string, boolean>())

  const { mutate: getPermissions } = useGetAccessControlList({})
  const debouncedGetPermissions = useCallback(debounce(getPermissions, debounceWait), [getPermissions, debounceWait])

  // this function is called from `usePermission` hook for every resource user is interested in
  // collect all requests until `debounceWait` is triggered
  async function requestPermission(
    permissionRequest?: PermissionCheck,
    options?: PermissionRequestOptions
  ): Promise<void> {
    if (!permissionRequest) return

    const { skipCache = false, skipCondition } = options || {}

    // exit early if we already fetched this permission before
    // disabling this will disable caching, because it will make a fresh request and update in the store
    if (!skipCache && permissions.has(getStringKeyFromObjectValues(permissionRequest, keysToCompare))) {
      return
    }

    // exit early if user has defined a skipCondition and if it returns true
    if (skipCondition && skipCondition(permissionRequest) === true) {
      return
    }

    // check if this request is already queued
    if (!pendingRequests.find(req => isEqual(req, permissionRequest))) {
      pendingRequests.push(permissionRequest)
    }

    try {
      // try to fetch the permissions after waiting for `debounceWait` ms
      const res = await debouncedGetPermissions({
        permissions: pendingRequests
      })

      // clear pending requests after API call
      pendingRequests = []

      // `p-debounce` package ensure all debounced promises are resolved at this stage
      setPermissions(oldPermissions => {
        return produce(oldPermissions, draft => {
          // find the current request in aggregated response
          const hasAccess = res?.data?.accessControlList?.find((perm: AccessControl) =>
            isEqual(omit(perm, 'permitted'), permissionRequest)
          )?.permitted

          // update current request in the map, only if response matches request
          if (typeof hasAccess === 'boolean') {
            draft.set(getStringKeyFromObjectValues(permissionRequest, keysToCompare), hasAccess)
          }
          // if hasAccess is undefined, it means :
          // 1. either we had a race condition, and the response is for a previous request.
          //    in that case, dont overwrite the old data
          // 2. or the request was invalid (permission doesn't exist).
          //    in that case, assume default as false
        })
      })
    } catch (err) {
      // clear pending requests even if api fails
      pendingRequests = []
      if (process.env.NODE_ENV === 'test') throw err
    }
  }

  function checkPermission(permissionRequest: PermissionCheck): boolean {
    const permission = permissions.get(getStringKeyFromObjectValues(permissionRequest, keysToCompare))
    // only use map value if it's defined. absence of data doesn't mean permission denied.
    if (typeof permission === 'boolean') return permission
    else return true
  }

  function cancelRequest(permissionRequest: PermissionCheck): void {
    // remove any matching requests
    pendingRequests = pendingRequests.filter(req => !isEqual(req, permissionRequest))
  }

  return (
    <PermissionsContext.Provider value={{ permissions, requestPermission, checkPermission, cancelRequest }}>
      {props.children}
    </PermissionsContext.Provider>
  )
}
