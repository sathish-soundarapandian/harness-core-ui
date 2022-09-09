/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { Button, ButtonSize, ButtonVariation, Container, TableV2, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { Menu, Popover, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import ReactTimeago from 'react-timeago'
import { defaultTo } from 'lodash-es'

import { useStrings } from 'framework/strings'
import {
  ConnectorResponse,
  ConnectorValidationResult,
  PageConnectorResponse,
  useGetConnectorListV2,
  useGetTestConnectionResult
} from 'services/cd-ng'
import type { CcmMetaData } from 'services/ce/services'
import { getIconByType } from '@connectors/pages/connectors/utils/ConnectorUtils'
import { Connectors } from '@connectors/constants'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { usePermission } from '@rbac/hooks/usePermission'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { ConnectorStatus } from '@ce/constants'
import {
  CustomCloudCell,
  CustomCloudColumn,
  getCloudViewCostsLink,
  getConnectorStatusIcon
} from '@ce/utils/cloudIntegrationUtils'
import useCreateConnectorModal from '@connectors/modals/ConnectorModal/useCreateConnectorModal'

import { EmptySearchState } from './NoConnectors'

import css from './CloudIntegrationTabs.module.scss'

const ConnectorNameCell: CustomCloudCell = ({ row, column }) => {
  const name = row.original?.connector?.name
  const connectorType = row.original.connector?.type
  const identifier = row.original.connector?.identifier

  const [canUpdate] = usePermission(
    {
      resource: {
        resourceType: ResourceType.CONNECTOR,
        resourceIdentifier: identifier || ''
      },
      permissions: [PermissionIdentifier.UPDATE_CONNECTOR]
    },
    [identifier]
  )

  return (
    <Text
      icon={getIconByType(connectorType)}
      iconProps={{ size: 30, margin: { right: 'small' } }}
      font={{ variation: FontVariation.BODY2 }}
      className={css.nameCell}
      lineClamp={1}
      onClick={() => {
        if (canUpdate) {
          ;(column as any).openConnectorModal(true, connectorType, { connectorInfo: row.original.connector })
        }
      }}
    >
      {name}
    </Text>
  )
}

const ConnectorStatusCell: CustomCloudCell = cell => {
  const { getString } = useStrings()
  const { accountId } = useParams<{ accountId: string }>()

  const data = cell.row.original

  const [status, setStatus] = useState<ConnectorValidationResult['status']>()
  const [errorSummary, setErrorSummary] = useState()
  const [lastTestedAt, setLastTestedAt] = useState<number | undefined>()

  const { mutate: testConnection } = useGetTestConnectionResult({
    identifier: defaultTo(data.connector?.identifier, ''),
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const isStatusSuccess = defaultTo(
    data?.status?.status === ConnectorStatus.SUCCESS,
    status === ConnectorStatus.SUCCESS
  )

  const tooltipText = (errorSummary || data.status?.errorSummary)?.trim() || getString('noDetails')

  return (
    <div className={css.statusCell}>
      <Text
        {...getConnectorStatusIcon(defaultTo(data?.status?.status, status))}
        font={{ variation: FontVariation.BODY }}
        tooltip={
          <Text
            icon="warning-sign"
            iconProps={{
              color: Color.RED_700,
              padding: { right: 'small' },
              style: { alignSelf: 'flex-start' },
              size: 18
            }}
            className={css.statusError}
            color={Color.WHITE}
            font={{ variation: FontVariation.BODY }}
          >
            {tooltipText}
          </Text>
        }
        tooltipProps={{ isDark: true, position: 'bottom', disabled: isStatusSuccess }}
        color={Color.GREY_800}
      >
        <ReactTimeago date={lastTestedAt || data?.status?.lastTestedAt || data?.status?.testedAt || ''} />
      </Text>
      {!isStatusSuccess ? (
        <Button
          variation={ButtonVariation.SECONDARY}
          size={ButtonSize.SMALL}
          text={getString('common.smtp.testConnection')}
          className={css.testBtn}
          onClick={
            /* istanbul ignore next */ async e => {
              try {
                e.stopPropagation()
                const res = await testConnection()
                setStatus(res.data?.status)
              } catch (err) {
                setStatus('FAILURE')
                setErrorSummary(err?.data?.message)
              } finally {
                setLastTestedAt(new Date().getTime())
              }
            }
          }
        />
      ) : null}
    </div>
  )
}

const LastUpdatedCell: CustomCloudCell = cell => {
  const lastModifiedAt = cell.row.original.lastModifiedAt

  return (
    <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_800} lineClamp={1}>
      <ReactTimeago date={defaultTo(lastModifiedAt, '')} />
    </Text>
  )
}

const ViewCostsCell: CustomCloudCell = ({ row, column }) => {
  const { getString } = useStrings()
  const { accountId } = useParams<{ accountId: string }>()

  const connector = row.original.connector
  const ccmMetaData = (column as any).ccmMetaData

  const route = getCloudViewCostsLink({ accountId, ccmMetaData, connector })

  return (
    <Button
      variation={ButtonVariation.LINK}
      rightIcon="launch"
      iconProps={{ size: 12, color: Color.PRIMARY_7 }}
      text={getString('ce.cloudIntegration.viewCosts')}
      onClick={
        /* istanbul ignore next */ e => {
          e.stopPropagation()
          const baseUrl = window.location.href.split('#')[0]
          window.open(`${baseUrl}#${route}`, '_blank')
        }
      }
    />
  )
}

const MenuCell: CustomCloudCell = ({ row, column }) => {
  const { getString } = useStrings()
  const connector = row.original.connector

  const [menuOpen, setMenuOpen] = useState(false)

  const handleEditConnector = /* istanbul ignore next */ (): void => {
    ;(column as any).openConnectorModal(true, row.original.connector?.type, { connectorInfo: connector })
  }

  const [canUpdate] = usePermission(
    {
      resource: {
        resourceType: ResourceType.CONNECTOR,
        resourceIdentifier: connector?.identifier || ''
      },
      permissions: [PermissionIdentifier.UPDATE_CONNECTOR]
    },
    [connector?.identifier]
  )

  return (
    <Popover
      isOpen={menuOpen}
      interactionKind={PopoverInteractionKind.CLICK}
      position={Position.BOTTOM_RIGHT}
      onInteraction={nextOpenState => {
        setMenuOpen(nextOpenState)
      }}
    >
      <Button minimal icon="Options" onClick={() => setMenuOpen(true)} />
      <Menu>
        <Menu.Item
          icon="edit"
          text={getString('ce.cloudIntegration.editConnector')}
          onClick={handleEditConnector}
          disabled={!canUpdate}
        />
      </Menu>
    </Popover>
  )
}

interface CloudAccountsTabProps {
  ccmMetaData: CcmMetaData
  searchTerm: string
}

const CloudAccountsTab: React.FC<CloudAccountsTabProps> = ({ ccmMetaData, searchTerm }) => {
  const { getString } = useStrings()

  const { accountId } = useParams<{ accountId: string }>()

  const [cloudAccounts, setCloudAccounts] = useState<PageConnectorResponse>()
  const [page, setPage] = useState(0)

  const { loading, mutate: fetchConnectors } = useGetConnectorListV2({
    queryParams: {
      searchTerm,
      pageIndex: page,
      pageSize: 10,
      accountIdentifier: accountId
    }
  })

  const getCloudAccounts = async (): Promise<void> => {
    const { data: connectorResponse } = await fetchConnectors({
      filterType: 'Connector',
      types: [Connectors.CEAWS, Connectors.CE_GCP, Connectors.CE_AZURE]
    })

    setCloudAccounts(connectorResponse)
  }

  useEffect(() => {
    getCloudAccounts()
  }, [page, searchTerm])

  const { openConnectorModal } = useCreateConnectorModal({
    onSuccess: getCloudAccounts
  })

  const columns = useMemo(
    () => [
      {
        accessor: 'name',
        Header: getString('connectors.name'),
        Cell: ConnectorNameCell,
        width: '25%',
        openConnectorModal
      },
      {
        accessor: 'status',
        Header: getString('ce.cloudIntegration.connectorStatus'),
        Cell: ConnectorStatusCell,
        width: '35%'
      },
      {
        accessor: 'lastUpdated',
        Header: getString('delegates.lastUpdated'),
        Cell: LastUpdatedCell,
        width: '25%'
      },
      {
        accessor: 'viewCosts',
        Header: '',
        Cell: ViewCostsCell,
        width: '15%',
        ccmMetaData
      },
      {
        accessor: 'menu',
        Header: '',
        Cell: MenuCell,
        width: '5%',
        openConnectorModal
      }
    ],
    [ccmMetaData, getString]
  )

  if (loading) {
    return <ContainerSpinner className={css.spinner} />
  }

  if (searchTerm && !cloudAccounts?.content?.length) {
    return <EmptySearchState />
  }

  return (
    <Container className={css.main}>
      <TableV2<ConnectorResponse>
        data={defaultTo(cloudAccounts?.content, [])}
        columns={columns as CustomCloudColumn}
        className={css.table}
        pagination={{
          itemCount: defaultTo(cloudAccounts?.totalItems, 0),
          pageSize: defaultTo(cloudAccounts?.pageSize, 10),
          pageCount: defaultTo(cloudAccounts?.totalPages, -1),
          pageIndex: defaultTo(cloudAccounts?.pageIndex, 0),
          gotoPage: /* istanbul ignore next */ pageNo => setPage(pageNo)
        }}
      />
    </Container>
  )
}

export default CloudAccountsTab
