/* eslint-disable react/function-component-definition */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Checkbox } from '@blueprintjs/core'
import { Color, FontVariation } from '@harness/design-system'
import { Icon, Layout, TagsPopover, Text } from '@harness/uicore'
import { get, isEmpty } from 'lodash-es'
import defaultTo from 'lodash-es/defaultTo'
import React, { useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { CellProps, Renderer, UseExpandedRowProps } from 'react-table'
import { Duration, TimeAgoPopover, UserLabel } from '@common/components'
import type { StoreType } from '@common/constants/GitSyncTypes'
import { useModuleInfo } from '@common/hooks/useModuleInfo'
import type { ExecutionPathProps, PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import ExecutionActions from '@pipeline/components/ExecutionActions/ExecutionActions'
import { TimePopoverWithLocal } from '@pipeline/components/ExecutionCard/TimePopoverWithLocal'
import { useExecutionCompareContext } from '@pipeline/components/ExecutionCompareYaml/ExecutionCompareContext'
import ExecutionStatusLabel from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import { mapTriggerTypeToStringID } from '@pipeline/utils/triggerUtils'
import { usePermission } from '@rbac/hooks/usePermission'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { useStrings } from 'framework/strings'
import type { PipelineExecutionSummary } from 'services/pipeline-ng'
import {
  hasCDStage,
  hasCIStage,
  hasOverviewDetail,
  hasServiceDetail,
  hasSTOStage,
  StageType
} from '@pipeline/utils/stageHelpers'
import {
  ServiceExecutionsCard,
  DashboardSelected
} from '@pipeline/components/ServiceExecutionsCard/ServiceExecutionsCard'
import type { ExecutionCardInfoProps } from '@pipeline/factories/ExecutionFactory/types'
import type { ServiceDeploymentInfo } from 'services/cd-ng'
import executionFactory from '@pipeline/factories/ExecutionFactory'
import { CardVariant } from '@pipeline/utils/constants'
import { FeatureFlag } from '@common/featureFlags'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import css from './ExecutionListTable.module.scss'

type CellType = Renderer<CellProps<PipelineExecutionSummary>>
type ColumnWithActions = { isPipelineInvalid: boolean; onViewCompiledYaml: () => void }

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
    <div ref={checkboxRef}>
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
  return <Icon name={row.isExpanded ? 'chevron-down' : 'chevron-right'} {...row.getToggleRowExpandedProps()} />
}

export const PipelineNameCell: CellType = ({ row }) => {
  const data = row.original
  const { runSequence, planExecutionId = '', name, pipelineIdentifier: rowDataPipelineIdentifier = '' } = data
  const { getString } = useStrings()
  const { orgIdentifier, projectIdentifier, accountId, pipelineIdentifier, module } =
    useParams<PipelineType<PipelinePathProps>>()
  const source: ExecutionPathProps['source'] = pipelineIdentifier ? 'executions' : 'deployments'

  const toPipelineStudio = routes.toPipelineStudio({
    orgIdentifier,
    projectIdentifier,
    pipelineIdentifier: pipelineIdentifier || rowDataPipelineIdentifier,
    accountId,
    module
  })

  const toExecutionPipelineView = routes.toExecutionPipelineView({
    orgIdentifier,
    projectIdentifier,
    pipelineIdentifier: pipelineIdentifier || rowDataPipelineIdentifier,
    accountId,
    module,
    executionIdentifier: planExecutionId,
    source
  })

  return (
    <Layout.Vertical spacing="small">
      <Layout.Horizontal spacing="small">
        <Link to={toPipelineStudio}>
          <Text font={{ size: 'normal' }} color={Color.PRIMARY_7} lineClamp={1}>
            {name}
          </Text>
        </Link>
        {!isEmpty(data?.tags) && (
          <TagsPopover
            iconProps={{ size: 14 }}
            className={css.tags}
            popoverProps={{ wrapperTagName: 'div', targetTagName: 'div' }}
            tags={defaultTo(data?.tags, []).reduce((val, tag) => {
              return Object.assign(val, { [tag.key]: tag.value })
            }, {} as { [key: string]: string })}
          />
        )}
      </Layout.Horizontal>
      <Link to={toExecutionPipelineView}>
        <Text font={{ size: 'small' }} color={Color.PRIMARY_7} lineClamp={1}>
          {`${getString('pipeline.executionId')}: ${runSequence}`}
        </Text>
      </Link>
    </Layout.Vertical>
  )
}

export const StatusCell: CellType = ({ row }) => {
  return <ExecutionStatusLabel status={row.original.status as ExecutionStatus} />
}

export const LastExecutionCell: CellType = ({ row }) => {
  const data = row.original
  const { module = 'cd' } = useModuleInfo()
  const { getString } = useStrings()
  const TimeAgo = module === 'cd' ? TimePopoverWithLocal : TimeAgoPopover
  return (
    <Layout.Vertical spacing="small">
      <div className={css.triggerInfo}>
        <UserLabel
          name={
            get(data, 'moduleInfo.ci.ciExecutionInfoDTO.author.name') ||
            get(data, 'moduleInfo.ci.ciExecutionInfoDTO.author.id') ||
            get(data, 'executionTriggerInfo.triggeredBy.identifier') ||
            'Anonymous'
          }
          email={
            get(data, 'moduleInfo.ci.ciExecutionInfoDTO.author.email') ||
            get(data, 'executionTriggerInfo.triggeredBy.extraInfo.email')
          }
          profilePictureUrl={
            get(data, 'moduleInfo.ci.ciExecutionInfoDTO.author.avatar') ||
            get(data, 'executionTriggerInfo.triggeredBy.avatar')
          }
          textProps={{
            font: { variation: FontVariation.SMALL },
            color: Color.GREY_900
          }}
          iconProps={{ color: Color.GREY_900 }}
        />
        <Text font={{ variation: FontVariation.SMALL }} className={css.triggerType}>
          {getString(mapTriggerTypeToStringID(get(data, 'executionTriggerInfo.triggerType')))}
        </Text>
      </div>
      <TimeAgo
        time={defaultTo(data.startTs, 0)}
        inline={false}
        font={{ variation: FontVariation.SMALL }}
        color={Color.GREY_500}
      />
    </Layout.Vertical>
  )
}

export const DurationCell: CellType = ({ row }) => {
  const data = row.original
  return (
    <Duration
      startTime={data.startTs}
      endTime={data?.endTs}
      font={{ variation: FontVariation.SMALL }}
      color={Color.GREY_500}
      durationText=""
    />
  )
}

export const MenuCell: CellType = ({ row, column }) => {
  const { onViewCompiledYaml, isPipelineInvalid } = column as unknown as ColumnWithActions
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
    <div className={css.menu}>
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
        onViewCompiledYaml={onViewCompiledYaml}
        onCompareExecutions={() => addToCompare(data)}
        source={source}
        canExecute={canExecute}
        canRetry={data.canRetry}
        modules={data.modules}
      />
    </div>
  )
}

