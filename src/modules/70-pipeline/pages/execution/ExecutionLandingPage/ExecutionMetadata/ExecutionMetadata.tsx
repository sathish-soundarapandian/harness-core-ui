/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, Icon, Tag, Popover } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { HTMLTable, Position } from '@blueprintjs/core'
import { defaultTo, get } from 'lodash-es'
import { Link, useParams } from 'react-router-dom'
import { useStrings, String } from 'framework/strings'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import { hasCDStage, hasCIStage, StageType } from '@pipeline/utils/stageHelpers'
import factory from '@pipeline/factories/ExecutionFactory'
import type { ExecutorInfoDTO, PipelineStageInfo } from 'services/pipeline-ng'
import { mapTriggerTypeToStringID } from '@pipeline/utils/triggerUtils'
import { UserLabel } from '@common/components/UserLabel/UserLabel'

import type {
  ExecutionPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { useQueryParams } from '@common/hooks'
import css from './ExecutionMetadata.module.scss'

// stage executed name limit, exceeding this we will show a popover
const LIMIT = 3

function ExecutionMetadataTrigger(): React.ReactElement {
  const { getString } = useStrings()
  const {
    accountId,
    module,
    projectIdentifier,
    orgIdentifier,
    pipelineIdentifier,
    source = 'executions'
  } = useParams<PipelineType<ExecutionPathProps & PipelinePathProps>>()
  const { branch, repoIdentifier, connectorRef, repoName, storeType } = useQueryParams<GitQueryParams>()

  const { pipelineExecutionDetail } = useExecutionContext()
  const { pipelineExecutionSummary } = pipelineExecutionDetail || {}

  const { executionid, hasparentpipeline, identifier, orgid, projectid, stagenodeid, runsequence } = get(
    pipelineExecutionSummary,
    'parentStageInfo',
    {} as PipelineStageInfo
  )
  const triggerType = pipelineExecutionSummary?.executionTriggerInfo?.triggerType as ExecutorInfoDTO['triggerType']
  const triggeredBy = pipelineExecutionSummary?.executionTriggerInfo?.triggeredBy
  const triggerIdentifier = triggeredBy?.triggerIdentifier ?? triggeredBy?.identifier

  const triggersWizardPageLinkUrl = routes.toTriggersDetailPage({
    accountId,
    orgIdentifier,
    projectIdentifier,
    pipelineIdentifier,
    triggerIdentifier,
    module,
    repoIdentifier,
    branch,
    connectorRef,
    repoName,
    storeType
  })

  if (
    (triggerType === 'WEBHOOK' || triggerType === 'WEBHOOK_CUSTOM' || triggerType === 'SCHEDULER_CRON') &&
    !hasparentpipeline
  ) {
    return (
      <div className={css.trigger}>
        <Icon
          size={14}
          name={triggerType === 'SCHEDULER_CRON' ? 'stopwatch' : 'trigger-execution'}
          margin={{ right: 'small' }}
        />
        {triggerType && triggerIdentifier ? (
          <Link to={triggersWizardPageLinkUrl}>{triggerIdentifier}</Link>
        ) : (
          <Text font={{ size: 'small' }} margin={{ right: 'xsmall' }}>
            {triggerIdentifier}
          </Text>
        )}
        <Text font={{ size: 'small' }} color="grey500">
          ({getString(mapTriggerTypeToStringID(triggerType))})
        </Text>
      </div>
    )
  } else {
    return (
      <div className={css.userLabelContainer}>
        {hasparentpipeline ? (
          <Link
            to={routes.toExecutionPipelineView({
              accountId,
              orgIdentifier: orgid,
              projectIdentifier: projectid,
              pipelineIdentifier: identifier,
              executionIdentifier: executionid,
              module,
              source,
              stage: stagenodeid
            })}
            target="_blank"
            className={css.parentPipelineDetails}
          >
            <Icon name="chained-pipeline" color={Color.PRIMARY_7} size={20} margin={{ right: 'xsmall' }} />
            <Text
              font={{ variation: FontVariation.LEAD }}
              color={Color.PRIMARY_7}
              lineClamp={1}
              style={{ maxWidth: '150px' }}
              margin={{ right: 'xsmall' }}
            >
              {`${identifier}`}
            </Text>
            <Text font={{ variation: FontVariation.LEAD }} color={Color.PRIMARY_7} lineClamp={1}>
              {`(ID: ${runsequence})`}
            </Text>
          </Link>
        ) : (
          <UserLabel
            name={triggeredBy?.identifier || triggeredBy?.extraInfo?.email || ''}
            email={triggeredBy?.extraInfo?.email}
            iconProps={{ size: 16 }}
          />
        )}
      </div>
    )
  }
}

export default function ExecutionMetadata(): React.ReactElement {
  const { pipelineExecutionDetail, pipelineStagesMap } = useExecutionContext()
  const { pipelineExecutionSummary } = pipelineExecutionDetail || {}
  const { getString } = useStrings()
  const HAS_CD = hasCDStage(pipelineExecutionSummary)
  const HAS_CI = hasCIStage(pipelineExecutionSummary)
  const ciData = factory.getSummary(StageType.BUILD)
  const cdData = factory.getSummary(StageType.DEPLOY)

  const renderSingleStageExecutionInfo = (): React.ReactElement | null => {
    const stagesExecutedCount = defaultTo(pipelineExecutionSummary?.stagesExecuted?.length, 0)
    const shouldShowPopover = stagesExecutedCount > LIMIT

    const popoverTable = (
      <HTMLTable small style={{ fontSize: 'small' }}>
        <thead>
          <th>{getString('pipeline.selectiveStageExecution').toLocaleUpperCase()}</th>
        </thead>
        <tbody>
          <div className={css.overflowScroll}>
            {!!pipelineExecutionSummary?.stagesExecutedNames &&
              Object.values(pipelineExecutionSummary.stagesExecutedNames).map(
                (value, i) =>
                  i >= 3 && (
                    <tr key={i}>
                      <td>{value}</td>
                    </tr>
                  )
              )}
          </div>
        </tbody>
      </HTMLTable>
    )
    const popover = (
      <Popover
        wrapperTagName="div"
        targetTagName="div"
        interactionKind="hover"
        position={Position.BOTTOM}
        popoverClassName={css.popover}
      >
        <String
          tagName="div"
          style={{ paddingLeft: 'var(--spacing-3)' }}
          stringID={'common.plusNumberNoSpace'}
          vars={{ number: stagesExecutedCount - LIMIT }}
        />
        {popoverTable}
      </Popover>
    )
    const visible = stagesExecutedCount ? (
      <Tag className={css.singleExecutionTag}>
        {`${getString('pipeline.singleStageExecution')}   ${
          !!pipelineExecutionSummary?.stagesExecutedNames &&
          Object.values(pipelineExecutionSummary.stagesExecutedNames).slice(0, LIMIT).join(', ')
        }`}
        {shouldShowPopover ? popover : null}
      </Tag>
    ) : null
    return visible
  }
  return (
    <div className={css.main}>
      <div className={css.metaContainer}>
        {renderSingleStageExecutionInfo()}
        {HAS_CI && ciData
          ? React.createElement(ciData.component, {
              data: pipelineExecutionSummary?.moduleInfo?.ci,
              nodeMap: pipelineStagesMap
            })
          : null}
        {HAS_CD && cdData
          ? React.createElement(cdData.component, {
              data: pipelineExecutionSummary?.moduleInfo?.cd,
              nodeMap: pipelineStagesMap,
              ...(HAS_CI &&
                ciData && {
                  className: css.cdExecutionContainer
                })
            })
          : null}
      </div>
      <ExecutionMetadataTrigger />
    </div>
  )
}
