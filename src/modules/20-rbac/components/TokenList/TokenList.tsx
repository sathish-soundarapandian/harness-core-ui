/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Text, Button, Table, ButtonVariation, useConfirmationDialog } from '@harness/uicore'
import { Color, Intent } from '@harness/design-system'
import { Classes, Menu, Popover, Position } from '@blueprintjs/core'
import type { CellProps, Column, Renderer } from 'react-table'
import ReactTimeago from 'react-timeago'
import moment from 'moment'
import { String, useStrings } from 'framework/strings'
import { TokenAggregateDTO, TokenDTO, useDeleteToken, useListAggregatedTokens } from 'services/cd-ng'
import type { ProjectPathProps, ServiceAccountPathProps } from '@common/interfaces/RouteInterfaces'
import { PageSpinner, TagsPopover, useToaster } from '@common/components'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import { hasNoExpiryDate } from '@rbac/modals/TokenModal/views/utils'
import css from './TokenList.module.scss'

interface TokenListProps {
  apiKeyIdentifier: string
  openTokenModal: (apiKeyIdentifier: string, token?: TokenDTO) => void
  refetchTokens: boolean
  reloadApiKey: () => void
  onRefetchComplete: () => void
  apiKeyType: TokenDTO['apiKeyType']
  parentIdentifier?: string
}

const RenderColumnDetails: Renderer<CellProps<TokenAggregateDTO>> = ({ row }) => {
  const data = row.original.token
  const { getString } = useStrings()
  return (
    <div>
      <Layout.Horizontal spacing="small">
        <Text color={Color.BLACK} lineClamp={1} className={css.wordBreak}>
          {data.name}
        </Text>
        {data.tags && Object.keys(data.tags).length ? <TagsPopover tags={data.tags} /> : null}
      </Layout.Horizontal>
      <Text color={Color.GREY_400} lineClamp={1} font={{ size: 'small' }} className={css.wordBreak}>
        {getString('idLabel', { id: data.identifier })}
      </Text>
    </div>
  )
}

const RenderColumnUpdatedAt: Renderer<CellProps<TokenAggregateDTO>> = ({ row }) => {
  const data = row.original
  return <ReactTimeago date={data.createdAt} minPeriod={60} />
}

const RenderColumnLastUpdated: Renderer<CellProps<TokenAggregateDTO>> = ({ row }) => {
  const data = row.original
  return <ReactTimeago date={data.lastModifiedAt} minPeriod={60} />
}

const RenderColumnExpiryDate: Renderer<CellProps<TokenAggregateDTO>> = ({ row }) => {
  const data = row.original.token.scheduledExpireTime || row.original.expiryAt
  const { getString } = useStrings()

  return (
    <Text>
      {hasNoExpiryDate(data) ? getString('common.noexpiration') : moment(data).format('MM/DD/YYYY hh:mm:ss a')}
    </Text>
  )
}

const RenderColumnStatus: Renderer<CellProps<TokenAggregateDTO>> = ({ row }) => {
  const data = row.original
  const isRotated = data.token.scheduledExpireTime
  return (
    <Text
      inline
      icon={isRotated ? 'warning-sign' : 'full-circle'}
      iconProps={{
        size: isRotated ? 12 : 6,
        color: isRotated ? Color.RED_500 : Color.GREEN_500
      }}
    >
      {isRotated ? <String stringID="rbac.token.scheduledToExpire" /> : <String stringID="active" />}
    </Text>
  )
}

