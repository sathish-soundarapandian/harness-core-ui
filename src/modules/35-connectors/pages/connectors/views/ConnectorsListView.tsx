/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useMemo } from 'react'
import {
  Text,
  Layout,
  Icon,
  Button,
  Popover,
  Container,
  useToaster,
  TagsPopover,
  TableV2,
  useConfirmationDialog,
  ButtonVariation,
  SelectOption,
  ListHeader,
  sortByCreated,
  sortByName,
  SortMethod,
  sortByLastModified
} from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import type { CellProps, Renderer, Column } from 'react-table'
import { Menu, Classes, Position, Intent, TextArea, Tooltip } from '@blueprintjs/core'
import { useParams, useHistory, useRouteMatch } from 'react-router-dom'
import ReactTimeago from 'react-timeago'
import classNames from 'classnames'
import { pick, defaultTo } from 'lodash-es'
import { HelpPanel, HelpPanelType } from '@harness/help-panel'
import { useStrings } from 'framework/strings'
import {
  ConnectorResponse,
  useDeleteConnector,
  PageConnectorResponse,
  ConnectorInfoDTO,
  ConnectorValidationResult,
  EntityGitDetails
} from 'services/cd-ng'

import type { UseCreateConnectorModalReturn } from '@connectors/modals/ConnectorModal/useCreateConnectorModal'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import routes from '@common/RouteDefinitions'
import { useEntityDeleteErrorHandlerDialog } from '@common/hooks/EntityDeleteErrorHandlerDialog/useEntityDeleteErrorHandlerDialog'
import type { IGitContextFormProps } from '@common/components/GitContextForm/GitContextForm'
import { useDefaultPaginationProps } from '@common/hooks/useDefaultPaginationProps'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { COMMON_DEFAULT_PAGE_SIZE } from '@common/constants/Pagination'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import FavoriteStar from '@common/components/FavoriteStar/FavoriteStar'
import { getIconByType, isSMConnector } from '../utils/ConnectorUtils'
import {
  CONNECTORS_PAGE_INDEX,
  CONNECTORS_PAGE_SIZE,
  getConnectorDisplaySummary
} from '../utils/ConnectorListViewUtils'
import ConnectivityStatus from './connectivityStatus/ConnectivityStatus'
import { ConnectorDetailsView } from '../utils/ConnectorHelper'
import css from './ConnectorsListView.module.scss'

interface ConnectorListViewProps {
  data?: PageConnectorResponse
  reload?: () => Promise<void>
  openConnectorModal: UseCreateConnectorModalReturn['openConnectorModal']
  forceDeleteSupported?: boolean
  onSortMethodChange?: (option: SelectOption) => void
  selectedSort?: SortMethod
}

type CustomColumn = Column<ConnectorResponse> & {
  reload?: () => Promise<void>
  forceDeleteSupported?: boolean
}

export type ErrorMessage = ConnectorValidationResult & { useErrorHandler?: boolean }

const connectorDetailsUrlWithGit = (url: string, gitInfo: EntityGitDetails = {}): string => {
  const urlForGit = `${url}?repoIdentifier=${gitInfo.repoIdentifier}&branch=${gitInfo.branch}`
  return gitInfo?.objectId ? urlForGit : url
}

export const RenderColumnConnector: Renderer<CellProps<ConnectorResponse>> = ({ row }) => {
  const data = row.original
  const tags = data.connector?.tags || {}
  const { getString } = useStrings()
  return (
    <Layout.Horizontal spacing="small">
      <Icon name={getIconByType(data.connector?.type)} size={30}></Icon>
      <div className={css.wrapper}>
        <Layout.Horizontal spacing="small">
          <div className={css.name} color={Color.BLACK} title={data.connector?.name}>
            {data.connector?.name}
          </div>
          {tags && Object.keys(tags).length ? <TagsPopover tags={tags} /> : null}
          {data.entityValidityDetails?.valid === false ? (
            <Tooltip
              position="bottom"
              content={
                <Layout.Horizontal flex={{ alignItems: 'baseline' }}>
                  <Icon name="warning-sign" color={Color.RED_600} size={12} margin={{ right: 'small' }} />
                  <Layout.Vertical>
                    <Text color={Color.WHITE} font={{ variation: FontVariation.SMALL }}>
                      {getString('common.gitSync.outOfSync', { entityType: 'Connector', name: data.connector?.name })}
                    </Text>
                    <Text color={Color.WHITE} font={{ variation: FontVariation.SMALL }}>
                      {getString('common.gitSync.fixAllErrors')}
                    </Text>
                  </Layout.Vertical>
                </Layout.Horizontal>
              }
            >
              <Icon name="warning-sign" color={Color.RED_600} size={16} padding={{ left: 'xsmall' }} />
            </Tooltip>
          ) : (
            <></>
          )}
        </Layout.Horizontal>
        <div className={css.identifier} title={data.connector?.identifier}>
          {`${getString('common.ID')}: ${data.connector?.identifier}`}
        </div>
      </div>
    </Layout.Horizontal>
  )
}
export const RenderColumnDetails: Renderer<CellProps<ConnectorResponse>> = ({ row }) => {
  const data = row.original

  return data.connector ? (
    <div className={css.wrapper}>
      <div color={Color.BLACK}>{getConnectorDisplaySummary(data.connector)}</div>
    </div>
  ) : null
}

