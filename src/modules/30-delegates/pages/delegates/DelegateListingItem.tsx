/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import ReactTimeago from 'react-timeago'
import { defaultTo, set } from 'lodash-es'
import { useParams, useHistory } from 'react-router-dom'
import {
  Button,
  Text,
  Layout,
  Popover,
  useToaster,
  useConfirmationDialog,
  ButtonVariation
} from '@wings-software/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { Menu, MenuItem, Classes, Position, Dialog } from '@blueprintjs/core'
import type { CellProps, Renderer, UseExpandedRowProps } from 'react-table'
import { useStrings } from 'framework/strings'
import { useDeleteDelegateGroupByIdentifier, DelegateGroupDetails } from 'services/portal'
import routes from '@common/RouteDefinitions'
import { delegateTypeToIcon } from '@common/utils/delegateUtils'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { usePermission } from '@rbac/hooks/usePermission'
import { TagsViewer } from '@common/components/TagsViewer/TagsViewer'
import DelegateInstallationError from '@delegates/components/CreateDelegate/components/DelegateInstallationError/DelegateInstallationError'
import { Table } from '@common/components'
import { killEvent } from '@common/utils/eventUtils'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { DelegateInstanceList } from './DelegateInstanceList'
import { getAutoUpgradeTextColor, getInstanceStatus } from './utils/DelegateHelper'
import css from './DelegatesPage.module.scss'

interface DelegateProps {
  data: DelegateGroupDetails[]
}

