/* eslint-disable react/function-component-definition */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Classes, Menu, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { Color, FontVariation } from '@harness/design-system'
import { Button, Icon, Layout, Popover, Text, Container, TagsPopover } from '@harness/uicore'
import defaultTo from 'lodash-es/defaultTo'
import { useParams, Link } from 'react-router-dom'
import type { CellProps, Renderer } from 'react-table'
import ReactTimeago from 'react-timeago'
import React, { ReactNode } from 'react'
import cx from 'classnames'
import { StoreType } from '@common/constants/GitSyncTypes'
import routes from '@common/RouteDefinitions'
import { useRunPipelineModal } from '@pipeline/components/RunPipelineModal/useRunPipelineModal'
import { StatusHeatMap } from '@pipeline/components/StatusHeatMap/StatusHeatMap'
import useDeleteConfirmationDialog from '@pipeline/pages/utils/DeleteConfirmDialog'
import { getFeaturePropsForRunPipelineButton } from '@pipeline/utils/runPipelineUtils'
import RbacMenuItem from '@rbac/components/MenuItem/MenuItem'
import { usePermission } from '@rbac/hooks/usePermission'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import { Badge } from '@pipeline/pages/utils/Badge/Badge'
import { getReadableDateTime } from '@common/utils/dateUtils'
import type { ExecutorInfoDTO, PMSPipelineSummaryResponse, RecentExecutionInfoDTO } from 'services/pipeline-ng'
import ExecutionStatusLabel from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'
import { ExecutionStatus, ExecutionStatusEnum } from '@pipeline/utils/statusHelpers'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { mapTriggerTypeToStringID } from '@pipeline/utils/triggerUtils'
import { getRouteProps } from '../PipelineListUtils'
import type { PipelineListPagePathParams } from '../types'
import css from './PipelineListTable.module.scss'

const LabeValue = ({ label, value }: { label: string; value: ReactNode }) => {
  return (
    <Layout.Horizontal spacing="xsmall">
      <Text color={Color.GREY_200} font={{ variation: FontVariation.SMALL_SEMI }}>
        {label}:
      </Text>
      <Text color={Color.WHITE} font={{ variation: FontVariation.SMALL }}>
        {value}
      </Text>
    </Layout.Horizontal>
  )
}

type CellType = Renderer<CellProps<PMSPipelineSummaryResponse>>

export const PipelineNameCell: CellType = ({ row }) => {
  const data = row.original
  const { getString } = useStrings()
  const pathParams = useParams<PipelineListPagePathParams>()

  return (
    <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'start' }}>
      <Layout.Vertical spacing="xsmall" data-testid={data.identifier}>
        <Layout.Horizontal spacing="small" flex={{ alignItems: 'center' }}>
          <Link to={routes.toPipelineStudio(getRouteProps(pathParams, data))}>
            <Text
              font={{ size: 'normal' }}
              color={Color.PRIMARY_7}
              tooltipProps={{ isDark: true }}
              tooltip={
                <Layout.Vertical spacing="medium" padding="large" style={{ maxWidth: 400 }}>
                  <LabeValue label={getString('name')} value={data.name} />
                  <LabeValue label={getString('common.ID')} value={data.identifier} />
                  {data.description && <LabeValue label={getString('description')} value={data.description} />}
                </Layout.Vertical>
              }
            >
              {data.name}
            </Text>
          </Link>
          {data.tags && Object.keys(data.tags || {}).length ? (
            <TagsPopover
              tags={data.tags}
              iconProps={{ size: 12, color: Color.GREY_600 }}
              popoverProps={{ className: Classes.DARK }}
              className={css.tags}
            />
          ) : null}
        </Layout.Horizontal>
        <Text color={Color.GREY_600} font="xsmall">
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

      {data.isDraft && (
        <div className={css.draft}>
          <Text font={{ variation: FontVariation.SMALL_SEMI }} color={Color.GREY_400}>
            {getString('pipeline.draft')}
          </Text>
        </div>
      )}
    </Layout.Horizontal>
  )
}

