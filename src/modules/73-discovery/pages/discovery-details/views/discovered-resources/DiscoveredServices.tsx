/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Classes, Menu, MenuItem, Position } from '@blueprintjs/core'
import { Button, ButtonVariation, Container, Icon, Layout, Popover, TableV2, Text } from '@harness/uicore'
import React from 'react'
import { Color } from '@harness/design-system'
import type { CellProps, Renderer } from 'react-table'
import { useParams } from 'react-router-dom'
import { killEvent } from '@common/utils/eventUtils'
import type { DiscoveryPathProps, ModulePathParams } from '@common/interfaces/RouteInterfaces'
import { DatabaseServiceCollection, useListService } from 'services/servicediscovery'
import { useStrings } from 'framework/strings'
import css from './DiscoveryServices.module.scss'

const Name: Renderer<CellProps<DatabaseServiceCollection>> = ({ row }) => (
  <Text font={{ size: 'normal', weight: 'semi-bold' }} margin={{ left: 'medium' }} color={Color.PRIMARY_7}>
    {row.original.name}
  </Text>
)

const Namepspace: Renderer<CellProps<DatabaseServiceCollection>> = ({ row }) => (
  <Layout.Horizontal spacing="small" flex={{ justifyContent: 'flex-start', alignItems: 'center' }}>
    <Icon name="app-kubernetes" size={24} margin={{ right: 'small' }} />
    <Text>{row.original.namespace}</Text>
  </Layout.Horizontal>
)
const NetworkDetails: Renderer<CellProps<DatabaseServiceCollection>> = ({ row }) => (
  <Layout.Vertical>
    <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_500}>
      IP Address: {row.original.spec?.clusterIP}
    </Text>
    <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_500}>
      Port Number: {row.original.spec && row.original.spec?.ports && row.original.spec?.ports[0]?.port}
    </Text>
  </Layout.Vertical>
)
const LastModified: Renderer<CellProps<DatabaseServiceCollection>> = () => (
  <Layout.Horizontal flex={{ align: 'center-center', justifyContent: 'flex-start' }}>
    {/* <Avatar hoverCard={false} name={row.original.lastUpdatedBy} size="normal" />
    <Layout.Vertical spacing={'xsmall'}>
      <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_900} lineClamp={1}>
        {row.original.lastUpdatedBy}
      </Text>
      <Text font={{ size: 'xsmall' }} color={Color.GREY_500} lineClamp={1}>
        {getTimeAgo(row.original.lastUpdatedAt)}
      </Text>
    </Layout.Vertical> */}
  </Layout.Horizontal>
)

const ThreeDotMenu: Renderer<CellProps<DatabaseServiceCollection>> = () => (
  <Layout.Horizontal style={{ justifyContent: 'flex-end' }} onClick={killEvent}>
    <Popover className={Classes.DARK} position={Position.LEFT}>
      <Button variation={ButtonVariation.ICON} icon="Options" />
      <Menu style={{ backgroundColor: 'unset' }}>
        <MenuItem text={'Menu 1'} onClick={() => void 0} />
        <MenuItem text={'Menu 2'} onClick={() => void 0} />
      </Menu>
    </Popover>
  </Layout.Horizontal>
)

const DiscoveredServices: React.FC = () => {
  const { dAgentId } = useParams<DiscoveryPathProps & ModulePathParams>()
  const { getString } = useStrings()
  const { data: serviceList, loading: serviceListLoader } = useListService({ infraID: dAgentId })

  return (
    <>
      {serviceListLoader ? (
        <Container width={'100%'} flex={{ align: 'center-center' }}>
          <Layout.Vertical spacing={'medium'} style={{ alignItems: 'center' }}>
            <Icon name="steps-spinner" size={32} color={Color.GREY_600} />
            <Text font={{ size: 'medium', align: 'center' }} color={Color.GREY_600}>
              {getString('loading')}
            </Text>
          </Layout.Vertical>
        </Container>
      ) : (
        <Container width="95%" style={{ margin: 'auto' }}>
          <TableV2<DatabaseServiceCollection>
            className={css.tableBody}
            columns={[
              {
                Header: 'Service Name',
                width: '25%',
                Cell: Name
              },
              {
                Header: 'Namespace',
                width: '25%',
                Cell: Namepspace
              },
              {
                Header: 'Network Details',
                width: '20%',
                Cell: NetworkDetails
              },
              {
                Header: 'Related Services',
                width: '15%',
                Cell: LastModified
              },
              {
                Header: '',
                id: 'threeDotMenu',
                Cell: ThreeDotMenu
              }
            ]}
            data={serviceList?.items ?? []}
          />
        </Container>
      )}
    </>
  )
}

export default DiscoveredServices