export const RenderGitDetails: Renderer<CellProps<ConnectorResponse>> = ({ row }) => {
  const data = row.original
  return data.gitDetails ? (
    <div className={css.wrapper}>
      <Layout.Horizontal>
        <Container
          className={css.name}
          color={Color.BLACK}
          title={data.gitDetails?.repoIdentifier}
          padding={{ top: 'xsmall' }}
          margin={{ right: 'small' }}
        >
          {data.gitDetails?.repoIdentifier}
        </Container>
        {data.gitDetails?.branch && (
          <Layout.Horizontal
            border
            spacing="xsmall"
            padding={'xsmall'}
            background={Color.GREY_100}
            width={'fit-content'}
          >
            <Icon
              inline
              name="git-new-branch"
              size={12}
              margin={{ left: 'xsmall', top: 'xsmall' }}
              color={Color.GREY_700}
            ></Icon>
            <Text lineClamp={1} className={classNames(css.name, css.listingGitBranch)} color={Color.BLACK}>
              {data.gitDetails?.branch}
            </Text>
          </Layout.Horizontal>
        )}
      </Layout.Horizontal>
    </div>
  ) : null
}

export const RenderColumnLastUpdated: Renderer<CellProps<ConnectorResponse>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Horizontal spacing="small">
      {data.lastModifiedAt ? <ReactTimeago date={data.lastModifiedAt} /> : null}
    </Layout.Horizontal>
  )
}
const RenderColumnStatus: Renderer<CellProps<ConnectorResponse>> = ({ row }) => {
  const data = row.original
  return <ConnectivityStatus data={data} />
}
interface ConnectorMenuItemProps {
  connector: ConnectorResponse
  onSuccessfulDelete: () => void
  forceDeleteSupported: boolean
  switchToRefernceTab?: () => void
  openConnectorModal: UseCreateConnectorModalReturn['openConnectorModal']
}