const ToggleAccordionCell: Renderer<{ row: UseExpandedRowProps<DelegateGroupDetails> }> = ({ row }) => {
  return (
    <Layout.Horizontal onClick={killEvent}>
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
}

const RenderDelegateIcon: Renderer<CellProps<DelegateGroupDetails>> = ({ row }) => {
  return (
    <div className={css.delegateItemIcon}>
      <Text icon={delegateTypeToIcon(row.original?.delegateType as string)} iconProps={{ size: 24 }} />
    </div>
  )
}

const RenderDelegateName: Renderer<CellProps<DelegateGroupDetails>> = ({ row }) => {
  const [autoUpgradeColor, autoUpgradeText] = !row.original?.activelyConnected
    ? []
    : getAutoUpgradeTextColor(row.original?.autoUpgrade)

  return (
    <Layout.Horizontal>
      <Layout.Vertical width={'55%'} margin={{ right: 'large' }}>
        <Text color={Color.BLACK} lineClamp={1}>
          {row.original?.groupName}
        </Text>
        <Text font={{ size: 'small' }} color={Color.GREY_500} lineClamp={1}>
          {row.original.delegateGroupIdentifier}
        </Text>
      </Layout.Vertical>
      <Text
        background={autoUpgradeColor}
        color={Color.WHITE}
        font={{ weight: 'semi-bold', size: 'xsmall' }}
        className={css.statusText}
      >
        {autoUpgradeText}
      </Text>
    </Layout.Horizontal>
  )
}

const RenderTags: Renderer<CellProps<DelegateGroupDetails>> = ({ row }) => {
  const delegate = row.original
  const allSelectors = Object.keys(delegate.groupImplicitSelectors || {}).concat(delegate.groupCustomSelectors || [])
  return (
    delegate?.groupImplicitSelectors && (
      <>
        <Text lineClamp={1}>
          <TagsViewer key="tags" tags={allSelectors.slice(0, 3)} />
          <span key="hidenTags">{allSelectors.length > 3 ? '+' + (allSelectors.length - 3) : ''}</span>
        </Text>
      </>
    )
  )
}

const RenderVersion: Renderer<CellProps<DelegateGroupDetails>> = ({ row }) => {
  return <Text>{row.original?.groupVersion}</Text>
}

const RenderInstanceStatus: Renderer<CellProps<DelegateGroupDetails>> = ({ row }) => {
  const delegate = row.original
  return <Text>{getInstanceStatus(delegate)}</Text>
}

const RenderHeartbeat: Renderer<CellProps<DelegateGroupDetails>> = ({ row }) => {
  const { getString } = useStrings()
  return row.original?.lastHeartBeat ? <ReactTimeago date={row.original?.lastHeartBeat} live /> : getString('na')
}

const RenderConnectivityStatus: Renderer<CellProps<DelegateGroupDetails>> = ({ row }) => {
  const { getString } = useStrings()
  const delegate = row.original
  const isConnected = delegate.activelyConnected
  const text = isConnected ? getString('connected') : getString('delegate.notConnected')
  const [troubleshoterOpen, setOpenTroubleshoter] = useState<{ isConnected: boolean | undefined }>()
  return (
    <Layout.Vertical>
      <Text
        icon="full-circle"
        iconProps={{ size: 6, color: isConnected ? Color.GREEN_600 : Color.GREY_400, padding: 'small' }}
      >
        {text}
      </Text>
      <Dialog
        isOpen={!!troubleshoterOpen}
        enforceFocus={false}
        style={{ width: '680px', height: '100%' }}
        onClose={() => setOpenTroubleshoter(undefined)}
      >
        <DelegateInstallationError showDelegateInstalledMessage={false} delegateType={delegate?.delegateType} />
      </Dialog>
      {!isConnected && delegate.delegateType === 'KUBERNETES' && (
        <div
          className={css.troubleshootLink}
          onClick={(e: React.MouseEvent) => {
            /*istanbul ignore next */
            e.stopPropagation()
            setOpenTroubleshoter({ isConnected: delegate.activelyConnected })
          }}
        >
          {getString('delegates.troubleshootOption')}
        </div>
      )}
    </Layout.Vertical>
  )
}

const RenderColumnMenu: Renderer<CellProps<DelegateGroupDetails>> = ({ row }) => {
  const delegate = row.original
  const { getString } = useStrings()

  const [menuOpen, setMenuOpen] = useState(false)
  const { showSuccess, showError } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()
  const [troubleshoterOpen, setOpenTroubleshoter] = useState<{ isConnected: boolean | undefined }>()

  const { mutate: forceDeleteDelegate } = useDeleteDelegateGroupByIdentifier({
    queryParams: { accountId: accountId, orgId: orgIdentifier, projectId: projectIdentifier }
  })

  const deleteDelegateDialogContent = (
    <>
      <Text font={{ variation: FontVariation.BODY }} margin={{ bottom: 'medium' }}>
        {getString('delegates.infoForDeleteDelegate')}
      </Text>
      <Text font={{ variation: FontVariation.BODY }}>
        {getString('delegates.questionForceDeleteDelegate', {
          name: delegate?.groupName
        })}
      </Text>
    </>
  )

  const forceDeleteDialog = useConfirmationDialog({
    contentText: deleteDelegateDialogContent,
    titleText: getString('delegate.deleteDelegate'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: async (isConfirmed: boolean) => {
      /*istanbul ignore next */
      if (isConfirmed) {
        try {
          if (delegate?.delegateGroupIdentifier) {
            const deleted = await forceDeleteDelegate(delegate?.delegateGroupIdentifier)

            if (deleted) {
              /*istanbul ignore next */
              showSuccess(getString('delegates.delegateDeleted', { name: delegate?.groupName }))
            }
          }
        } catch (error) {
          showError(error.data?.responseMessages?.[0].message || error.message)
        }
      }
    }
  })

  const handleForceDelete = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    e.stopPropagation()
    setMenuOpen(false)
    forceDeleteDialog.openDialog()
  }

  return (
    <Layout.Horizontal className={css.itemActionContainer}>
      <Dialog
        isOpen={!!troubleshoterOpen}
        enforceFocus={false}
        style={{ width: '680px', height: '100%' }}
        onClose={() => setOpenTroubleshoter(undefined)}
      >
        <DelegateInstallationError showDelegateInstalledMessage={false} delegateType={delegate?.delegateType} />
      </Dialog>
      <Popover
        isOpen={menuOpen}
        onInteraction={nextOpenState => {
          setMenuOpen(nextOpenState)
        }}
        className={Classes.DARK}
        position={Position.RIGHT_TOP}
      >
        <Button
          minimal
          icon="Options"
          onClick={e => {
            e.stopPropagation()
            setMenuOpen(true)
          }}
          aria-label="delegate menu options"
        />
        <Menu style={{ minWidth: 'unset' }}>
          <RbacMenuItem
            permission={{
              resourceScope: {
                accountIdentifier: accountId,
                orgIdentifier,
                projectIdentifier
              },
              resource: {
                resourceType: ResourceType.DELEGATE,
                resourceIdentifier: delegate.delegateGroupIdentifier
              },
              permission: PermissionIdentifier.VIEW_DELEGATE
            }}
            icon="info-sign"
            text={getString('details')}
          />
          <RbacMenuItem
            permission={{
              resourceScope: {
                accountIdentifier: accountId,
                orgIdentifier,
                projectIdentifier
              },
              resource: {
                resourceType: ResourceType.DELEGATE,
                resourceIdentifier: delegate.delegateGroupIdentifier
              },
              permission: PermissionIdentifier.DELETE_DELEGATE
            }}
            icon="trash"
            text={getString('delete')}
            onClick={handleForceDelete}
          />
          {delegate.delegateType === 'KUBERNETES' && (
            <MenuItem
              text={getString('delegates.openTroubleshooter')}
              onClick={(e: React.MouseEvent) => {
                /*istanbul ignore next */
                e.stopPropagation()
                setOpenTroubleshoter({ isConnected: delegate.activelyConnected })
              }}
              icon="book"
            />
          )}
        </Menu>
      </Popover>
    </Layout.Horizontal>
  )
}

export const DelegateListingItem: React.FC<DelegateProps> = props => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, module } = useParams<Record<string, string>>()
  const history = useHistory()

  const [canAccessDelegate] = usePermission(
    {
      resourceScope: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      resource: {
        resourceType: ResourceType.DELEGATE
      },
      permissions: [PermissionIdentifier.VIEW_DELEGATE]
    },
    []
  )

  const onDelegateClick = (delegateId: string): void => {
    if (canAccessDelegate) {
      const params = {
        accountId,
        delegateIdentifier: delegateId as string
      }
      if (orgIdentifier) {
        set(params, 'orgIdentifier', orgIdentifier)
      }
      if (projectIdentifier) {
        set(params, 'projectIdentifier', projectIdentifier)
      }
      if (module) {
        set(params, 'module', module)
      }
      history.push(routes.toDelegatesDetails(params))
    }
  }

  const { USE_IMMUTABLE_DELEGATE } = useFeatureFlags()
  const columns = useMemo(() => {
    const columnsArray = USE_IMMUTABLE_DELEGATE
      ? [
          {
            Header: '',
            id: 'rowSelectOrExpander',
            width: '3%',
            Cell: ToggleAccordionCell
          },
          {
            Header: '',
            id: 'delegateIcon',
            width: '2%',
            Cell: RenderDelegateIcon
          },
          {
            Header: getString('delegate.DelegateName'),
            id: 'delegateName',
            width: '24%',
            Cell: RenderDelegateName
          },
          {
            Header: getString('tagsLabel'),
            id: 'tags',
            width: '15%',
            Cell: RenderTags
          },
          {
            Header: getString('version'),
            id: 'version',
            width: '11%',
            Cell: RenderVersion
          },
          {
            Header: getString('delegates.instanceStatus'),
            id: 'instanceStatus',
            width: '18%',
            Cell: RenderInstanceStatus
          },
          {
            Header: getString('delegate.LastHeartBeat'),
            id: 'heartbeat',
            width: '14%',
            Cell: RenderHeartbeat
          },
          {
            Header: getString('connectivityStatus'),
            id: 'connectivityStatus',
            width: '12%',
            Cell: RenderConnectivityStatus
          },
          {
            Header: '',
            id: 'actions',
            width: '1%',
            Cell: RenderColumnMenu
          }
        ]
      : [
          {
            Header: '',
            id: 'rowSelectOrExpander',
            width: '3%',
            Cell: ToggleAccordionCell
          },
          {
            Header: '',
            id: 'delegateIcon',
            width: '5%',
            Cell: RenderDelegateIcon
          },
          {
            Header: getString('delegate.DelegateName'),
            id: 'delegateName',
            width: '27%',
            Cell: RenderDelegateName
          },
          {
            Header: getString('tagsLabel'),
            id: 'tags',
            width: '15%',
            Cell: RenderTags
          },
          {
            Header: getString('version'),
            id: 'version',
            width: '15%',
            Cell: RenderVersion
          },

          {
            Header: getString('delegate.LastHeartBeat'),
            id: 'heartbeat',
            width: '15%',
            Cell: RenderHeartbeat
          },
          {
            Header: getString('connectivityStatus'),
            id: 'connectivityStatus',
            width: '15%',
            Cell: RenderConnectivityStatus
          },
          {
            Header: '',
            id: 'actions',
            width: '5%',
            Cell: RenderColumnMenu
          }
        ]
    return columnsArray
  }, [])

  const renderRowSubComponent = React.useCallback(
    ({ row }) => (
      <>
        <Layout.Horizontal className={css.podDetailsSeparator}></Layout.Horizontal>
        <DelegateInstanceList row={row}></DelegateInstanceList>
      </>
    ),
    []
  )

  return (
    <Layout.Horizontal width={'100%'}>
      <Table<DelegateGroupDetails>
        columns={columns}
        className={css.instanceTable}
        data={props?.data}
        onRowClick={(row: DelegateGroupDetails) => {
          onDelegateClick(defaultTo(row.delegateGroupIdentifier, ''))
        }}
        renderRowSubComponent={renderRowSubComponent}
      />
    </Layout.Horizontal>
  )
}
export default DelegateListingItem
