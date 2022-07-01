/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Classes, Menu, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { Color, FontVariation } from '@harness/design-system'
import {
  Button,
  Container,
  Icon,
  Layout,
  Popover,
  SparkChart,
  TableV2,
  TagsPopover,
  Text,
  useToggleOpen
} from '@harness/uicore'
import React from 'react'
import { Link, useParams } from 'react-router-dom'
import type { CellProps, Column, Renderer } from 'react-table'
import { StoreType } from '@common/constants/GitSyncTypes'
import { formatDatetoLocale, getReadableDateTime } from '@common/utils/dateUtils'
import { formatCount } from '@common/utils/utils'
import { useRunPipelineModal } from '@pipeline/components/RunPipelineModal/useRunPipelineModal'
import { Badge } from '@pipeline/pages/utils/Badge/Badge'
import useDeleteConfirmationDialog from '@pipeline/pages/utils/DeleteConfirmDialog'
import { getFeaturePropsForRunPipelineButton } from '@pipeline/utils/runPipelineUtils'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import { usePermission } from '@rbac/hooks/usePermission'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import type { PagePMSPipelineSummaryResponse, PMSPipelineSummaryResponse } from 'services/pipeline-ng'
import { getStatusColor } from '../PipelineListUtils'
import { ClonePipelineForm } from './ClonePipelineForm/ClonePipelineForm'
import css from '../PipelinesPage.module.scss'
import { TimeAgo } from '@common/exports'
import ReactTimeago from 'react-timeago'
import { StatusHeatMap } from '@pipeline/components/StatusHeatMap/StatusHeatMap'
import defaultTo from 'lodash-es/defaultTo'

interface PipelineListViewProps {
  data?: PagePMSPipelineSummaryResponse
  gotoPage: (pageNumber: number) => void
  goToPipelineDetail: (pipeline?: PMSPipelineSummaryResponse) => void
  goToPipelineStudio: (pipeline?: PMSPipelineSummaryResponse) => void
  refetchPipeline: () => void
  onDeletePipeline: (commitMsg: string) => Promise<void>
  onDelete: (pipeline: PMSPipelineSummaryResponse) => void
}

// Todo: Remove this when BE updated
export interface PipelineDTO extends PMSPipelineSummaryResponse {
  admin?: string
  collaborators?: string
  status?: string
}

type CustomColumn<T extends Record<string, any>> = Column<T> & {
  goToPipelineStudio?: (pipeline?: PMSPipelineSummaryResponse) => void
  goToPipelineDetail?: (pipeline?: PMSPipelineSummaryResponse) => void
  refetchPipeline?: () => void
}

// eslint-disable-next-line react/function-component-definition
const RenderColumnMenu: Renderer<CellProps<PipelineDTO>> = ({ row, column }) => {
  const data = row.original
  const [menuOpen, setMenuOpen] = React.useState(false)
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const { confirmDelete } = useDeleteConfirmationDialog(data, 'pipeline', (column as any).onDeletePipeline)
  const { isGitSyncEnabled, isGitSimplificationEnabled } = useAppStore()
  const [canDelete, canRun] = usePermission(
    {
      resourceScope: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      resource: {
        resourceType: ResourceType.PIPELINE,
        resourceIdentifier: data.identifier as string
      },
      permissions: [PermissionIdentifier.DELETE_PIPELINE, PermissionIdentifier.EXECUTE_PIPELINE]
    },
    [data.identifier]
  )

  const runPipeline = (): void => {
    openRunPipelineModal()
  }

  const { openRunPipelineModal } = useRunPipelineModal({
    pipelineIdentifier: (data.identifier || '') as string,
    repoIdentifier: isGitSyncEnabled ? data.gitDetails?.repoIdentifier : data.gitDetails?.repoName,
    branch: data.gitDetails?.branch,
    connectorRef: data.connectorRef,
    storeType: data.storeType as StoreType
  })

  const {
    open: openClonePipelineModal,
    isOpen: isClonePipelineModalOpen,
    close: closeClonePipelineModal
  } = useToggleOpen()

  function handleCloseClonePipelineModal(e?: React.SyntheticEvent): void {
    e?.stopPropagation()
    closeClonePipelineModal()
  }

  return (
    <Layout.Horizontal style={{ justifyContent: 'flex-end' }}>
      <Popover
        isOpen={menuOpen}
        onInteraction={nextOpenState => {
          setMenuOpen(nextOpenState)
        }}
        className={Classes.DARK}
        position={Position.BOTTOM_RIGHT}
      >
        <Button
          minimal
          className={css.actionButton}
          icon="more"
          onClick={e => {
            e.stopPropagation()
            setMenuOpen(true)
          }}
        />
        <Menu style={{ minWidth: 'unset' }} onClick={e => e.stopPropagation()}>
          <RbacMenuItem
            icon="play"
            text={getString('runPipelineText')}
            disabled={!canRun || data?.entityValidityDetails?.valid === false}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              runPipeline()
            }}
            featuresProps={getFeaturePropsForRunPipelineButton({ modules: data.modules, getString })}
          />
          <Menu.Item
            icon="cog"
            text={getString('viewPipeline')}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              ;(column as any).goToPipelineStudio(data)
              setMenuOpen(false)
            }}
          />
          <Menu.Item
            icon="list-detail-view"
            text={getString('viewExecutions')}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              ;(column as any).goToPipelineDetail(data)
              setMenuOpen(false)
            }}
          />
          <Menu.Divider />
          <Menu.Item
            icon="duplicate"
            text={getString('projectCard.clone')}
            disabled={isGitSyncEnabled || isGitSimplificationEnabled}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              openClonePipelineModal()
            }}
          />
          <Menu.Item
            icon="trash"
            text={getString('delete')}
            disabled={!canDelete}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              ;(column as any).onDelete(data)
              confirmDelete()
              setMenuOpen(false)
            }}
          />
        </Menu>
      </Popover>
      <ClonePipelineForm
        isOpen={isClonePipelineModalOpen}
        onClose={handleCloseClonePipelineModal}
        originalPipeline={data}
      />
    </Layout.Horizontal>
  )
}

