/* eslint-disable react/function-component-definition */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Classes, Popover, Position } from '@blueprintjs/core'
import { Color, FontVariation } from '@harness/design-system'
import { Avatar, Button, ButtonVariation, Icon, Layout, TagsPopover, Text, Checkbox } from '@harness/uicore'
import { get, isEmpty, defaultTo } from 'lodash-es'
import React, { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import type {
  Cell,
  CellValue,
  ColumnInstance,
  Renderer,
  Row,
  TableInstance,
  UseExpandedRowProps,
  UseTableCellProps
} from 'react-table'
import type { IconName } from '@harness/icons'
import { Duration, TimeAgoPopover } from '@common/components'
import type { StoreType } from '@common/constants/GitSyncTypes'
import { useModuleInfo } from '@common/hooks/useModuleInfo'
import type {
  ExecutionPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { killEvent } from '@common/utils/eventUtils'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { isSimplifiedYAMLEnabled } from '@common/utils/utils'
import ExecutionActions from '@pipeline/components/ExecutionActions/ExecutionActions'
import { TimePopoverWithLocal } from '@pipeline/components/ExecutionCard/TimePopoverWithLocal'
import { useExecutionCompareContext } from '@pipeline/components/ExecutionCompareYaml/ExecutionCompareContext'
import ExecutionStatusLabel from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'
import { useRunPipelineModal } from '@pipeline/components/RunPipelineModal/useRunPipelineModal'
import { AUTO_TRIGGERS } from '@pipeline/utils/constants'
import { hasCIStage } from '@pipeline/utils/stageHelpers'
import { ExecutionStatus, ExecutionStatusEnum } from '@pipeline/utils/statusHelpers'
import { mapTriggerTypeToIconAndExecutionText, mapTriggerTypeToStringID } from '@pipeline/utils/triggerUtils'
import { useRunPipelineModalV1 } from '@pipeline/v1/components/RunPipelineModalV1/useRunPipelineModalV1'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { usePermission } from '@rbac/hooks/usePermission'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { useStrings } from 'framework/strings'
import type { PipelineExecutionSummary, PipelineStageInfo, PMSPipelineSummaryResponse } from 'services/pipeline-ng'
import { useQueryParams } from '@common/hooks'
import type { PipelineListPagePathParams } from '@pipeline/pages/pipeline-list/types'
import FrozenExecutionDrawer from './FrozenExecutionDrawer/FrozenExecutionDrawer'
import { CITriggerInfo, CITriggerInfoProps } from './CITriggerInfoCell'
import type { ExecutionListColumnActions } from './ExecutionListTable'
import css from './ExecutionListTable.module.scss'

export const getExecutionPipelineViewLink = (
  pipelineExecutionSummary: PipelineExecutionSummary,
  pathParams: PipelineType<PipelinePathProps>,
  queryParams: GitQueryParams
): string => {
  const { planExecutionId, pipelineIdentifier: rowDataPipelineIdentifier } = pipelineExecutionSummary
  const { orgIdentifier, projectIdentifier, accountId, pipelineIdentifier, module } = pathParams
  const { branch, repoIdentifier, repoName, connectorRef, storeType } = queryParams
  const source: ExecutionPathProps['source'] = pipelineIdentifier ? 'executions' : 'deployments'

  return routes.toExecutionPipelineView({
    orgIdentifier,
    projectIdentifier,
    pipelineIdentifier: pipelineIdentifier || rowDataPipelineIdentifier || '-1',
    accountId,
    module,
    executionIdentifier: planExecutionId || '-1',
    source,
    connectorRef: pipelineExecutionSummary.connectorRef ?? connectorRef,
    repoName: defaultTo(
      pipelineExecutionSummary.gitDetails?.repoName ?? repoName,
      pipelineExecutionSummary.gitDetails?.repoIdentifier ?? repoIdentifier
    ),
    branch: pipelineExecutionSummary.gitDetails?.branch ?? branch,
    storeType: pipelineExecutionSummary.storeType ?? storeType
  })
}

export function getChildExecutionPipelineViewLink<T>(
  data: T,
  pathParams: PipelineType<PipelinePathProps | PipelineListPagePathParams>,
  queryParams: GitQueryParams
): string {
  const {
    executionid,
    identifier: pipelineIdentifier,
    orgid,
    projectid,
    stagenodeid
  } = get(
    data,
    'parentStageInfo',
    get(
      (data as unknown as PMSPipelineSummaryResponse)?.recentExecutionsInfo,
      [0, 'parentStageInfo'],
      {} as PipelineStageInfo
    )
  )
  const { accountId, module } = pathParams
  const { branch, repoIdentifier, repoName, connectorRef, storeType } = queryParams
  const source: ExecutionPathProps['source'] = pipelineIdentifier ? 'executions' : 'deployments'

  return routes.toExecutionPipelineView({
    accountId: accountId,
    orgIdentifier: orgid,
    projectIdentifier: projectid,
    pipelineIdentifier: pipelineIdentifier || '-1',
    executionIdentifier: executionid || '-1',
    module,
    source,
    stage: stagenodeid,
    connectorRef: get(data, 'connectorRef', connectorRef),
    repoName: defaultTo(
      get(data, ['gitDetails', 'repoName'], repoName),
      get(data, ['gitDetails', 'repoIdentifier'], repoIdentifier)
    ),
    branch: get(data, ['gitDetails', 'branch'], branch),
    storeType: get(data, 'storeType', storeType)
  })
}

type CellTypeWithActions<D extends Record<string, any>, V = any> = TableInstance<D> & {
  column: ColumnInstance<D> & ExecutionListColumnActions
  row: Row<D>
  cell: Cell<D, V>
  value: CellValue<V>
}

type CellType = Renderer<CellTypeWithActions<PipelineExecutionSummary>>

export interface CellTypeRegister {
  component: React.ComponentType<UseTableCellProps<PipelineExecutionSummary>>
}

export const RowSelectCell: CellType = ({ row }) => {
  const data = row.original
  const { compareItems, addToCompare, removeFromCompare } = useExecutionCompareContext()

  const isCompareItem =
    compareItems?.findIndex(compareItem => compareItem.planExecutionId === data.planExecutionId) >= 0

  const onCompareToggle = (): void => {
    if (isCompareItem) {
      removeFromCompare(data)
    } else {
      addToCompare(data)
    }
  }

  return (
    <div className={css.checkbox} onClick={killEvent}>
      <Checkbox
        size={12}
        checked={isCompareItem}
        onChange={onCompareToggle}
        disabled={compareItems.length === 2 && !isCompareItem}
      />
    </div>
  )
}

export const ToggleAccordionCell: Renderer<{ row: UseExpandedRowProps<PipelineExecutionSummary> }> = ({ row }) => {
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

export const PipelineNameCell: CellType = ({ row }) => {
  const data = row.original
  const { getString } = useStrings()
  const pathParams = useParams<PipelineType<PipelinePathProps>>()
  const queryParams = useQueryParams<GitQueryParams>()
  const toExecutionPipelineView = getExecutionPipelineViewLink(data, pathParams, queryParams)

  return (
    <Layout.Vertical>
      <Layout.Horizontal spacing="small" style={{ alignItems: 'center' }}>
        <Link to={toExecutionPipelineView}>
          <Text font={{ variation: FontVariation.LEAD }} color={Color.PRIMARY_7} lineClamp={1}>
            {data.name}
          </Text>
        </Link>
        {!isEmpty(data?.tags) && (
          <TagsPopover
            iconProps={{ size: 12, color: Color.GREY_600 }}
            popoverProps={{ className: Classes.DARK }}
            className={css.tags}
            tags={defaultTo(data?.tags, []).reduce((_tags, tag) => {
              _tags[tag.key] = tag.value
              return _tags
            }, {} as { [key: string]: string })}
          />
        )}
      </Layout.Horizontal>
      <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_500} lineClamp={1}>
        {`${getString('pipeline.executionId')}: ${data.runSequence}`}
      </Text>
    </Layout.Vertical>
  )
}

export const StatusCell: CellType = ({ row }) => {
  const planExecutionId = row.original.planExecutionId
  const isAbortedByFreeze = ExecutionStatusEnum.AbortedByFreeze === (row.original.status as ExecutionStatus)
  const [drawerOpen, setDrawerOpen] = React.useState<boolean>(false)
  const { getString } = useStrings()

  const AbortedByFreezePopover = (): JSX.Element => {
    return (
      <Layout.Vertical className={css.abortedByFreezePopover} flex={{ alignItems: 'flex-start' }}>
        <ExecutionStatusLabel
          status={row.original.status as ExecutionStatus}
          label={getString('pipeline.executionStatus.AbortedByFreeze')}
        />
        <Text color={Color.GREY_100}>{getString('pipeline.frozenExecPopover.abortedMsg')}</Text>
        <Text
          color={Color.PRIMARY_5}
          rightIcon="right-drawer"
          rightIconProps={{ color: Color.PRIMARY_5 }}
          onClick={e => {
            e.stopPropagation()
            setDrawerOpen(true)
          }}
          className={css.viewWindowTextStyle}
        >
          {getString('pipeline.frozenExecPopover.viewFreezeWindows')}
        </Text>
      </Layout.Vertical>
    )
  }

  return (
    <div onClick={e => e.stopPropagation()}>
      <Popover
        interactionKind="hover"
        popoverClassName={css.popoverStyle}
        content={<AbortedByFreezePopover />}
        disabled={!isAbortedByFreeze || drawerOpen}
        position={Position.TOP}
      >
        <ExecutionStatusLabel status={row.original.status as ExecutionStatus} disableTooltip={isAbortedByFreeze} />
      </Popover>
      {drawerOpen && (
        <FrozenExecutionDrawer
          drawerOpen={drawerOpen}
          planExecutionId={planExecutionId}
          setDrawerOpen={setDrawerOpen}
        />
      )}
    </div>
  )
}

export const ExecutionCell: CellType = ({ row }) => {
  const data = row.original
  const pathParams = useParams<PipelineType<PipelinePathProps>>()
  const queryParams = useQueryParams<GitQueryParams>()

  const { module } = useModuleInfo()
  const { getString } = useStrings()
  const TimeAgo = module === 'cd' ? TimePopoverWithLocal : TimeAgoPopover
  const name =
    get(data, 'executionTriggerInfo.triggeredBy.identifier') ||
    get(data, 'moduleInfo.ci.ciExecutionInfoDTO.author.name') ||
    get(data, 'moduleInfo.ci.ciExecutionInfoDTO.author.id') ||
    'Anonymous'
  const email =
    get(data, 'executionTriggerInfo.triggeredBy.extraInfo.email') ||
    get(data, 'moduleInfo.ci.ciExecutionInfoDTO.author.email')
  const profilePictureUrl =
    get(data, 'executionTriggerInfo.triggeredBy.avatar') || get(data, 'moduleInfo.ci.ciExecutionInfoDTO.author.avatar')
  const { hasparentpipeline = false, identifier: pipelineIdentifier } = get(
    data,
    'parentStageInfo',
    {} as PipelineStageInfo
  )

  const toChildExecutionPipelineView = getChildExecutionPipelineViewLink<PipelineExecutionSummary>(
    data,
    pathParams,
    queryParams
  )

  const triggerType = data.executionTriggerInfo?.triggerType
  const isAutoTrigger = AUTO_TRIGGERS.includes(triggerType)

  const isExecutionPostRollback = get(data, 'executionMode') === 'POST_EXECUTION_ROLLBACK'
  const triggerTypeLabel = isExecutionPostRollback
    ? getString('rollbackLabel')
    : getString(mapTriggerTypeToStringID(get(data, 'executionTriggerInfo.triggerType')))

  return (
    <Layout.Horizontal spacing="xsmall" style={{ alignItems: 'center' }} className={css.execution}>
      {hasparentpipeline ? (
        <Link to={toChildExecutionPipelineView} target="_blank" className={css.iconWrapper} onClick={killEvent}>
          <Icon size={10} name={'chained-pipeline'} className={css.icon} />
        </Link>
      ) : !isAutoTrigger ? (
        <Avatar
          size={'small'}
          src={profilePictureUrl}
          name={!profilePictureUrl && (name || email)}
          hoverCard={false}
          backgroundColor={Color.PRIMARY_1}
          color={Color.PRIMARY_7}
        />
      ) : (
        <div onClick={killEvent}>
          <Link
            to={routes.toTriggersDetailPage({
              projectIdentifier: pathParams.projectIdentifier,
              orgIdentifier: pathParams.orgIdentifier,
              accountId: pathParams.accountId,
              module: pathParams.module,
              pipelineIdentifier: data.pipelineIdentifier || '',
              triggerIdentifier: get(data, 'executionTriggerInfo.triggeredBy.identifier') || '',
              triggerType
            })}
            className={css.iconWrapper}
          >
            <Icon
              size={10}
              name={triggerType === 'SCHEDULER_CRON' ? 'stopwatch' : 'trigger-execution'}
              aria-label="trigger"
              className={css.icon}
            />
          </Link>
        </div>
      )}
      <div>
        <Layout.Horizontal className={css.childPipelineExecutionInfo}>
          {hasparentpipeline ? (
            <>
              <Link to={toChildExecutionPipelineView} target="_blank" onClick={killEvent}>
                <Text
                  font={{ variation: FontVariation.SMALL_SEMI }}
                  color={Color.PRIMARY_7}
                  lineClamp={1}
                  style={{ maxWidth: '150px' }}
                  margin={{ right: 'xsmall' }}
                >
                  {`${pipelineIdentifier}`}
                </Text>
              </Link>
              <Text color={Color.GREY_900} font={{ variation: FontVariation.SMALL }} lineClamp={1}>
                | {getString('common.pipeline')}
              </Text>
            </>
          ) : (
            <Text color={Color.GREY_900} font={{ variation: FontVariation.SMALL }} lineClamp={1}>
              {name || email} | {triggerTypeLabel}
            </Text>
          )}
        </Layout.Horizontal>
        <TimeAgo
          time={defaultTo(data.startTs, 0)}
          inline={false}
          font={{ variation: FontVariation.TINY }}
          color={Color.GREY_600}
        />
      </div>
    </Layout.Horizontal>
  )
}

export const DurationCell: CellType = ({ row }) => {
  const data = row.original
  return (
    <Duration
      startTime={data.startTs}
      endTime={data?.endTs}
      font={{ variation: FontVariation.TINY }}
      color={Color.GREY_600}
      durationText=""
    />
  )
}

export const MenuCell: CellType = ({ row, column }) => {
  const { onViewCompiledYaml, isPipelineInvalid } = column
  const data = row.original
  const { projectIdentifier, orgIdentifier, accountId, module, pipelineIdentifier } =
    useParams<PipelineType<PipelinePathProps>>()
  const source: ExecutionPathProps['source'] = pipelineIdentifier ? 'executions' : 'deployments'
  const { addToCompare } = useExecutionCompareContext()
  const hasCI = hasCIStage(data)
  const { isGitSyncEnabled: isGitSyncEnabledForProject, gitSyncEnabledOnlyForFF } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const { openRunPipelineModal } = useRunPipelineModal({
    pipelineIdentifier: data.pipelineIdentifier || pipelineIdentifier,
    executionId: defaultTo(data.planExecutionId, ''),
    repoIdentifier: isGitSyncEnabled ? data.gitDetails?.repoIdentifier : data.gitDetails?.repoName,
    branch: data.gitDetails?.branch,
    connectorRef: data.connectorRef,
    storeType: data.storeType as StoreType,
    stagesExecuted: data.stagesExecuted
  })

  const { CI_YAML_VERSIONING, CI_REMOTE_DEBUG } = useFeatureFlags()

  const { openRunPipelineModalV1 } = useRunPipelineModalV1({
    pipelineIdentifier: data.pipelineIdentifier || pipelineIdentifier,
    executionId: defaultTo(data.planExecutionId, ''),
    repoIdentifier: isGitSyncEnabled ? data.gitDetails?.repoIdentifier : data.gitDetails?.repoName,
    branch: data.gitDetails?.branch,
    connectorRef: data.connectorRef,
    storeType: data.storeType as StoreType
  })
  const [canEdit, canExecute] = usePermission(
    {
      resourceScope: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      resource: {
        resourceType: ResourceType.PIPELINE,
        resourceIdentifier: data.pipelineIdentifier
      },
      permissions: [PermissionIdentifier.EDIT_PIPELINE, PermissionIdentifier.EXECUTE_PIPELINE]
    },
    [orgIdentifier, projectIdentifier, accountId, data.pipelineIdentifier]
  )

  return (
    <div className={css.menu} onClick={killEvent}>
      <ExecutionActions
        executionStatus={data.status as ExecutionStatus}
        params={{
          accountId,
          orgIdentifier,
          pipelineIdentifier: defaultTo(data.pipelineIdentifier, ''),
          executionIdentifier: defaultTo(data.planExecutionId, ''),
          projectIdentifier,
          module,
          repoIdentifier: data.gitDetails?.repoIdentifier,
          connectorRef: data.connectorRef,
          repoName: data.gitDetails?.repoName,
          branch: data.gitDetails?.branch,
          stagesExecuted: data.stagesExecuted,
          storeType: data.storeType as StoreType
        }}
        isPipelineInvalid={isPipelineInvalid}
        canEdit={canEdit}
        onViewCompiledYaml={() => onViewCompiledYaml(data)}
        onCompareExecutions={() => addToCompare(data)}
        onReRunInDebugMode={
          hasCI && CI_REMOTE_DEBUG
            ? isSimplifiedYAMLEnabled(module, CI_YAML_VERSIONING)
              ? () => openRunPipelineModalV1(true)
              : () => openRunPipelineModal(true)
            : undefined
        }
        source={source}
        canExecute={canExecute}
        canRetry={data.canRetry}
        modules={data.modules}
        menuOnlyActions
        isExecutionListView
      />
    </div>
  )
}

export function DefaultTriggerInfoCell(props: UseTableCellProps<PipelineExecutionSummary>): React.ReactElement {
  const { getString } = useStrings()
  const data = props.row.original
  const pathParams = useParams<PipelineType<PipelinePathProps>>()
  const queryParams = useQueryParams<GitQueryParams>()
  const triggerType = get(data, 'executionTriggerInfo.triggerType', 'MANUAL')
  const isExecutionPostRollback = get(data, 'executionMode') === 'POST_EXECUTION_ROLLBACK'
  const { sourceEventId, sourceEventLink } = get(data, 'executionTriggerInfo.triggeredBy.extraInfo', {})
  let { iconName, getText } = mapTriggerTypeToIconAndExecutionText(triggerType, getString) ?? {}
  const { hasparentpipeline = false, identifier: pipelineIdentifier } = get(
    data,
    'parentStageInfo',
    {} as PipelineStageInfo
  )

  if (isExecutionPostRollback) {
    iconName = 'rollback-service' as IconName
    getText = () => getString('pipeline.rollbackExecution')
  }

  const toChildExecutionPipelineView = getChildExecutionPipelineViewLink<PipelineExecutionSummary>(
    data,
    pathParams,
    queryParams
  )
  const showCI = hasCIStage(data)
  const ciData = defaultTo(data?.moduleInfo?.ci, {})
  const prOrCommitTitle =
    ciData.ciExecutionInfoDTO?.pullRequest?.title || ciData.ciExecutionInfoDTO?.branch?.commits[0]?.message

  const triggerInfoCellTriggeredBySection = useMemo(() => {
    return (
      <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
        {hasparentpipeline ? (
          <>
            <Icon name={'chained-pipeline'} size={12} />
            <Text font={{ size: 'small' }} color={Color.GREY_800} lineClamp={1}>
              {getString('pipeline.executionTriggeredBy')}
            </Text>
            <Link to={toChildExecutionPipelineView} target="_blank" onClick={killEvent}>
              <Text
                font={{ variation: FontVariation.SMALL_SEMI }}
                color={Color.PRIMARY_7}
                lineClamp={1}
                className={css.parentPipelineLink}
              >
                {`${pipelineIdentifier}`}
              </Text>
            </Link>
          </>
        ) : (
          iconName &&
          typeof getText === 'function' && (
            <Text font={{ size: 'small' }} icon={iconName} iconProps={{ size: 12 }} color={Color.GREY_800}>
              {getText(data?.startTs, data?.executionTriggerInfo?.triggeredBy?.identifier)}
              {sourceEventId && sourceEventLink && (
                <span>
                  &#40;
                  <a
                    target="_blank"
                    rel="noreferrer"
                    href={sourceEventLink}
                    style={{ color: Color.PRIMARY_7 }}
                    onClick={e => {
                      e.stopPropagation()
                    }}
                  >
                    {sourceEventId.slice(0, 7)}
                  </a>
                  &#41;
                </span>
              )}
            </Text>
          )
        )}
      </Layout.Horizontal>
    )
  }, [pipelineIdentifier])

  return showCI && ciData ? (
    <Layout.Vertical spacing="small" className={css.triggerInfoCell}>
      <CITriggerInfo {...(ciData as unknown as CITriggerInfoProps)} />
      {prOrCommitTitle ? (
        <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_800} lineClamp={1}>
          {prOrCommitTitle}
        </Text>
      ) : (
        triggerInfoCellTriggeredBySection
      )}
    </Layout.Vertical>
  ) : (
    triggerInfoCellTriggeredBySection
  )
}