const RenderColumnMenu: Renderer<CellProps<TokenAggregateDTO>> = ({ row, column }) => {
  const data = row.original.token
  const {
    identifier,
    apiKeyIdentifier,
    accountIdentifier,
    orgIdentifier,
    projectIdentifier,
    parentIdentifier,
    apiKeyType
  } = data
  const [menuOpen, setMenuOpen] = useState(false)
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { mutate: deleteToken } = useDeleteToken({
    queryParams: {
      accountIdentifier,
      orgIdentifier,
      projectIdentifier,
      parentIdentifier,
      apiKeyIdentifier,
      apiKeyType
    }
  })
  const permission = {
    permission: PermissionIdentifier.MANAGE_SERVICEACCOUNT,
    resource: {
      resourceType: ResourceType.SERVICEACCOUNT,
      resourceIdentifier: parentIdentifier
    },
    options: {
      skipCondition: () => apiKeyType === 'USER'
    }
  }

  const { openDialog: openDeleteDialog } = useConfirmationDialog({
    contentText: getString('rbac.token.confirmDelete', { name: data.name }),
    titleText: getString('rbac.token.confirmDeleteTitle'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: async (isConfirmed: boolean) => {
      /* istanbul ignore else */ if (isConfirmed) {
        try {
          const deleted = await deleteToken(identifier || '', {
            headers: { 'content-type': 'application/json' }
          })
          /* istanbul ignore else */ if (deleted) {
            showSuccess(getString('rbac.token.successMessage', { name: data.name }))
            ;(column as any).reload()
          } else {
            showError(getString('deleteError'))
          }
        } catch (err) {
          /* istanbul ignore next */
          showError(err?.data?.message || err?.message)
        }
      }
    }
  })

  const handleDelete = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    e.stopPropagation()
    setMenuOpen(false)
    openDeleteDialog()
  }

  const handleEdit = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    e.stopPropagation()
    setMenuOpen(false)
    ;(column as any).openTokenModal(apiKeyIdentifier || '', data)
  }

  const handleRotate = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    e.stopPropagation()
    setMenuOpen(false)
    ;(column as any).openTokenModal(apiKeyIdentifier || '', data, true)
  }

  return (
    <Layout.Horizontal flex={{ justifyContent: 'flex-end' }}>
      <Popover
        isOpen={menuOpen}
        onInteraction={nextOpenState => {
          setMenuOpen(nextOpenState)
        }}
        className={Classes.DARK}
        position={Position.BOTTOM_RIGHT}
      >
        <Button
          variation={ButtonVariation.ICON}
          icon="Options"
          data-testid={`menu-${data.identifier}`}
          onClick={e => {
            e.stopPropagation()
            setMenuOpen(true)
          }}
        />
        <Menu>
          {data.scheduledExpireTime ? null : (
            <div>
              <RbacMenuItem icon="edit" text={getString('edit')} onClick={handleEdit} permission={permission} />
              <RbacMenuItem
                icon="rotate-page"
                text={getString('rbac.token.rotateLabel')}
                onClick={handleRotate}
                permission={permission}
              />
            </div>
          )}
          <RbacMenuItem icon="trash" text={getString('delete')} onClick={handleDelete} permission={permission} />
        </Menu>
      </Popover>
    </Layout.Horizontal>
  )
}

const TokenList: React.FC<TokenListProps> = ({
  apiKeyIdentifier,
  openTokenModal,
  refetchTokens,
  onRefetchComplete,
  reloadApiKey,
  apiKeyType,
  parentIdentifier
}) => {
  const { accountId, projectIdentifier, orgIdentifier, serviceAccountIdentifier } = useParams<
    ProjectPathProps & ServiceAccountPathProps
  >()
  const { getString } = useStrings()
  const { data, refetch, loading } = useListAggregatedTokens({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      apiKeyType,
      parentIdentifier: parentIdentifier || serviceAccountIdentifier,
      apiKeyIdentifier
    }
  })

  useEffect(() => {
    if (refetchTokens) {
      refetch()
      onRefetchComplete()
    }
  }, [refetchTokens])

  const onDeleteToken = (): void => {
    reloadApiKey()
    refetch()
  }

  const columns: Column<TokenAggregateDTO>[] = useMemo(
    () => [
      {
        Header: getString('token'),
        accessor: row => row.token.name,
        id: 'name',
        width: '20%',
        Cell: RenderColumnDetails
      },
      {
        Header: getString('status'),
        accessor: row => row.token.scheduledExpireTime,
        id: 'status',
        width: '15%',
        Cell: RenderColumnStatus
      },
      {
        Header: getString('common.expiryDate'),
        accessor: row => row.expiryAt,
        id: 'expiryDate',
        width: '30%',
        Cell: RenderColumnExpiryDate
      },
      {
        Header: getString('created'),
        accessor: row => row.createdAt,
        id: 'createdAt',
        width: '15%',
        Cell: RenderColumnUpdatedAt
      },
      {
        Header: getString('lastUpdated'),
        accessor: row => row.lastModifiedAt,
        id: 'lastUpdated',
        width: '15%',
        Cell: RenderColumnLastUpdated
      },
      {
        Header: '',
        accessor: row => row.token.identifier,
        width: '5%',
        id: 'action',
        Cell: RenderColumnMenu,
        disableSortBy: true,
        reload: onDeleteToken,
        openTokenModal
      }
    ],
    [data]
  )

  return (
    <>
      <Table<TokenAggregateDTO>
        columns={columns}
        data={data?.data?.content || []}
        bpTableProps={{ bordered: false }}
        className={css.tableList}
      />
      {loading ? <PageSpinner /> : null}
    </>
  )
}

export default TokenList