export const ConnectorMenuItem: React.FC<ConnectorMenuItemProps> = ({
  connector,
  onSuccessfulDelete,
  forceDeleteSupported,
  switchToRefernceTab,
  openConnectorModal
}) => {
  const history = useHistory()
  const params = useParams<PipelineType<ProjectPathProps>>()
  const data = connector
  const gitDetails = data?.gitDetails ?? {}
  const isHarnessManaged = data.harnessManaged
  const { isGitSyncEnabled: isGitSyncEnabledForProject, gitSyncEnabledOnlyForFF } = useAppStore()
  const isGitSyncEnabled =
    isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF && !isSMConnector(connector.connector?.type)

  const [menuOpen, setMenuOpen] = useState(false)
  const { showSuccess, showError } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const { getString } = useStrings()
  const [commitMsg, setCommitMsg] = useState<string>(
    `${getString('connectors.confirmDeleteTitle')} ${data.connector?.name}`
  )
  const gitParams = gitDetails?.objectId
    ? {
        ...pick(gitDetails, ['branch', 'repoIdentifier', 'filePath', 'rootFolder']),
        commitMsg,
        lastObjectId: gitDetails.objectId
      }
    : {}
  const { mutate: deleteConnector } = useDeleteConnector({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier,
      projectIdentifier: projectIdentifier,
      ...gitParams
    }
  })

  const getConfirmationDialogContent = (): JSX.Element => {
    return (
      <div className={'connectorDeleteDialog'}>
        <Text margin={{ bottom: 'medium' }} className={css.confirmText} title={data.connector?.name}>{`${getString(
          'connectors.confirmDelete'
        )} ${data.connector?.name}?`}</Text>
        {gitDetails?.objectId && (
          <>
            <Text>{getString('common.git.commitMessage')}</Text>
            <TextArea
              value={commitMsg}
              onInput={(event: React.ChangeEvent<HTMLTextAreaElement>) => {
                setCommitMsg(event.target.value)
              }}
            />
          </>
        )}
      </div>
    )
  }

  const deleteHandler = async (forceDelete?: boolean): Promise<void> => {
    try {
      const deleted = await deleteConnector(data.connector?.identifier || '', {
        headers: { 'content-type': 'application/json' },
        queryParams: { forceDelete: Boolean(forceDelete) }
      })

      if (deleted) {
        showSuccess(getString('connectors.deletedSuccssMessage', { name: data.connector?.name }))

        onSuccessfulDelete()
      }
    } catch (err) {
      handleConnectorDeleteError(err?.data.code, defaultTo(err?.data?.message, err?.message))
    }
  }
  const isListPage = useRouteMatch(routes.toConnectors({ accountId, projectIdentifier, orgIdentifier }))

  const redirectToReferencedBy = (): void => {
    if (isListPage?.isExact) {
      history.push({
        pathname: routes.toConnectorDetails({
          ...params,
          connectorId: data.connector?.identifier
        }),
        search: `?view=${ConnectorDetailsView.referencedBy}`
      })
    } else {
      closeDialog()
      switchToRefernceTab?.()
    }
  }
  const { openDialog: openReferenceErrorDialog, closeDialog } = useEntityDeleteErrorHandlerDialog({
    entity: {
      type: ResourceType.CONNECTOR,
      name: defaultTo(data.connector?.name, '')
    },
    redirectToReferencedBy: redirectToReferencedBy,
    forceDeleteCallback: forceDeleteSupported ? () => deleteHandler(true) : undefined
  })

  const handleConnectorDeleteError = (code: string, message: string): void => {
    if (code === 'ENTITY_REFERENCE_EXCEPTION') {
      openReferenceErrorDialog()
    } else {
      showError(message)
    }
  }

  const { openDialog } = useConfirmationDialog({
    contentText: getConfirmationDialogContent(),
    titleText: getString('connectors.confirmDeleteTitle'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: (isConfirmed: boolean) => {
      if (isConfirmed) {
        deleteHandler()
      }
    }
  })

  const handleDelete = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    e.stopPropagation()
    setMenuOpen(false)
    if (!data?.connector?.identifier) {
      return
    }
    openDialog()
  }

  const handleEdit = (e: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    const isEntityInvalid = data.entityValidityDetails?.valid === false
    e.stopPropagation()
    setMenuOpen(false)
    if (!data?.connector?.identifier) {
      return
    }
    if (!isEntityInvalid) {
      openConnectorModal(true, connector?.connector?.type as ConnectorInfoDTO['type'], {
        connectorInfo: connector?.connector,
        gitDetails: connector?.gitDetails as IGitContextFormProps,
        status: connector?.status
      })
    } else {
      const url = routes.toConnectorDetails({ ...params, connectorId: data.connector?.identifier })
      history.push(connectorDetailsUrlWithGit(url, connector?.gitDetails))
    }
  }

  return !isHarnessManaged && // if isGitSyncEnabled then gitobjectId should also be there to support edit/delete
    !isGitSyncEnabled === !gitDetails?.objectId ? (
    <Layout.Horizontal className={css.layout}>
      <Popover
        isOpen={menuOpen}
        onInteraction={nextOpenState => {
          setMenuOpen(nextOpenState)
        }}
        className={Classes.DARK}
        position={Position.RIGHT_TOP}
      >
        <Button
          variation={ButtonVariation.ICON}
          icon="Options"
          aria-label="connector menu actions"
          onClick={e => {
            e.stopPropagation()
            setMenuOpen(true)
          }}
        />
        <Menu
          style={{ minWidth: 'unset' }}
          onClick={e => {
            e.stopPropagation()
          }}
        >
          <RbacMenuItem
            icon="edit"
            text="Edit"
            onClick={handleEdit}
            permission={{
              resource: {
                resourceType: ResourceType.CONNECTOR,
                resourceIdentifier: data.connector?.identifier || ''
              },
              permission: PermissionIdentifier.UPDATE_CONNECTOR
            }}
          />
          <RbacMenuItem
            icon="trash"
            text="Delete"
            onClick={handleDelete}
            permission={{
              resource: {
                resourceType: ResourceType.CONNECTOR,
                resourceIdentifier: data.connector?.identifier || ''
              },
              permission: PermissionIdentifier.DELETE_CONNECTOR
            }}
          />
        </Menu>
      </Popover>
    </Layout.Horizontal>
  ) : (
    <></>
  )
}