export const CodeSourceCell: CellType = ({ row }) => {
  const { gitDetails } = row.original
  const { getString } = useStrings()
  const data = row.original
  const isRemote = data.storeType === StoreType.REMOTE

  return (
    <div className={css.storeTypeColumnContainer}>
      <Popover
        disabled={!isRemote}
        position={Position.TOP}
        interactionKind={PopoverInteractionKind.HOVER}
        className={Classes.DARK}
        content={
          <Layout.Vertical spacing="small" padding="large" style={{ maxWidth: 400 }}>
            <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'start' }}>
              <Icon name="github" size={14} color={Color.GREY_200} />
              <Text color={Color.WHITE} font={{ variation: FontVariation.SMALL }}>
                {gitDetails?.repoName || gitDetails?.repoIdentifier}
              </Text>
            </Layout.Horizontal>
            <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'start' }}>
              <Icon name="remotefile" size={14} color={Color.GREY_200} />
              <Text color={Color.WHITE} font={{ variation: FontVariation.SMALL }}>
                {gitDetails?.filePath}
              </Text>
            </Layout.Horizontal>
          </Layout.Vertical>
        }
      >
        <div className={css.storeTypeColumn}>
          <Icon name={isRemote ? 'remote-setup' : 'repository'} size={isRemote ? 12 : 10} color={Color.GREY_600} />
          <Text margin={{ left: 'xsmall' }} font={{ variation: FontVariation.TINY_SEMI }} color={Color.GREY_600}>
            {isRemote ? getString('repository') : getString('inline')}
          </Text>
        </div>
      </Popover>
    </div>
  )
}

