/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams, Link } from 'react-router-dom'

import { Layout, Text, Icon } from '@harness/uicore'
import type { CellProps, Renderer } from 'react-table'
import { Color } from '@harness/design-system'
import type { RbacResourceRendererProps } from '@rbac/factories/RbacFactory'
import { PageSpinner } from '@common/components'
import routes from '@common/RouteDefinitions'
import { FolderModel, useGetFoldersWithHidden } from 'services/custom-dashboards'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'

import StaticResourceRenderer from '../StaticResourceRenderer/StaticResourceRenderer'

import css from '../DashboardResourceModalBody/DashboardResourceModalBody.module.scss'

interface FolderModelWithIdentifier extends FolderModel {
  identifier: string
}

export const RenderColumnSecret: Renderer<CellProps<FolderModelWithIdentifier>> = ({ row }) => {
  const data = row.original
  const { accountId } = useParams<{ accountId: string }>()

  return (
    <Layout.Vertical padding={{ left: 'small', top: 'medium' }}>
      <Text color={Color.BLACK} lineClamp={1}>
        {data.name} ({data.Children?.length}){'  '}
        <Link
          target="_blank"
          to={routes.toCustomDashboardHome({
            folderId: data.identifier,
            accountId: accountId
          })}
        >
          <Icon name="main-share" color={Color.GREY_600} />
        </Link>
      </Text>
      <Layout.Horizontal spacing="medium">
        {data.Children?.slice(0, 3).map((dashboards: { id: string; name: string }) => {
          return (
            <Layout.Horizontal className={css.dashboardDetail} key={dashboards?.name + '_' + dashboards?.id}>
              {dashboards.name}{' '}
              <Link
                target="_blank"
                to={routes.toViewCustomDashboard({
                  viewId: dashboards.id,
                  accountId: accountId,
                  folderId: data.identifier
                })}
              >
                <Icon name="main-share" color={Color.GREY_600} />
              </Link>
            </Layout.Horizontal>
          )
        })}
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

const DashboardResourceRenderer: React.FC<RbacResourceRendererProps> = ({
  identifiers,
  // resourceScope,
  resourceType,
  onResourceSelectionChange
}) => {
  const { accountId } = useParams<AccountPathProps>()

  const { data: foldersListResponse, loading: fethingFolders } = useGetFoldersWithHidden({
    queryParams: { accountId: accountId, page: 1, pageSize: 1000 }
  })

  const parsedFolders =
    foldersListResponse?.resource
      ?.map((folder: FolderModel) => ({
        identifier: folder['id'],
        ...folder
      }))
      .filter((v: FolderModelWithIdentifier) => {
        if (identifiers.indexOf(v.identifier) !== -1) {
          return v
        }
      }) || []

  return !fethingFolders ? (
    <div className={css.container}>
      <StaticResourceRenderer
        data={parsedFolders}
        resourceType={resourceType}
        onResourceSelectionChange={onResourceSelectionChange}
        columns={[
          {
            id: 'name',
            accessor: 'name',
            width: '95%',
            Cell: RenderColumnSecret,
            disableSortBy: true
          }
        ]}
      />
    </div>
  ) : (
    <PageSpinner />
  )
}

export default DashboardResourceRenderer