// eslint-disable-next-line react/function-component-definition
const RenderColumnPipeline: Renderer<CellProps<PipelineDTO>> = ({ row }) => {
  const data = row.original
  const { getString } = useStrings()
  return (
    <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }}>
      <Layout.Vertical spacing="xsmall" data-testid={data.identifier}>
        <Layout.Horizontal spacing="medium">
          <Link target="_blank" to="/">
            <Text
              font={{ variation: FontVariation.BODY2 }}
              color={Color.GREY_800}
              tooltipProps={{ isDark: true }}
              tooltip={
                <Layout.Vertical spacing="medium" padding="medium" style={{ maxWidth: 400 }}>
                  <Text color={Color.WHITE}>{getString('nameLabel', { name: data.name })}</Text>
                  <Text color={Color.WHITE}>{getString('idLabel', { id: data.identifier })}</Text>
                  <Text color={Color.WHITE}>{getString('descriptionLabel', { description: data.description })}</Text>
                </Layout.Vertical>
              }
            >
              {data.name}
            </Text>
          </Link>

          {data.tags && Object.keys(data.tags || {}).length ? <TagsPopover tags={data.tags} /> : null}
        </Layout.Horizontal>
        <Text tooltipProps={{ position: Position.BOTTOM }} color={Color.GREY_400} font="small">
          {getString('idLabel', { id: data.identifier })}
        </Text>
      </Layout.Vertical>
      {data?.entityValidityDetails?.valid === false && (
        <Container margin={{ left: 'large' }}>
          <Badge
            text={'common.invalid'}
            iconName="error-outline"
            showTooltip={true}
            entityName={data.name}
            entityType={'Pipeline'}
          />
        </Container>
      )}
    </Layout.Horizontal>
  )
}

// eslint-disable-next-line react/function-component-definition
const RenderStoreTypeColumn: Renderer<CellProps<PipelineDTO>> = ({ row }) => {
  const { gitDetails } = row.original
  const { getString } = useStrings()
  const type = StoreType.INLINE
  const storeType = type === StoreType.INLINE ? getString('inline') : getString('repository')
  const storeTypeIcon = StoreType.INLINE ? 'repository' : 'remote-setup'

  return (
    <div className={css.storeTypeColumnContainer}>
      <div className={css.storeTypeColumn}>
        <Icon name={storeTypeIcon} size={16} color={Color.GREY_800} />
        <Text
          margin={{ left: 'xsmall' }}
          font={{ variation: FontVariation.SMALL }}
          color={Color.GREY_800}
          tooltipProps={{ isDark: true }}
          tooltip={
            <Layout.Vertical spacing="medium" padding="medium" style={{ maxWidth: 400 }}>
              <Layout.Horizontal spacing="medium">
                <Icon name="github" size={16} color={Color.WHITE} />
                <Text color={Color.WHITE}>{gitDetails?.repoName || gitDetails?.repoIdentifier}</Text>
              </Layout.Horizontal>
              <Layout.Horizontal spacing="medium">
                <Icon name="file" size={16} color={Color.WHITE} />
                <Text color={Color.WHITE}>{gitDetails?.filePath}</Text>
              </Layout.Horizontal>
            </Layout.Vertical>
          }
        >
          {storeType}
        </Text>
      </div>
    </div>
  )
}

