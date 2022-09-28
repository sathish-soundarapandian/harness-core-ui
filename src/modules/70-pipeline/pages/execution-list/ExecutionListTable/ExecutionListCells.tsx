/* eslint-disable react/function-component-definition */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Checkbox, Classes } from '@blueprintjs/core'
import { Color, FontVariation } from '@harness/design-system'
import { Avatar, Button, ButtonVariation, Icon, Layout, TagsPopover, Text } from '@harness/uicore'
import { get, isEmpty } from 'lodash-es'
import defaultTo from 'lodash-es/defaultTo'
import React, { useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Cell, CellValue, ColumnInstance, Renderer, Row, TableInstance, UseExpandedRowProps } from 'react-table'
import { Duration, TimeAgoPopover } from '@common/components'
import type { StoreType } from '@common/constants/GitSyncTypes'
import { useModuleInfo } from '@common/hooks/useModuleInfo'
import type { ExecutionPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { getReadableDateTime } from '@common/utils/dateUtils'
import { killEvent } from '@common/utils/eventUtils'
import ExecutionActions from '@pipeline/components/ExecutionActions/ExecutionActions'
import { TimePopoverWithLocal } from '@pipeline/components/ExecutionCard/TimePopoverWithLocal'
import { useExecutionCompareContext } from '@pipeline/components/ExecutionCompareYaml/ExecutionCompareContext'
import ExecutionStatusLabel from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'
import { AUTO_TRIGGERS } from '@pipeline/utils/constants'
import { hasCIStage } from '@pipeline/utils/stageHelpers'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import { mapTriggerTypeToStringID } from '@pipeline/utils/triggerUtils'
import { usePermission } from '@rbac/hooks/usePermission'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { useStrings } from 'framework/strings'
import type { PipelineExecutionSummary } from 'services/pipeline-ng'
import type { ExecutionListColumnActions } from './ExecutionListTable'
import { CITriggerInfo, CITriggerInfoProps } from './CITriggerInfoCell'
import css from './ExecutionListTable.module.scss'

export const getExecutionPipelineViewLink = (
  pipelineExecutionSummary: PipelineExecutionSummary,
  pathParams: PipelineType<PipelinePathProps>
): string => {
  const { planExecutionId, pipelineIdentifier: rowDataPipelineIdentifier } = pipelineExecutionSummary
  const { orgIdentifier, projectIdentifier, accountId, pipelineIdentifier, module } = pathParams
  const source: ExecutionPathProps['source'] = pipelineIdentifier ? 'executions' : 'deployments'

  return routes.toExecutionPipelineView({
    orgIdentifier,
    projectIdentifier,
    pipelineIdentifier: pipelineIdentifier || rowDataPipelineIdentifier || '-1',
    accountId,
    module,
    executionIdentifier: planExecutionId || '-1',
    source
  })
}

type CellTypeWithActions<D extends Record<string, any>, V = any> = TableInstance<D> & {
  column: ColumnInstance<D> & ExecutionListColumnActions
  row: Row<D>
  cell: Cell<D, V>
  value: CellValue<V>
}

type CellType = Renderer<CellTypeWithActions<PipelineExecutionSummary>>

export const RowSelectCell: CellType = ({ row }) => {
  const data = row.original
  const checkboxRef = useRef<HTMLDivElement>(null)
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
    <div ref={checkboxRef} className={css.checkbox} onClick={killEvent}>
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
  const toExecutionPipelineView = getExecutionPipelineViewLink(data, pathParams)

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
  return <ExecutionStatusLabel status={row.original.status as ExecutionStatus} />
}

export const ExecutionCell: CellType = ({ row }) => {
  const data = row.original
  const pathParams = useParams<PipelineType<PipelinePathProps>>()

  const { module = 'cd' } = useModuleInfo()
  const { getString } = useStrings()
  const TimeAgo = module === 'cd' ? TimePopoverWithLocal : TimeAgoPopover
  const name =
    get(data, 'moduleInfo.ci.ciExecutionInfoDTO.author.name') ||
    get(data, 'moduleInfo.ci.ciExecutionInfoDTO.author.id') ||
    get(data, 'executionTriggerInfo.triggeredBy.identifier') ||
    'Anonymous'
  const email =
    get(data, 'moduleInfo.ci.ciExecutionInfoDTO.author.email') ||
    get(data, 'executionTriggerInfo.triggeredBy.extraInfo.email')
  const profilePictureUrl =
    get(data, 'moduleInfo.ci.ciExecutionInfoDTO.author.avatar') || get(data, 'executionTriggerInfo.triggeredBy.avatar')

  const triggerType = data.executionTriggerInfo?.triggerType

  const isAutoTrigger = AUTO_TRIGGERS.includes(triggerType)

  return (
    <Layout.Horizontal spacing="xsmall" style={{ alignItems: 'center' }} className={css.execution}>
      {!isAutoTrigger ? (
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
        <Layout.Horizontal>
          <Text color={Color.GREY_900} font={{ variation: FontVariation.SMALL }} lineClamp={1}>
            {name || email} | {getString(mapTriggerTypeToStringID(get(data, 'executionTriggerInfo.triggerType')))}
          </Text>
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
        source={source}
        canExecute={canExecute}
        canRetry={data.canRetry}
        modules={data.modules}
        menuOnlyActions
      />
    </div>
  )
}

export const TriggerInfoCell: CellType = ({ row }) => {
  const data = row.original
  const triggers = ['SCHEDULER_CRON', 'WEBHOOK_CUSTOM', 'MANUAL'] as const

  const triggerType = data.executionTriggerInfo?.triggerType

  const triggerMap: Record<typeof triggers[number], any> = {
    SCHEDULER_CRON: {
      icon: 'stopwatch',
      getText: (startTs: number, triggeredBy: string) =>
        `Triggered on ${getReadableDateTime(startTs)} by cron ${triggeredBy}`
    },
    WEBHOOK_CUSTOM: {
      icon: 'trigger-execution',
      getText: () => `Triggered by a third party system`
    },
    MANUAL: {
      icon: 'person',
      getText: () => `This execution was triggered manually`
    }
  }

  if (triggerType && triggers.includes(triggerType)) {
    const { icon, getText } = triggerMap[triggerType as typeof triggers[number]]

    return (
      <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
        <Icon name={icon} size={12} />
        <Text font={{ size: 'small' }} color={Color.GREY_800} lineClamp={1}>
          {getText(data.startTs, data?.executionTriggerInfo?.triggeredBy?.identifier)}
        </Text>
      </Layout.Horizontal>
    )
  }

  const showCI = hasCIStage(data)
  const ciData = defaultTo(data?.moduleInfo?.ci, {})
  const prOrCommitTitle =
    ciData.ciExecutionInfoDTO?.pullRequest?.title || ciData.ciExecutionInfoDTO?.branch.commits[0]?.message

  return (
    showCI && (
      <Layout.Vertical spacing="small" className={css.triggerInfoCell}>
        <CITriggerInfo {...(ciData as unknown as CITriggerInfoProps)} />
        {prOrCommitTitle && (
          <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_800} lineClamp={1}>
            {prOrCommitTitle}
          </Text>
        )}
      </Layout.Vertical>
    )
  )
}
