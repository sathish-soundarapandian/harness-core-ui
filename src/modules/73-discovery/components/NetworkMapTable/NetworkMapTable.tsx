/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Classes, Menu, MenuItem, Position } from '@blueprintjs/core'
import { Avatar, Button, ButtonVariation, Icon, Layout, Popover, TableV2, Text } from '@harness/uicore'
import React from 'react'
import { Color } from '@harness/design-system'
import type { CellProps, Renderer, Row, UseExpandedRowProps } from 'react-table'
import { killEvent } from '@common/utils/eventUtils'
import { getTimeAgo } from '@pipeline/utils/CIUtils'
import { dummydata } from './data'
import NetworkMapServicesTable, { NetworkMapServicesTableProps } from './NetworkMapServicesTable'
import css from './NetworkMapTable.module.scss'

export interface NetworkMapListDTO {
  name: string
  id: number
  clusterName: string
  connectorName: string
  totalService: number
  enabled: boolean
  lastUpdatedAt: number
  lastUpdatedBy: string
  connected: boolean
  services: NetworkMapServicesTableProps
}

export interface ServiceDetails {
  name: string
  namespace: string
  resources: {
    pods?: number
    workloads?: number
    connections?: number
  }
  ipAddress: string
  portNumber: number
}

const Name: Renderer<CellProps<NetworkMapListDTO>> = ({ row }) => (
  <Text font={{ size: 'normal', weight: 'semi-bold' }} color={Color.PRIMARY_7}>
    {row.original.name}
  </Text>
)

const Connector: Renderer<CellProps<NetworkMapListDTO>> = ({ row }) => (
  <Layout.Horizontal spacing="small" flex={{ justifyContent: 'flex-start', alignItems: 'center' }}>
    <Icon name="app-kubernetes" size={24} margin={{ right: 'small' }} />
    <Layout.Vertical spacing="xsmall">
      <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.BLACK}>
        {row.original.clusterName}
      </Text>
      <Text font={{ size: 'small' }} color={Color.PRIMARY_7}>
        {row.original.connectorName}
      </Text>
    </Layout.Vertical>
  </Layout.Horizontal>
)
const ServiceCount: Renderer<CellProps<NetworkMapListDTO>> = ({ row }) => (
  <Layout.Vertical width={60} height={50} className={css.totalServiceContainer}>
    <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.GREY_500}>
      {row.original.totalService}
    </Text>
  </Layout.Vertical>
)
const LastModified: Renderer<CellProps<NetworkMapListDTO>> = ({ row }) => (
  <Layout.Horizontal flex={{ align: 'center-center', justifyContent: 'flex-start' }}>
    <Avatar hoverCard={false} name={row.original.lastUpdatedBy} size="normal" />
    <Layout.Vertical spacing={'xsmall'}>
      <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_900} lineClamp={1}>
        {row.original.lastUpdatedBy}
      </Text>
      <Text font={{ size: 'xsmall' }} color={Color.GREY_500} lineClamp={1}>
        {getTimeAgo(row.original.lastUpdatedAt)}
      </Text>
    </Layout.Vertical>
  </Layout.Horizontal>
)

const ThreeDotMenu: Renderer<CellProps<NetworkMapListDTO>> = () => (
  <Layout.Horizontal style={{ justifyContent: 'flex-end' }} onClick={killEvent}>
    <Popover className={Classes.DARK} position={Position.LEFT}>
      <Button variation={ButtonVariation.ICON} icon="Options" />
      <Menu style={{ backgroundColor: 'unset' }}>
        <MenuItem text={'Menu 1'} onClick={() => void 0} className={css.menuItem} />
        <MenuItem text={'Menu 2'} className={css.menuItem} onClick={() => void 0} />
      </Menu>
    </Popover>
  </Layout.Horizontal>
)

const NetworkMapTable: React.FC = () => {
  return (
    <TableV2<NetworkMapListDTO>
      className={css.tableBody}
      sortable={true}
      renderRowSubComponent={({ row: { original: data } }: { row: Row<NetworkMapListDTO> }) => (
        <NetworkMapServicesTable {...data.services} />
      )}
      columns={[
        {
          Header: ' ',
          id: 'toggleButton',
          width: '5%',
          Cell: ({ row }: { row: UseExpandedRowProps<any> }) => (
            <Layout.Horizontal flex={{ justifyContent: 'center' }} onClick={killEvent}>
              <Button
                {...row.getToggleRowExpandedProps()}
                color={Color.GREY_600}
                icon={row.isExpanded ? 'chevron-down' : 'chevron-right'}
                variation={ButtonVariation.ICON}
                iconProps={{ size: 19 }}
                className={css.toggleAccordion}
              />
            </Layout.Horizontal>
          )
        },
        {
          Header: 'NETWORK MAPS',
          width: '25%',
          Cell: Name
        },
        {
          Header: 'CONNECTOR',
          width: '25%',
          Cell: Connector
        },
        {
          Header: 'NO OF SERVICES',
          width: '20%',
          Cell: ServiceCount
        },
        {
          Header: 'LAST UPDATED BY',
          width: '15%',
          Cell: LastModified
        },
        {
          Header: '',
          id: 'threeDotMenu',
          Cell: ThreeDotMenu
        }
      ]}
      data={dummydata}
    />
  )
}

export default NetworkMapTable