export const LastExecutionCell: CellType = ({ row }) => {
  const { getString } = useStrings()
  const pathParams = useParams<PipelineType<PipelineListPagePathParams>>()
  const data = row.original
  const recentExecution: RecentExecutionInfoDTO = data.recentExecutionsInfo?.[0] || {}
  const { startTs, executorInfo } = recentExecution
  const executor = executorInfo?.email || executorInfo?.username
  const autoTriggers: ExecutorInfoDTO['triggerType'][] = ['WEBHOOK_CUSTOM', 'SCHEDULER_CRON']
  const isAutoTrigger = autoTriggers.includes(executorInfo?.triggerType)

  return (
    <Layout.Horizontal spacing="small" style={{ alignItems: 'center' }}>
      <div className={cx(css.trigger, !isAutoTrigger && css.avatar, !executor && css.hidden)}>
        {isAutoTrigger ? (
          <Link
            to={routes.toTriggersDetailPage({
              ...getRouteProps(pathParams, data),
              triggerIdentifier: executorInfo?.username || ''
            })}
          >
            <Icon
              size={16}
              name={executorInfo?.triggerType === 'SCHEDULER_CRON' ? 'stopwatch' : 'trigger-execution'}
              aria-label="trigger"
            />
          </Link>
        ) : (
          executor?.charAt(0)
        )}
      </div>
      <Layout.Vertical spacing="xsmall">
        {executor && (
          <Text color={Color.GREY_900} font={{ variation: FontVariation.SMALL }}>
            {executor}
          </Text>
        )}
        {startTs ? (
          <Text color={Color.GREY_600} font={{ variation: FontVariation.TINY }}>
            <ReactTimeago date={startTs} />
          </Text>
        ) : (
          <Text color={Color.GREY_400} font={{ variation: FontVariation.SMALL }}>
            {startTs ? <ReactTimeago date={startTs} /> : getString('pipeline.neverRan')}
          </Text>
        )}
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

export const LastModifiedCell: CellType = ({ row }) => {
  const data = row.original
  return (
    <Text color={Color.GREY_900} font={{ size: 'small' }}>
      {getReadableDateTime(data.lastUpdatedAt)}
    </Text>
  )
}

export const MenuCell: CellType = ({ row, column }) => {
  const data = row.original
  const pathParams = useParams<PipelineListPagePathParams>()
  const [menuOpen, setMenuOpen] = React.useState(false)
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const { confirmDelete } = useDeleteConfirmationDialog(data, 'pipeline', (column as any).onDeletePipeline)
  const {
    isGitSyncEnabled: isGitSyncEnabledForProject,
    gitSyncEnabledOnlyForFF,
    supportingGitSimplification
  } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
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

  return (
    <Layout.Horizontal style={{ justifyContent: 'flex-end' }}>
      <Popover
        isOpen={menuOpen}
        onInteraction={nextOpenState => {
          setMenuOpen(nextOpenState)
        }}
        className={Classes.DARK}
        position={Position.LEFT}
      >
        <Button minimal icon="Options" onClick={() => setMenuOpen(true)} />
        <Menu style={{ minWidth: 'unset', backgroundColor: 'unset' }}>
          <RbacMenuItem
            icon="play"
            text={getString('runPipelineText')}
            disabled={!canRun || data?.entityValidityDetails?.valid === false}
            onClick={runPipeline}
            featuresProps={getFeaturePropsForRunPipelineButton({ modules: data.modules, getString })}
          />
          <Menu.Item
            className={css.link}
            icon="cog"
            text={
              <Link to={routes.toPipelineStudio(getRouteProps(pathParams, data))}>
                {getString('pipeline.viewPipeline')}
              </Link>
            }
          />
          <Menu.Item
            className={css.link}
            icon="list-detail-view"
            text={
              <Link to={routes.toPipelineDeploymentList(getRouteProps(pathParams, data))}>
                {getString('viewExecutions')}
              </Link>
            }
          />
          <Menu.Divider />
          <Menu.Item
            icon="duplicate"
            text={getString('projectCard.clone')}
            disabled={isGitSyncEnabled || supportingGitSimplification}
            onClick={() => {
              ;(column as any).onClonePipeline(data)
              setMenuOpen(false)
            }}
          />
          <Menu.Item
            icon="trash"
            text={getString('delete')}
            disabled={!canDelete}
            onClick={() => {
              ;(column as any).onDelete(data)
              confirmDelete()
              setMenuOpen(false)
            }}
          />
        </Menu>
      </Popover>
    </Layout.Horizontal>
  )
}

export const RecentExecutionsCell: CellType = ({ row }) => {
  const { getString } = useStrings()
  const data = row.original
  let recentExecutions = data.recentExecutionsInfo || []
  const { projectIdentifier, orgIdentifier, accountId, module, source } =
    useParams<PipelineType<PipelineListPagePathParams>>()

  // Fill the size to adopt UX that always displays 10 items
  if (recentExecutions.length < 10) {
    const fillExecutions = Array(10 - recentExecutions.length).fill({ status: ExecutionStatusEnum.NotStarted })
    recentExecutions = [...recentExecutions, ...fillExecutions]
  }

  const getLinkProps = (executionIdentifier: string) => ({
    to: routes.toExecutionPipelineView({
      orgIdentifier,
      pipelineIdentifier: data.identifier || '',
      projectIdentifier,
      executionIdentifier,
      accountId,
      module,
      source: source || 'deployments'
    }),
    'aria-label': `Execution ${executionIdentifier}`
  })

  return (
    <StatusHeatMap
      className={css.recentExecutions}
      data={recentExecutions}
      getId={(i, index) => defaultTo(i.planExecutionId, index)}
      getStatus={i => i.status as ExecutionStatus}
      getLinkProps={i => (i.planExecutionId ? getLinkProps(i.planExecutionId) : undefined)}
      getPopoverProps={i => ({
        position: Position.TOP,
        interactionKind: PopoverInteractionKind.HOVER,
        content: (
          <Layout.Vertical padding="large" spacing="medium">
            <div className={css.statusLabel}>
              <ExecutionStatusLabel status={i.status as ExecutionStatus} />
            </div>
            {i.startTs && (
              <>
                <LabeValue label={getString('pipeline.executionId')} value={i.runSequence || i.planExecutionId} />
                <LabeValue
                  label={getString('common.executedBy')}
                  value={
                    <Layout.Horizontal spacing="xsmall" color={Color.WHITE} font="normal">
                      <span>{i.executorInfo?.email || i.executorInfo?.username}</span>
                      <span>|</span>
                      <ReactTimeago date={i.startTs} />
                    </Layout.Horizontal>
                  }
                />
                <LabeValue
                  label={getString('common.triggerName')}
                  value={getString(mapTriggerTypeToStringID(i.executorInfo?.triggerType))}
                />
              </>
            )}
          </Layout.Vertical>
        ),
        className: Classes.DARK
      })}
    />
  )
}
