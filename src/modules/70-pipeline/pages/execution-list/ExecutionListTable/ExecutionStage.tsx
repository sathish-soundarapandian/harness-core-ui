/* eslint-disable react/function-component-definition */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color, FontVariation } from '@harness/design-system'
import { Icon, IconProps, Layout, Text } from '@harness/uicore'
import React from 'react'
import type { CellProps } from 'react-table'
import cx from 'classnames'
import { defaultTo, isEmpty } from 'lodash-es'
import { Link, useParams } from 'react-router-dom'

import { Duration } from '@common/components'
import { ExecutionStatusIcon } from '@pipeline/components/ExecutionStatusIcon/ExecutionStatusIcon'
import type { PipelineGraphState } from '@pipeline/components/PipelineDiagram/types'
import { StageType } from '@pipeline/utils/stageHelpers'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import { useStrings } from 'framework/strings'
import type { PipelineExecutionSummary } from 'services/pipeline-ng'
import executionFactory from '@pipeline/factories/ExecutionFactory'
import type { ExecutionCardInfoProps } from '@pipeline/factories/ExecutionFactory/types'
import { CardVariant } from '@pipeline/utils/constants'
import routes from '@common/RouteDefinitions'
import type { ExecutionPathProps, PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { StoreMetadata } from '@common/constants/GitSyncTypes'

import { StepNodeType } from '@pipeline/utils/executionUtils'
import GitOpsExecutionSummary from './GitOpsExecutionSummary'
import { CDExecutionSummary } from './CDExecutionSummary'

import css from './ExecutionListTable.module.scss'

export interface ExecutionStageProps {
  row?: CellProps<PipelineExecutionSummary>['row']
  stage: PipelineGraphState
  isSelectiveStage: boolean
  isMatrixStage?: boolean
  link?: boolean
  pipelineIdentifier: string
  executionIdentifier: string
  source: ExecutionPathProps['source']
  connectorRef?: string
  repoName?: string
  branch?: string
  storeType?: StoreMetadata['storeType']
}

export const stageIconMap: Partial<Record<StageType, IconProps>> = {
  [StageType.BUILD]: { name: 'ci-solid' },
  [StageType.DEPLOY]: { name: 'cd-solid' },
  [StageType.SECURITY]: { name: 'sto-color-filled' },
  [StageType.FEATURE]: { name: 'ff-solid' },
  [StageType.APPROVAL]: { name: 'approval-stage-icon' },
  [StageType.CUSTOM]: { name: 'pipeline-custom' },
  [StageType.MATRIX]: { name: 'looping', color: Color.GREY_900 },
  [StageType.PIPELINE]: { name: 'chained-pipeline' }
}

export function ExecutionStage(props: ExecutionStageProps): React.ReactElement {
  const {
    stage,
    isSelectiveStage,
    isMatrixStage,
    row,
    link,
    pipelineIdentifier,
    executionIdentifier,
    source,
    connectorRef,
    branch,
    repoName,
    storeType
  } = props
  const pipelineExecution = row?.original
  const { getString } = useStrings()
  const stageIconProps = stageIconMap[stage.type as StageType]
  const data: PipelineExecutionSummary = stage.data || {}
  const stageFailureMessage = data?.failureInfo?.message
  // TODO: others stages UX not available yet
  const cdStageInfo = (stage.data as PipelineExecutionSummary)?.moduleInfo?.cd || {}
  const stoStageInfo = (stage.data as PipelineExecutionSummary)?.moduleInfo?.sto || {}
  const stoInfo = executionFactory.getCardInfo(StageType.SECURITY)
  const selectedNodeId = stage?.data?.nodeType === StepNodeType.RUNTIME_INPUT ? stage.identifier : stage.id
  const {
    accountId,
    orgIdentifier,
    projectIdentifier,
    module: harnessModule
  } = useParams<PipelineType<ProjectPathProps>>()
  return (
    <div className={cx(css.stage, { [css.matrixStage]: isMatrixStage })}>
      <Layout.Horizontal
        spacing="small"
        flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
        padding={{ left: 'medium' }}
      >
        {stageIconProps && <Icon size={16} {...stageIconProps} />}
        {link ? (
          <Link
            className={css.stageLink}
            to={routes.toExecutionPipelineView({
              accountId,
              orgIdentifier,
              projectIdentifier,
              pipelineIdentifier,
              executionIdentifier,
              module: harnessModule,
              source,
              connectorRef,
              branch,
              repoName,
              storeType,
              stage: stage.stageNodeId ?? selectedNodeId,
              ...(stage.stageNodeId && { stageExecId: stage.id })
            })}
          >
            {stage.name}
          </Link>
        ) : (
          <Text font={{ size: 'small' }} color={Color.GREY_900} lineClamp={1}>
            {stage.name}
          </Text>
        )}
      </Layout.Horizontal>

      <ExecutionStatusIcon status={data?.status as ExecutionStatus} />

      <div className={css.stageInfo}>
        <CDExecutionSummary stageInfo={cdStageInfo} />
        <GitOpsExecutionSummary stageInfo={cdStageInfo} />

        {stage.type === StageType.SECURITY &&
          !isEmpty(stoStageInfo) &&
          stoInfo &&
          React.createElement<ExecutionCardInfoProps<PipelineExecutionSummary>>(stoInfo.component, {
            data: defaultTo(pipelineExecution, {}),
            nodeMap: defaultTo(pipelineExecution?.layoutNodeMap, {}),
            startingNodeId: defaultTo(pipelineExecution?.startingNodeId, ''),
            variant: CardVariant.Default
          })}

        {isSelectiveStage && (
          <div className={css.selectiveStageExecution}>
            <Icon name="info" size={10} color={Color.GREY_600} />
            <Text margin={{ left: 'xsmall' }} font={{ variation: FontVariation.TINY_SEMI }} color={Color.GREY_600}>
              {getString('pipeline.selectiveStageExecution')}
            </Text>
          </div>
        )}

        {stageFailureMessage && (
          <Text font={{ size: 'small' }} color={Color.RED_800} lineClamp={1}>
            {stageFailureMessage}
          </Text>
        )}
      </div>

      <Duration
        startTime={data?.startTs}
        endTime={data?.endTs}
        font={{ variation: FontVariation.TINY }}
        color={Color.GREY_600}
        durationText=""
      />
    </div>
  )
}
