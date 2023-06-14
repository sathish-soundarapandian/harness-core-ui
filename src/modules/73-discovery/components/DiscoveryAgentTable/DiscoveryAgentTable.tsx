/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Classes, Menu, MenuDivider, MenuItem, Position } from '@blueprintjs/core'
import { Avatar, Button, ButtonVariation, Layout, Popover, TableV2, Text } from '@harness/uicore'
import React from 'react'
import { Color } from '@harness/design-system'
import type { CellProps, Renderer } from 'react-table'
import moment from 'moment'
import { Link, useParams } from 'react-router-dom'
import { killEvent } from '@common/utils/eventUtils'
import { getTimeAgo } from '@pipeline/utils/CIUtils'
import type { ApiGetInfraResponse } from 'services/servicediscovery'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { PaginationPropsWithDefaults } from '@common/hooks/useDefaultPaginationProps'
import css from './DiscoveryAgentTable.module.scss'

interface DiscoveryAgentTableProps {
  list: ApiGetInfraResponse[]
  pagination: PaginationPropsWithDefaults
}

const Name: Renderer<CellProps<ApiGetInfraResponse>> = ({ row }) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  return (
    <>
      <Link
        to={routes.toDiscoveryDetails({
          accountId,
          orgIdentifier,
          projectIdentifier,
          dAgentId: row.original.id
        })}
      >
        <Text
          font={{ size: 'normal', weight: 'bold' }}
          margin={{ left: 'medium' }}
          color={Color.PRIMARY_7}
          style={{ cursor: 'pointer' }}
        >
          {row.original.name}
        </Text>
      </Link>
      <Layout.Horizontal
        flex={{ alignItems: 'center', justifyContent: 'start' }}
        margin={{ top: 'xsmall', left: 'medium' }}
      >
        <Text font={{ size: 'small', weight: 'light' }} color={Color.GREY_500}>
          ID:
        </Text>
        <Text
          font={{ size: 'small', weight: 'light' }}
          className={css.idPill}
          style={{ background: '#F3F3FA', borderRadius: '5px' }}
          color={Color.GREY_500}
        >
          {row?.original?.id?.slice(0, 8)}...
        </Text>
        {/* {<CopyButton stringToCopy={row.original.id ?? ''} />} */}
      </Layout.Horizontal>
    </>
  )
}

const NetworkCount: Renderer<CellProps<ApiGetInfraResponse>> = () => (
  <Layout.Vertical width={60} height={50} className={css.totalServiceContainer}>
    <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.GREY_500}>
      10
    </Text>
  </Layout.Vertical>
)

const ServiceCount: Renderer<CellProps<ApiGetInfraResponse>> = () => (
  <Layout.Vertical width={60} height={50} className={css.totalServiceContainer}>
    <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.GREY_500}>
      10
    </Text>
  </Layout.Vertical>
)

const LastServiceDiscovery: Renderer<CellProps<ApiGetInfraResponse>> = ({ row }) => {
  const date = moment(row.original.createdAt).format('MMM DD, YYYY hh:mm A')
  return (
    <Layout.Horizontal flex={{ align: 'center-center', justifyContent: 'flex-start' }}>
      <Layout.Vertical spacing={'xsmall'}>
        <Text font={{ size: 'small' }} lineClamp={1}>
          {date}
        </Text>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

const LastModified: Renderer<CellProps<ApiGetInfraResponse>> = ({ row }) => (
  <Layout.Horizontal flex={{ align: 'center-center', justifyContent: 'flex-start' }}>
    <Avatar hoverCard={false} name={'Amit Das'} size="normal" />
    <Layout.Vertical spacing={'xsmall'}>
      <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_900} lineClamp={1}>
        Amit Das
      </Text>
      <Text font={{ size: 'xsmall' }} color={Color.GREY_500} lineClamp={1}>
        {getTimeAgo(new Date(row?.original?.createdAt ?? 0).getTime())}
      </Text>
    </Layout.Vertical>
  </Layout.Horizontal>
)

const ThreeDotMenu: Renderer<CellProps<ApiGetInfraResponse>> = () => (
  <Layout.Horizontal style={{ justifyContent: 'flex-end', marginRight: '10px' }} onClick={killEvent}>
    <Popover className={Classes.DARK} position={Position.LEFT}>
      <Button variation={ButtonVariation.ICON} icon="Options" />
      <Menu style={{ backgroundColor: 'unset' }}>
        <MenuItem icon="repeat" text={'Refresh'} onClick={() => void 0} className={css.menuItem} />
        <MenuDivider />
        <MenuItem icon="edit" text={'Edit'} onClick={() => void 0} className={css.menuItem} />
        <MenuDivider />
        <MenuItem icon="delete" text={'Delete'} className={css.deleteMenuItem} onClick={() => void 0} />
      </Menu>
    </Popover>
  </Layout.Horizontal>
)

const DiscoveryAgentTable: React.FC<DiscoveryAgentTableProps> = ({ list, pagination }) => {
  return (
    <TableV2<ApiGetInfraResponse>
      className={css.tableBody}
      sortable={true}
      columns={[
        {
          Header: 'Discovery Agent',
          id: 'toggleButton',
          width: '25%',
          Cell: Name
        },
        {
          Header: 'Network Maps',
          width: '20%',
          Cell: NetworkCount
        },
        {
          Header: 'Services Discovered',
          width: '20%',
          Cell: ServiceCount
        },
        {
          Header: 'Last Service Discovery',
          width: '30%',
          Cell: LastServiceDiscovery
        },
        {
          Header: 'Last Updated',
          width: '20%',
          Cell: LastModified
        },
        {
          id: 'threeDotMenu',
          Cell: ThreeDotMenu
        }
      ]}
      data={list}
      pagination={pagination}
    />
  )
}

export default DiscoveryAgentTable
