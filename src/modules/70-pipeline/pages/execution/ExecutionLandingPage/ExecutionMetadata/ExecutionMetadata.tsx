/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, Icon, Tag, Popover } from '@wings-software/uicore'
import { HTMLTable, Position } from '@blueprintjs/core'
import { defaultTo } from 'lodash-es'
import { useStrings, String } from 'framework/strings'
import { useExecutionContext } from '@pipeline/context/ExecutionContext'
import { hasCDStage, hasCIStage, StageType } from '@pipeline/utils/stageHelpers'
import factory from '@pipeline/factories/ExecutionFactory'
import type { ExecutorInfoDTO } from 'services/pipeline-ng'
import { mapTriggerTypeToStringID } from '@pipeline/utils/triggerUtils'
import { UserLabel } from '@common/components/UserLabel/UserLabel'

import css from './ExecutionMetadata.module.scss'

// stage executed name limit, exceeding this we will show a popover
const LIMIT = 3

function ExecutionMetadataTrigger(): React.ReactElement {
  const { getString } = useStrings()

  const { pipelineExecutionDetail } = useExecutionContext()
  const { pipelineExecutionSummary } = pipelineExecutionDetail || {}

  const type = pipelineExecutionSummary?.executionTriggerInfo?.triggerType as ExecutorInfoDTO['triggerType']

  if (type === 'WEBHOOK' || type === 'WEBHOOK_CUSTOM' || type === 'SCHEDULER_CRON') {
    return (
      <div className={css.trigger}>
        <Icon
          size={14}
          name={type === 'SCHEDULER_CRON' ? 'stopwatch' : 'trigger-execution'}
          margin={{ right: 'small' }}
        />
        <Text font={{ size: 'small' }} color="primary6" margin={{ right: 'xsmall' }}>
          {pipelineExecutionSummary?.executionTriggerInfo?.triggeredBy?.identifier}
        </Text>
        <Text font={{ size: 'small' }} color="grey500">
          ({getString(mapTriggerTypeToStringID(type))})
        </Text>
      </div>
    )
  } else {
    return (
      <div className={css.userLabelContainer}>
        <UserLabel
          name={
            pipelineExecutionSummary?.executionTriggerInfo?.triggeredBy?.identifier ||
            pipelineExecutionSummary?.executionTriggerInfo?.triggeredBy?.extraInfo?.email ||
            ''
          }
          email={pipelineExecutionSummary?.executionTriggerInfo?.triggeredBy?.extraInfo?.email}
          iconProps={{ size: 16 }}
        />
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
    const countLen = defaultTo(pipelineExecutionSummary?.stagesExecuted?.length, 0)

    const popoverTable = (
      <HTMLTable small style={{ fontSize: 'small' }}>
        <thead>
          <th>{getString('pipeline.selectiveStageExecution').toLocaleUpperCase()}</th>
        </thead>
        <tbody>
          {!!pipelineExecutionSummary?.stagesExecutedNames &&
            Object.values(pipelineExecutionSummary.stagesExecutedNames).map(
              (value, i) =>
                i >= 3 && (
                  <tr key={i}>
                    <td>{value}</td>
                  </tr>
                )
            )}
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
          vars={{ number: Math.abs(countLen - LIMIT) }}
        />
        {popoverTable}
      </Popover>
    )
    const visible = countLen ? (
      <Tag className={css.singleExecutionTag}>
        {`${getString('pipeline.singleStageExecution')}   ${
          !!pipelineExecutionSummary?.stagesExecutedNames &&
          Object.values(pipelineExecutionSummary.stagesExecutedNames).slice(0, LIMIT).join(', ')
        }`}
        {popover}
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
              nodeMap: pipelineStagesMap
            })
          : null}
      </div>
      <ExecutionMetadataTrigger />
    </div>
  )
}
