/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { Card, Container, Icon, Layout, Text, ButtonVariation, PageError } from '@wings-software/uicore'
import { Color } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import ReactTimeago from 'react-timeago'
import { defaultTo } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { Page, useToaster } from '@common/exports'
import { PageSpinner } from '@common/components'
import {
  Permission,
  Role,
  useGetPermissionList,
  useGetRole,
  usePutRole,
  useGetPermissionResourceTypesList
} from 'services/rbac'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import PermissionCard from '@rbac/components/PermissionCard/PermissionCard'
import RbacFactory from '@rbac/factories/RbacFactory'
import { ResourceType, ResourceCategory } from '@rbac/interfaces/ResourceType'
import { getPermissionMap, onPermissionChange } from '@rbac/pages/RoleDetails/utils'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import routes from '@common/RouteDefinitions'
import TagsRenderer from '@common/components/TagsRenderer/TagsRenderer'
import { getRoleIcon } from '@rbac/utils/utils'
import type { PipelineType, RolePathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { usePermission } from '@rbac/hooks/usePermission'
import css from './RoleDetails.module.scss'

const RoleDetails: React.FC = () => {
  const { accountId, projectIdentifier, orgIdentifier, roleIdentifier, module } =
    useParams<PipelineType<ProjectPathProps & RolePathProps>>()
  const [resource, setResource] = useState<ResourceType>()
  const [resourceCategoryMap, setResourceCategoryMap] =
    useState<Map<ResourceType | ResourceCategory, ResourceType[] | undefined>>()
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const [permissions, setPermissions] = useState<string[]>([])
  const [isUpdated, setIsUpdated] = useState<boolean>(false)
  const listRef: Map<ResourceCategory | ResourceType, HTMLDivElement | null> = new Map()
  const { data, loading, error, refetch } = useGetRole({
    identifier: roleIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const [canEdit] = usePermission(
    {
      resource: {
        resourceType: ResourceType.ROLE,
        resourceIdentifier: roleIdentifier
      },
      permissions: [PermissionIdentifier.UPDATE_ROLE]
    },
    [roleIdentifier]
  )

  const { data: resourceGroups, loading: resourceTypeLoading } = useGetPermissionResourceTypesList({
    queryParams: { accountIdentifier: accountId, projectIdentifier, orgIdentifier }
  })

  const { mutate: addPermissions } = usePutRole({
    identifier: roleIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const { data: permissionList, loading: permissionLoading } = useGetPermissionList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })
  useEffect(() => {
    setPermissions(defaultTo(data?.data?.role.permissions, []))
    setIsUpdated(false)
  }, [data?.data])

  useEffect(() => {
    setResourceCategoryMap(RbacFactory.getResourceCategoryList(defaultTo(resourceGroups?.data, []) as ResourceType[]))
  }, [resourceGroups?.data])

  const permissionsMap: Map<ResourceType, Permission[]> = getPermissionMap(permissionList?.data)

  const isPermissionEnabled = (_permission: string): boolean => {
    return permissions.includes(_permission)
  }

  const onChangePermission = (permission: string, isAdd: boolean): void => {
    onPermissionChange(permission, isAdd, permissions, setPermissions)
    setIsUpdated(true)
  }

  const submitChanges = async (role: Role): Promise<void> => {
    role['permissions'] = permissions
    try {
      const updated = await addPermissions(role)
      /* istanbul ignore else */ if (updated) {
        showSuccess(getString('rbac.roleDetails.permissionUpdatedSuccess'))
        refetch()
      }
    } catch (e) {
      /* istanbul ignore next */
      showError(defaultTo(e.data?.message, e.message))
    }
  }

  const role = data?.data?.role
  const disableEdit = data?.data?.harnessManaged || !canEdit

  useDocumentTitle([defaultTo(role?.name, ''), getString('roles')])

  const { getRBACErrorMessage } = useRBACError()

  if (error) {
    return <PageError message={getRBACErrorMessage(error)} onClick={() => refetch()} />
  }
  if (!role) {
    return <></>
  }
  return (
    <>
      {loading && <PageSpinner />}
      <Page.Header
        size="xlarge"
        breadcrumbs={
          <NGBreadcrumbs
            links={[
              {
                url: routes.toRoles({ accountId, orgIdentifier, projectIdentifier, module }),
                label: `${getString('accessControl')}: ${getString('roles')}`
              }
            ]}
          />
        }
        title={
          <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="medium">
            <Icon name={getRoleIcon(role.identifier)} size={40} />
            <Layout.Vertical padding={{ left: 'medium' }} spacing="xsmall" className={css.details}>
              <Text color={Color.BLACK} font="medium">
                {role.name}
              </Text>
              {role.description && <Text lineClamp={2}>{role.description}</Text>}
              {role.tags && (
                <Layout.Horizontal padding={{ top: 'small' }}>
                  <TagsRenderer tags={role.tags} length={6} />
                </Layout.Horizontal>
              )}
            </Layout.Vertical>
          </Layout.Horizontal>
        }
        toolbar={
          <Layout.Horizontal flex>
            {data?.data?.createdAt && (
              <Layout.Vertical
                padding={{ right: 'small' }}
                border={{ right: true, color: Color.GREY_300 }}
                spacing="xsmall"
              >
                <Text>{getString('created')}</Text>
                <ReactTimeago date={data.data.createdAt} />
              </Layout.Vertical>
            )}
            {data?.data?.lastModifiedAt && (
              <Layout.Vertical spacing="xsmall" padding={{ left: 'small' }}>
                <Text>{getString('lastUpdated')}</Text>
                <ReactTimeago date={data.data.lastModifiedAt} />
              </Layout.Vertical>
            )}
          </Layout.Horizontal>
        }
      />
      <Page.Body loading={permissionLoading || resourceTypeLoading}>
        <Layout.Horizontal className={css.body}>
          <Container className={css.resourceList}>
            <Layout.Vertical flex spacing="small">
              {resourceCategoryMap?.keys() &&
                Array.from(resourceCategoryMap.keys()).map(resourceType => {
                  const resourceHandler =
                    RbacFactory.getResourceCategoryHandler(resourceType as ResourceCategory) ||
                    RbacFactory.getResourceTypeHandler(resourceType as ResourceType)
                  return (
                    resourceHandler && (
                      <Card
                        interactive
                        key={resourceType}
                        data-testid={`resourceCard-${resourceType}`}
                        className={css.card}
                        onClick={() => {
                          setResource(resourceType as ResourceType)
                          const elem = listRef.get(resourceType)
                          elem?.scrollIntoView()
                        }}
                      >
                        <Layout.Horizontal flex spacing="small">
                          <Icon name={resourceHandler.icon} size={20} />
                          <Text color={Color.BLACK}>{getString(resourceHandler.label)} </Text>
                        </Layout.Horizontal>
                      </Card>
                    )
                  )
                })}
            </Layout.Vertical>
          </Container>
          <Container padding="large" className={css.permissionListContainer}>
            <Layout.Vertical>
              <Layout.Horizontal flex padding="medium" spacing="medium">
                <Text color={Color.BLACK} font={{ size: 'medium', weight: 'semi-bold' }} padding={{ left: 'medium' }}>
                  {getString('rbac.roleDetails.updateRolePermissions')}
                </Text>
                <Layout.Horizontal flex={{ justifyContent: 'flex-end' }} spacing="small">
                  {isUpdated && (
                    <Layout.Horizontal spacing="xsmall" flex>
                      <Icon name="dot" color={Color.ORANGE_600} size={20} />
                      <Text color={Color.ORANGE_600}>{getString('unsavedChanges')}</Text>
                    </Layout.Horizontal>
                  )}
                  <RbacButton
                    onClick={() => submitChanges(role)}
                    text={getString('applyChanges')}
                    variation={ButtonVariation.PRIMARY}
                    disabled={data?.data?.harnessManaged || !isUpdated}
                    permission={{
                      resource: {
                        resourceType: ResourceType.ROLE,
                        resourceIdentifier: roleIdentifier
                      },
                      permission: PermissionIdentifier.UPDATE_ROLE
                    }}
                  />
                </Layout.Horizontal>
              </Layout.Horizontal>
              {resourceCategoryMap?.keys() &&
                Array.from(resourceCategoryMap.keys()).map(resourceCategory => {
                  return (
                    <div
                      key={resourceCategory}
                      ref={input => {
                        listRef.set(resourceCategory, input)
                      }}
                    >
                      <PermissionCard
                        resourceTypes={resourceCategoryMap.get(resourceCategory)}
                        selected={resourceCategory === resource}
                        permissionMap={permissionsMap}
                        resourceCategory={resourceCategory}
                        disableEdit={disableEdit}
                        onChangePermission={onChangePermission}
                        isPermissionEnabled={isPermissionEnabled}
                      />
                    </div>
                  )
                })}
            </Layout.Vertical>
          </Container>
        </Layout.Horizontal>
      </Page.Body>
    </>
  )
}

export default RoleDetails