// eslint-disable-next-line react/function-component-definition
const RenderActivity: Renderer<CellProps<PipelineDTO>> = ({ row, column }) => {
  const data = row.original

  const deployments = data.executionSummaryInfo?.deployments?.reduce((acc, val) => acc + val, 0) || 0
  const { getString } = useStrings()

  return (
    <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
      <div>
        <Text color={Color.GREY_600} className={`${deployments ? css.clickable : ''}`} lineClamp={2}>
          {getString('executionsText')}
        </Text>
        <Text
          color={deployments ? Color.PRIMARY_7 : Color.GREY_600}
          className={`${deployments ? css.clickable : ''}`}
          onClick={event => {
            event.stopPropagation()
            ;(column as any).goToPipelineDetail(data)
          }}
          font="small"
          lineClamp={2}
          style={{ maxWidth: 100 }}
        >
          ({getString('pipeline.lastSevenDays')})
        </Text>
      </div>

      <Text color={Color.GREY_600} font="medium" iconProps={{ size: 18 }}>
        {formatCount(deployments)}
      </Text>

      {deployments ? (
        <span className={css.activityChart}>
          <SparkChart
            data={data.executionSummaryInfo?.deployments || []}
            data2={data.executionSummaryInfo?.numOfErrors || []}
            color={Color.GREEN_500}
            color2={Color.RED_600}
          />
        </span>
      ) : (
        <Text font={{ size: 'xsmall' }}>{getString('emptyDeployments')}</Text>
      )}
    </Layout.Horizontal>
  )
}

// eslint-disable-next-line react/function-component-definition
const RenderRecentExecutions: Renderer<CellProps<PipelineDTO>> = () => {
  const statuses = [
    'skipped',
    'queued',
    'errored',
    'suspended',
    'success',
    'ignorefailed',
    'running',
    'resourcewaiting',
    'inputwaiting',
    'paused'
  ]
  const executions = Array(10)
    .fill({})
    .map((_, index) => ({
      executionId: index.toString(),
      status: index < 6 ? 'success' : statuses[Math.floor(Math.random() * statuses.length)]
    }))
  return (
    <StatusHeatMap
      data={executions}
      getId={i => defaultTo(i.executionId, '')}
      getStatus={i => defaultTo(i.status, '')}
      getPopoverProps={i => ({
        position: Position.BOTTOM,
        interactionKind: PopoverInteractionKind.HOVER,
        content: (
          <Layout.Vertical padding="medium" spacing="small">
            <Text color={Color.WHITE}>Execution Id: {i.executionId}</Text>
            <Text color={Color.WHITE}>Status: {i.status}</Text>
          </Layout.Vertical>
        ),

        className: Classes.DARK
      })}
    />
  )
}

// eslint-disable-next-line react/function-component-definition
const RenderLastExecution: Renderer<CellProps<PipelineDTO>> = ({ row }) => {
  const data = row.original
  const lastExecutionTs = data.executionSummaryInfo?.lastExecutionTs
  return (
    <Layout.Horizontal spacing="small" style={{ alignItems: 'center' }}>
      <div className={css.avatar}>O</div>
      <Layout.Vertical spacing="small">
        <Text color={Color.GREY_600}>OliviaLee@gmail.com</Text>
        <Text font={{ size: 'small' }} color={Color.GREY_400}>
          {lastExecutionTs ? <ReactTimeago date={lastExecutionTs} /> : 'This pipeline never ran'}
        </Text>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

// eslint-disable-next-line react/function-component-definition
const RenderLastModified: Renderer<CellProps<PipelineDTO>> = ({ row }) => {
  const data = row.original
  return <Text color={Color.GREY_600}>{getReadableDateTime(data.lastUpdatedAt)}</Text>
}

export function PipelineListView({
  data,
  goToPipelineDetail,
  gotoPage,
  refetchPipeline,
  goToPipelineStudio,
  onDeletePipeline,
  onDelete
}: PipelineListViewProps): React.ReactElement {
  const { getString } = useStrings()
  const { isGitSyncEnabled } = useAppStore()
  const columns: CustomColumn<PipelineDTO>[] = React.useMemo(
    () => [
      {
        Header: getString('pipelineName').toUpperCase(),
        accessor: 'name',
        width: '20%',
        Cell: RenderColumnPipeline
      },
      {
        Header: '',
        accessor: 'storeType',
        width: '10%',
        disableSortBy: true,
        Cell: RenderStoreTypeColumn
      },
      {
        Header: getString('recentTenExecutions').toUpperCase(),
        accessor: 'executionSummaryInfo',
        width: '30%',
        Cell: RenderRecentExecutions,
        disableSortBy: true,
        goToPipelineDetail
      },
      {
        Header: getString('lastExecution').toUpperCase(),
        accessor: 'description',
        width: '20%',
        Cell: RenderLastExecution
      },
      {
        Header: getString('lastModified').toUpperCase(),
        accessor: 'lastUpdatedAt',
        width: '15%',
        Cell: RenderLastModified
      },
      {
        Header: '',
        accessor: 'version',
        width: '5%',
        Cell: RenderColumnMenu,
        disableSortBy: true,
        refetchPipeline,
        goToPipelineStudio,
        goToPipelineDetail,
        onDeletePipeline,
        onDelete
      }
    ],
    [refetchPipeline, goToPipelineStudio, isGitSyncEnabled]
  )

  return (
    <TableV2<PipelineDTO>
      className={css.table}
      columns={columns}
      data={data?.content || []}
      onRowClick={item => goToPipelineStudio(item)}
      pagination={{
        itemCount: data?.totalElements || 0,
        pageSize: data?.size || 10,
        pageCount: data?.totalPages || -1,
        pageIndex: data?.number || 0,
        gotoPage
      }}
    />
  )
}
