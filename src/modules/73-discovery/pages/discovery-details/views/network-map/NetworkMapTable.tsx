/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Classes, Menu, MenuItem, Position } from '@blueprintjs/core'
import {
  Avatar,
  Button,
  ButtonVariation,
  DropDown,
  ExpandingSearchInput,
  Layout,
  Page,
  Popover,
  TableV2,
  Text,
  useToaster
} from '@harness/uicore'
import React from 'react'
import { Color } from '@harness/design-system'
import type { CellProps, Renderer } from 'react-table'
import { useHistory, useParams } from 'react-router-dom'
import { noop } from 'lodash-es'
import { killEvent } from '@common/utils/eventUtils'
import { getTimeAgo } from '@pipeline/utils/CIUtils'
import type { DiscoveryPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { DatabaseNetworkMapCollection, useDeleteNetworkMap, useListNetworkMap } from 'services/servicediscovery'
import css from './NetworkMapTable.module.scss'
import routes from '@common/RouteDefinitions'

const NetworkMapTable: React.FC = () => {
  const { dAgentId, accountId, orgIdentifier, projectIdentifier } = useParams<DiscoveryPathProps & ModulePathParams>()
  const history = useHistory()
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()

  const {
    data: networkMapList,
    loading: networkMapListLoading,
    refetch: refetchListNetwork
  } = useListNetworkMap({
    infraID: dAgentId,
    queryParams: {
      accountIdentifier: accountId,
      organizationIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier
    }
  })

  const { mutate: deleteNetworkMap } = useDeleteNetworkMap({
    queryParams: {
      accountIdentifier: accountId,
      organizationIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier
    },
    infraID: dAgentId
  })

  const handleDelete = (networkMapId: string) => {
    return deleteNetworkMap(networkMapId)
      .then(() => {
        showSuccess('Network Map deleted successfully')
        refetchListNetwork()
      })
      .catch(e => showError(e))
  }

  const Name: Renderer<CellProps<DatabaseNetworkMapCollection>> = ({ row }) => (
    <Text font={{ size: 'normal', weight: 'semi-bold' }} margin={{ left: 'medium' }} color={Color.PRIMARY_7}>
      {row.original.name}
    </Text>
  )

  const ServiceCount: Renderer<CellProps<DatabaseNetworkMapCollection>> = ({ row }) => (
    <Layout.Vertical width={60} height={50} className={css.totalServiceContainer}>
      <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.GREY_500}>
        {row.original.resources?.length}
      </Text>
    </Layout.Vertical>
  )

  const LastModified: Renderer<CellProps<DatabaseNetworkMapCollection>> = ({ row }) => (
    <Layout.Horizontal flex={{ align: 'center-center', justifyContent: 'flex-start' }}>
      <Avatar hoverCard={false} name={row.original.updatedAt} size="normal" />
      <Layout.Vertical spacing={'xsmall'}>
        <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_900} lineClamp={1}>
          {row.original.updatedAt}
        </Text>
        <Text font={{ size: 'xsmall' }} color={Color.GREY_500} lineClamp={1}>
          {getTimeAgo(new Date(row.original.createdAt ?? '').getTime())}
        </Text>
      </Layout.Vertical>
    </Layout.Horizontal>
  )

  const ThreeDotMenu: Renderer<CellProps<DatabaseNetworkMapCollection>> = ({ row }) => {
    return (
      <Layout.Horizontal style={{ justifyContent: 'flex-end', marginRight: '10px' }}>
        <Popover className={Classes.DARK} position={Position.LEFT}>
          <Button variation={ButtonVariation.ICON} icon="Options" />
          <Menu style={{ backgroundColor: 'unset' }}>
            <MenuItem icon="edit" text={'Edit'} onClick={() => void 0} className={css.menuItem} />
            <MenuItem
              icon="delete"
              text={'Delete'}
              className={css.menuItem}
              onClick={() => handleDelete(row.original.id ?? '')}
            />
          </Menu>
        </Popover>
      </Layout.Horizontal>
    )
  }

  return (
    <>
      <Page.SubHeader>
        <Layout.Horizontal width="100%" flex={{ justifyContent: 'space-between' }}>
          <Button
            text="New Network Map"
            icon="plus"
            variation={ButtonVariation.PRIMARY}
            onClick={() => {
              history.push({
                pathname: routes.toCreateNetworkMap({
                  dAgentId: dAgentId,
                  accountId,
                  orgIdentifier,
                  projectIdentifier
                })
              })
            }}
          />
          <ExpandingSearchInput
            alwaysExpanded
            width={232}
            placeholder="Search for a network map"
            throttle={200}
            onChange={() => void 0}
          />
        </Layout.Horizontal>
      </Page.SubHeader>
      {networkMapListLoading ? (
        <></>
      ) : (
        <TableV2<DatabaseNetworkMapCollection>
          className={css.tableBody}
          sortable={true}
          columns={[
            {
              Header: 'NETWORK MAPS',
              width: '30%',
              Cell: Name
            },

            {
              Header: 'NO OF SERVICES',
              width: '30%',
              Cell: ServiceCount
            },
            {
              Header: 'LAST UPDATED BY',
              width: '30%',
              Cell: LastModified
            },
            {
              Header: '',
              id: 'threeDotMenu',
              width: '10%',
              Cell: ThreeDotMenu
            }
          ]}
          data={networkMapList?.items ?? []}
        />
      )}
    </>
  )
}

export default NetworkMapTable
