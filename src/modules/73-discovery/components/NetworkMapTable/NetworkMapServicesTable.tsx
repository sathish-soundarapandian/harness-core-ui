/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Icon, Layout, TableV2, Text } from '@harness/uicore'
import React from 'react'
import { Color } from '@harness/design-system'
import { Link, useParams } from 'react-router-dom'
import type { CellProps, Renderer } from 'react-table'
import { killEvent } from '@common/utils/eventUtils'
import routes from '@common/RouteDefinitions'
import type { ModulePathParams, DiscoveryPathProps } from '@common/interfaces/RouteInterfaces'
import type { ServiceDetails } from './NetworkMapTable'
import css from './NetworkMapTable.module.scss'

const Name: Renderer<CellProps<ServiceDetails>> = ({ row }) => {
  const service = row.original
  const { accountId, orgIdentifier, projectIdentifier } = useParams<DiscoveryPathProps & ModulePathParams>()
  const path = routes.toDiscovery({
    accountId,
    orgIdentifier,
    projectIdentifier
  })
  return (
    <Link to={`${path}/123456/${row.original.name}`} target="_blank">
      <Text font={{ size: 'normal', weight: 'semi-bold' }} color={Color.PRIMARY_7}>
        {service.name}
      </Text>
    </Link>
  )
}

const Namespace: Renderer<CellProps<ServiceDetails>> = ({ row }) => (
  <Layout.Horizontal spacing="small" flex={{ justifyContent: 'flex-start', alignItems: 'center' }}>
    <Icon name="app-kubernetes" size={24} margin={{ right: 'xsmall' }} />
    <Text font={{ size: 'normal', weight: 'light' }} color={Color.GREY_500}>
      {row.original.namespace}
    </Text>
  </Layout.Horizontal>
)
const ServiceCount: Renderer<CellProps<ServiceDetails>> = ({ row }) => (
  <Layout.Horizontal height={35} flex={{ alignItems: 'center' }} className={css.serviceCountContainer}>
    <Text font={{ weight: 'semi-bold' }} color={Color.GREY_500} style={{ fontSize: '16px' }}>
      {(row.original?.resources?.connections ?? 0) +
        (row.original?.resources?.pods ?? 0) +
        (row.original.resources.workloads ?? 0)}
    </Text>
    {row.original.resources.pods ? (
      <Layout.Horizontal flex={{ justifyContent: 'center' }}>
        <Icon name="app-kubernetes" size={16} margin={{ right: 'xsmall' }} />
        <Text color={Color.GREY_600} font={{ weight: 'semi-bold' }} style={{ fontSize: '14px' }}>
          {row.original.resources.pods}
        </Text>
      </Layout.Horizontal>
    ) : (
      <></>
    )}
    {row.original.resources.workloads ? (
      <Layout.Horizontal flex={{ justifyContent: 'center' }}>
        <Icon name="app-kubernetes" size={16} margin={{ right: 'xsmall' }} />
        <Text color={Color.GREY_600} font={{ weight: 'semi-bold' }} style={{ fontSize: '14px' }}>
          {row.original.resources.workloads}
        </Text>
      </Layout.Horizontal>
    ) : (
      <></>
    )}
    {row.original.resources.connections ? (
      <Layout.Horizontal flex={{ justifyContent: 'center' }}>
        <Icon name="app-kubernetes" size={16} margin={{ right: 'xsmall' }} />
        <Text color={Color.GREY_600} font={{ weight: 'semi-bold' }} style={{ fontSize: '14px' }}>
          {row.original.resources.connections}
        </Text>
      </Layout.Horizontal>
    ) : (
      <></>
    )}
  </Layout.Horizontal>
)

const IPAddress: Renderer<CellProps<ServiceDetails>> = ({ row }) => (
  <Layout.Horizontal flex={{ align: 'center-center', justifyContent: 'flex-start' }}>
    <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.PRIMARY_5} lineClamp={1}>
      {row.original.ipAddress}
    </Text>
  </Layout.Horizontal>
)

const PortNumber: Renderer<CellProps<ServiceDetails>> = ({ row }) => (
  <Layout.Horizontal style={{ justifyContent: 'flex-start' }} onClick={killEvent}>
    <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.PRIMARY_5} lineClamp={1}>
      {row.original.portNumber}
    </Text>
  </Layout.Horizontal>
)

export interface NetworkMapServicesTableProps {
  services: Array<ServiceDetails>
}

const NetworkMapServicesTable: React.FC<NetworkMapServicesTableProps> = ({ services }) => {
  return (
    <TableV2
      className={css.servicesTable}
      sortable={true}
      columns={[
        {
          Header: 'SERVICE NAME',
          id: 'service-name',
          width: '20%',
          Cell: Name
        },
        {
          Header: 'NAMESPACE',
          width: '20%',
          Cell: Namespace
        },
        {
          Header: 'RESOURCES',
          width: '25%',
          Cell: ServiceCount
        },
        {
          Header: 'IP ADDRESS',
          width: '20%',
          Cell: IPAddress
        },
        {
          Header: 'PORT NUMBER',
          Cell: PortNumber
        }
      ]}
      data={services}
    />
  )
}

export default NetworkMapServicesTable
