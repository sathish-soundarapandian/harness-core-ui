/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import ReactTimeago from 'react-timeago'
import type { CellProps, Renderer } from 'react-table'
import { Icon, Layout, Table, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { String, StringKeys, useStrings } from 'framework/strings'
import type { ConnectorInfoDTO, ConnectorResponse } from 'services/cd-ng'
import { DelegateTypes } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { TagsPopover } from '@common/components'

interface DisplaySelectedConnectorProps {
  data: ConnectorResponse[]
}

export const DisplaySelectedConnector: React.FC<DisplaySelectedConnectorProps> = props => {
  const { getString } = useStrings()

  const getConnectorDisplaySummaryLabel = (titleStringId: StringKeys, Element: JSX.Element): JSX.Element | string => {
    return (
      <div>
        {titleStringId ? (
          <Text inline color={Color.BLACK}>
            <String stringID={titleStringId} />:
          </Text>
        ) : null}
        {Element}
      </div>
    )
  }

  const displayDelegatesTagsSummary = (delegateSelectors: []): JSX.Element => {
    return (
      <div>
        <Text inline color={Color.BLACK}>
          <String stringID={'delegate.delegateTags'} />:
        </Text>
        <Text inline margin={{ left: 'xsmall' }} color={Color.GREY_400}>
          {delegateSelectors?.join?.(', ')}
        </Text>
      </div>
    )
  }

  const getK8DisplaySummary = (connector: ConnectorInfoDTO): JSX.Element | string => {
    return connector?.spec?.credential?.type === DelegateTypes.DELEGATE_IN_CLUSTER
      ? displayDelegatesTagsSummary(connector.spec.delegateSelectors)
      : getConnectorDisplaySummaryLabel('UrlLabel', <Text>{connector?.spec?.credential?.spec?.masterUrl}</Text>)
  }

  const RenderColumnConnector: Renderer<CellProps<ConnectorResponse>> = ({ row }) => {
    const data = row.original
    const tags = data.connector?.tags || {}
    return (
      <Layout.Horizontal spacing="small">
        <div>
          <Layout.Horizontal spacing="small">
            <div color={Color.BLACK} title={data.connector?.name}>
              {data.connector?.name}
            </div>
            {tags && Object.keys(tags).length ? <TagsPopover tags={tags} /> : null}
          </Layout.Horizontal>
          <div title={data.connector?.identifier}>{data.connector?.identifier}</div>
        </div>
      </Layout.Horizontal>
    )
  }

  const RenderColumnDetails: Renderer<CellProps<ConnectorResponse>> = ({ row }) => {
    const data = row.original

    return data.connector ? (
      <div>
        <div color={Color.BLACK}>{getK8DisplaySummary(data.connector)}</div>
      </div>
    ) : null
  }

  const RenderColumnActivity: Renderer<CellProps<ConnectorResponse>> = ({ row }) => {
    const data = row.original
    return (
      <Layout.Horizontal spacing="small">
        <Icon name="activity" />
        {data.activityDetails?.lastActivityTime ? <ReactTimeago date={data.activityDetails?.lastActivityTime} /> : null}
      </Layout.Horizontal>
    )
  }
  const RenderColumnLastUpdated: Renderer<CellProps<ConnectorResponse>> = ({ row }) => {
    const data = row.original
    return (
      <Layout.Horizontal spacing="small">
        {data.lastModifiedAt ? <ReactTimeago date={data.lastModifiedAt} /> : null}
      </Layout.Horizontal>
    )
  }
  return (
    <Table<ConnectorResponse>
      data={props.data}
      bpTableProps={{}}
      columns={[
        {
          Header: getString('connector').toUpperCase(),
          accessor: row => row.connector?.name,
          id: 'name',
          width: '20%',
          Cell: RenderColumnConnector
        },
        {
          Header: getString('details').toUpperCase(),
          accessor: row => row.connector?.description,
          id: 'details',
          width: '20%',
          Cell: RenderColumnDetails
        },
        {
          Header: getString('lastActivity').toUpperCase(),
          accessor: 'activityDetails',
          id: 'activity',
          width: '20%',
          Cell: RenderColumnActivity
        },
        {
          Header: getString('lastUpdated').toUpperCase(),
          accessor: 'lastModifiedAt',
          id: 'lastModifiedAt',
          width: '20%',
          Cell: RenderColumnLastUpdated
        }
      ]}
    />
  )
}