export const TriggerInfoCell: CellType = ({ row }) => {
  const data = row.original
  const IS_SERVICEDETAIL = hasServiceDetail(data)
  const IS_OVERVIEWPAGE = hasOverviewDetail(data)
  const cdInfo = executionFactory.getCardInfo(StageType.DEPLOY)
  const ciInfo = executionFactory.getCardInfo(StageType.BUILD)
  const stoInfo = executionFactory.getCardInfo(StageType.SECURITY)
  const variant = CardVariant.Default
  const SECURITY = useFeatureFlag(FeatureFlag.SECURITY)

  const showCI = !!(ciInfo && hasCIStage(data))
  const showCD = !!(cdInfo && hasCDStage(data))
  const showSTO = !!(SECURITY && stoInfo && hasSTOStage(data))

  return (
    <Layout.Vertical spacing="small" className={css.triggerInfoCell}>
      {showCI && (
        <div className={css.ci}>
          {ciInfo?.component &&
            React.createElement<ExecutionCardInfoProps>(ciInfo.component, {
              data: defaultTo(data?.moduleInfo?.ci, {}),
              nodeMap: defaultTo(data?.layoutNodeMap, {}),
              startingNodeId: defaultTo(data?.startingNodeId, ''),
              variant
            })}
        </div>
      )}
      {!showCI &&
        showCD &&
        (!(IS_SERVICEDETAIL || IS_OVERVIEWPAGE) ? (
          cdInfo?.component &&
          React.createElement<ExecutionCardInfoProps>(cdInfo.component, {
            data: defaultTo(data?.moduleInfo?.cd, {}),
            nodeMap: defaultTo(data?.layoutNodeMap, {}),
            startingNodeId: defaultTo(data?.startingNodeId, ''),
            variant
          })
        ) : (
          <ServiceExecutionsCard
            envIdentifiers={data?.moduleInfo?.cd?.envIdentifiers as string[]}
            serviceIdentifiers={data?.moduleInfo?.cd?.serviceIdentifiers as ServiceDeploymentInfo[]}
            caller={IS_SERVICEDETAIL ? DashboardSelected.SERVICEDETAIL : DashboardSelected.OVERVIEW}
          />
        ))}

      {showSTO &&
        stoInfo?.component &&
        React.createElement<ExecutionCardInfoProps<PipelineExecutionSummary>>(stoInfo.component, {
          data: defaultTo(data, {}),
          nodeMap: defaultTo(data?.layoutNodeMap, {}),
          startingNodeId: defaultTo(data?.startingNodeId, ''),
          variant
        })}
    </Layout.Vertical>
  )
}
