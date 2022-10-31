/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { CellProps, Renderer, Column } from 'react-table'
import { Link, useParams } from 'react-router-dom'
import { Classes, Menu } from '@blueprintjs/core'
import { CardBody, Container, TableV2, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import type { DashboardModel } from 'services/custom-dashboards'
import { DashboardType } from '@dashboards/types/DashboardTypes.types'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import DashboardTags from '@dashboards/components/DashboardTags/DashboardTags'
import { useDashboardsContext } from '@dashboards/pages/DashboardsContext'
import css from '@dashboards/pages/home/HomePage.module.scss'

export interface DashboardListProps {
  dashboards: DashboardModel[]
  cloneDashboard: (dashboard: DashboardModel) => void
  deleteDashboard: (dashboardId: string) => void
  editDashboard: (dashboard: DashboardModel) => void
}

const DashboardList: React.FC<DashboardListProps> = ({
  dashboards,
  cloneDashboard,
  deleteDashboard,
  editDashboard
}): React.ReactElement => {
  const { getString } = useStrings()
  const { accountId, folderId } = useParams<{ accountId: string; folderId: string }>()
  const { editableFolders } = useDashboardsContext()

  const isCloneable = !!editableFolders.length

  const isDashboardEditable = (dashboard: DashboardModel): boolean => {
    return !!editableFolders.some(folder => folder.id === dashboard.folder.id)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type CustomColumn<T extends Record<string, any>> = Column<T>

  const RenderDashboardName: Renderer<CellProps<DashboardModel>> = ({ row }) => {
    const data = row.original

    return (
      <Link
        to={routes.toViewCustomDashboard({
          viewId: data.id,
          accountId: accountId,
          folderId: folderId === 'shared' ? 'shared' : data.resourceIdentifier
        })}
      >
        <Text color={Color.PRIMARY_7} font={{ variation: FontVariation.CARD_TITLE }}>
          {data.title}
        </Text>
      </Link>
    )
  }

  const RenderDashboardTags: Renderer<CellProps<DashboardModel>> = ({ row }) => {
    const data = row.original
    return <DashboardTags dashboard={data} />
  }

  const RenderMenu: Renderer<CellProps<DashboardModel>> = ({ row }) => {
    const data = row.original
    return (
      <CardBody.Menu
        menuContent={
          <Menu>
            {data.type === DashboardType.ACCOUNT && (
              <RbacMenuItem
                icon="edit"
                text={getString('edit')}
                onClick={() => editDashboard(data)}
                disabled={!isDashboardEditable(data)}
              />
            )}
            <RbacMenuItem
              icon="duplicate"
              text={getString('projectCard.clone')}
              onClick={() => cloneDashboard(data)}
              disabled={!isCloneable}
            />
            {data.type === DashboardType.ACCOUNT && (
              <>
                <Menu.Divider />
                <RbacMenuItem
                  icon="trash"
                  text={getString('delete')}
                  onClick={() => deleteDashboard(data.id)}
                  disabled={!isDashboardEditable(data)}
                />
              </>
            )}
          </Menu>
        }
        menuPopoverProps={{
          className: Classes.DARK
        }}
      />
    )
  }

  const columns: CustomColumn<DashboardModel>[] = [
    {
      Header: getString('name'),
      id: 'name',
      accessor: row => row.title,
      width: '40%',
      Cell: RenderDashboardName
    },
    {
      Header: getString('tagsLabel'),
      id: 'tags',
      accessor: row => row.description,
      width: '30%',
      Cell: RenderDashboardTags
    },
    {
      Header: getString('dashboards.dashboardList.headerViewCount'),
      id: 'view_count',
      accessor: row => row.view_count,
      width: '15%'
    },
    {
      Header: '',
      id: 'menu',
      accessor: row => row.id,
      width: '10%',
      Cell: RenderMenu
    }
  ]

  return (
    <Container className={css.masonry}>
      <TableV2<DashboardModel> className={css.table} columns={columns} data={dashboards} />
    </Container>
  )
}

export default DashboardList