export const RenderColumnMenu: Renderer<CellProps<ConnectorResponse>> = ({ row, column }) => {
  return (
    <Layout.Horizontal>
      {row.original.connector?.identifier && (
        <FavoriteStar
          resourceId={row.original.connector?.identifier}
          resourceType="CONNECTOR"
          isFavorite={row.original.isFavorite}
          scope={{
            projectIdentifier: row.original.connector.projectIdentifier,
            orgIdentifier: row.original.connector.orgIdentifier
          }}
          className={css.favoriteStar}
          activeClassName={css.favorite}
        />
      )}
      <ConnectorMenuItem
        connector={row.original}
        onSuccessfulDelete={(column as any).reload}
        forceDeleteSupported={(column as any).forceDeleteSupported}
        openConnectorModal={(column as any).openConnectorModal}
      />
    </Layout.Horizontal>
  )
}

const ConnectorsListView: React.FC<ConnectorListViewProps> = props => {
  const { data, reload, forceDeleteSupported = false, selectedSort, onSortMethodChange } = props
  const params = useParams<PipelineType<ProjectPathProps>>()
  const history = useHistory()
  const { getString } = useStrings()
  const { PL_NEW_PAGE_SIZE } = useFeatureFlags()
  const { isGitSyncEnabled: isGitSyncEnabledForProject, gitSyncEnabledOnlyForFF } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const listData: ConnectorResponse[] = useMemo(() => data?.content || [], [data?.content])

  const columns: CustomColumn[] = useMemo(
    () => [
      {
        Header: getString('connector').toUpperCase(),
        accessor: row => row.connector?.name,
        id: 'name',
        width: isGitSyncEnabled ? '25%' : '33%',
        Cell: RenderColumnConnector
      },
      {
        Header: getString('details').toUpperCase(),
        accessor: row => row.connector?.description,
        id: 'details',
        width: '25%',
        Cell: RenderColumnDetails
      },
      {
        Header: getString('common.gitSync.repoDetails').toUpperCase(),
        accessor: row => row.connector?.identifier,
        id: 'gitDetails',
        width: '20%',
        Cell: RenderGitDetails
      },
      {
        Header: getString('connectivityStatus').toUpperCase(),
        accessor: 'status',
        id: 'status',
        width: '19%',
        Cell: RenderColumnStatus
      },
      {
        Header: getString('lastUpdated').toUpperCase(),
        accessor: 'lastModifiedAt',
        id: 'lastModifiedAt',
        width: isGitSyncEnabled ? '6%' : '22%',
        Cell: RenderColumnLastUpdated
      },
      {
        Header: '',
        accessor: row => row.connector?.identifier,
        width: '5%',
        id: 'action',
        Cell: RenderColumnMenu,
        openConnectorModal: props.openConnectorModal,
        reload: reload,
        disableSortBy: true,
        forceDeleteSupported: forceDeleteSupported
      }
    ],
    [props.openConnectorModal, reload, isGitSyncEnabled]
  )

  if (!isGitSyncEnabled) {
    columns.splice(2, 1)
  }

  const paginationProps = useDefaultPaginationProps({
    pageIndex: data?.pageIndex || CONNECTORS_PAGE_INDEX,
    pageSize: data?.pageSize || (PL_NEW_PAGE_SIZE ? COMMON_DEFAULT_PAGE_SIZE : CONNECTORS_PAGE_SIZE),
    itemCount: data?.totalItems || 0,
    pageCount: data?.totalPages || -1
  })

  return (
    <>
      <HelpPanel referenceId="connectors" type={HelpPanelType.FLOATING_CONTAINER} />
      {selectedSort && onSortMethodChange && (
        <ListHeader
          selectedSortMethod={selectedSort}
          sortOptions={[...sortByLastModified, ...sortByCreated, ...sortByName]}
          onSortMethodChange={onSortMethodChange}
          totalCount={data?.totalItems}
        />
      )}
      <TableV2<ConnectorResponse>
        className={css.table}
        columns={columns}
        data={listData}
        name="ConnectorsListView"
        getRowClassName={() => css.row}
        onRowClick={connector => {
          const url = routes.toConnectorDetails({ ...params, connectorId: connector.connector?.identifier })
          history.push(connectorDetailsUrlWithGit(url, connector.gitDetails))
        }}
        pagination={paginationProps}
      />
    </>
  )
}

export default ConnectorsListView
