/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { identity, pick, pickBy } from 'lodash-es'

import { useParams } from 'react-router-dom'
import { useDeepCompareEffect } from '@common/hooks'
import { usePermissionsContext, PermissionRequestOptions } from 'framework/rbac/PermissionsContext'
import type { PermissionCheck, ResourceScope } from 'services/rbac'
import type { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { ResourceType } from '@rbac/interfaces/ResourceType'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetCommunity } from '@common/utils/utils'
import type { AttributeFilter } from 'services/resourcegroups'

export interface Resource {
  resourceType: ResourceType
  resourceIdentifier?: string
}

export interface PermissionRequest {
  resourceScope?: ResourceScope
  resource: Resource
  permission: PermissionIdentifier
  attributeFilter?: Required<AttributeFilter>
}

export interface PermissionsRequest {
  resourceScope?: ResourceScope
  resource: Resource
  permissions: PermissionIdentifier[]
  options?: PermissionRequestOptions
  attributeFilter?: AttributeFilter
}

export function getDTOFromRequest(permissionRequest: PermissionRequest, defaultScope: ResourceScope): PermissionCheck {
  const { resource, resourceScope, permission, attributeFilter } = permissionRequest
  const { attributeName, attributeValues } = attributeFilter || {}
  const [attributeValue] = Array.isArray(attributeValues) ? attributeValues : []
  return {
    // pickBy(obj, identity) removes keys with undefined values
    resourceScope: pickBy(resourceScope || defaultScope, identity),
    ...pickBy(resource, identity),
    ...(attributeName &&
      attributeValue && {
        resourceAttributes: {
          [attributeName]: attributeValue
        }
      }),
    permission
  }
}

export function usePermission(permissionsRequest?: PermissionsRequest, deps: Array<any> = []): Array<boolean> {
  const { requestPermission, checkPermission, cancelRequest } = usePermissionsContext()
  const { accountId: accountIdentifier, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const defaultScope = { accountIdentifier, orgIdentifier, projectIdentifier }
  const isCommunity = useGetCommunity()
  const attributeFilterKey = permissionsRequest?.attributeFilter?.attributeName || ''
  // We wish to run map consume over filter values at least ones to handle no filter scenario
  const attributeFilterValues = permissionsRequest?.attributeFilter?.attributeValues || ['']

  useDeepCompareEffect(() => {
    // generate PermissionRequest for every action user requested
    permissionsRequest &&
      !isCommunity &&
      permissionsRequest.permissions.forEach(permission => {
        attributeFilterValues.forEach(attrFilterVal => {
          const permissionCheckDto = getDTOFromRequest(
            {
              permission,
              attributeFilter: {
                attributeName: attributeFilterKey,
                attributeValues: [attrFilterVal]
              },
              ...pick(permissionsRequest, ['resourceScope', 'resource'])
            } as PermissionRequest,
            defaultScope
          )
          // register request in the context
          requestPermission(permissionCheckDto, permissionsRequest?.options)
        })
      })

    return () => {
      // cancel above request when this hook instance is unmounting
      permissionsRequest &&
        !isCommunity &&
        permissionsRequest.permissions.forEach(permission => {
          const permissionCheckDto = getDTOFromRequest(
            {
              permission,
              ...pick(permissionsRequest, ['resourceScope', 'resource'])
            } as PermissionRequest,
            defaultScope
          )
          cancelRequest(permissionCheckDto)
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [permissionsRequest?.options, ...deps])

  // hook should return boolean for every action requested, in same order
  if (permissionsRequest !== undefined) {
    return permissionsRequest.permissions.map(permission => {
      if (isCommunity) {
        return true
      }

      // Following condition watches for when either attributes passed down for ABAC are none or just one
      if (attributeFilterValues.length === 1) {
        const permissionCheckDto = getDTOFromRequest(
          {
            permission,
            attributeFilter: {
              attributeName: attributeFilterKey,
              attributeValues: attributeFilterValues
            },
            ...pick(permissionsRequest, ['resourceScope', 'resource'])
          } as PermissionRequest,
          defaultScope
        )
        return checkPermission(permissionCheckDto)
      } else {
        // attributeFilterValues would always be an array with either one or more values, this block covers latter scenario
        return attributeFilterValues
          .map(attrFilterval => {
            const permissionCheckDto = getDTOFromRequest(
              {
                permission,
                attributeFilter: {
                  attributeName: attributeFilterKey,
                  attributeValues: [attrFilterval]
                },
                ...pick(permissionsRequest, ['resourceScope', 'resource'])
              } as PermissionRequest,
              defaultScope
            )
            return checkPermission(permissionCheckDto)
          })
          .some(permissionResult => permissionResult) // If permission is true for even a single attribute, it is overall true
      }
    })
  }
  // hook will return true if there are no parameters passed to it.
  return [true]
}
