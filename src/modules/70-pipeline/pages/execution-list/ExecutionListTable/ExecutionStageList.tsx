/* eslint-disable react/function-component-definition */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Fragment, ReactElement, useMemo } from 'react'
import type { Row } from 'react-table'
import { defaultTo, get } from 'lodash-es'
import cx from 'classnames'
import { Button, ButtonVariation, Icon, Text, useToggleOpen } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import { useParams } from 'react-router-dom'

import { isMultiSvcOrMultiEnv as getIsMultiSvcOrMultiEnv, processLayoutNodeMapV1 } from '@pipeline/utils/executionUtils'
import type { PipelineExecutionSummary } from 'services/pipeline-ng'
import type { PipelineGraphState } from '@pipeline/components/PipelineDiagram/types'
import { killEvent } from '@common/utils/eventUtils'
import { useStrings } from 'framework/strings'
import type {
  ExecutionPathProps,
  GitQueryParams,
  PipelinePathProps,
  PipelineType
} from '@common/interfaces/RouteInterfaces'

import { useQueryParams } from '@common/hooks'
import { ExecutionStage, ExecutionStageProps } from './ExecutionStage'
import { MultiTypeDeploymentSummary } from './MultiTypeDeploymentSummary'

import css from './ExecutionListTable.module.scss'

const LIMIT = 10

export function ExecutionStageWrapper(props: ExecutionStageProps): React.ReactElement {
  const {
    stage,
    row,
    isSelectiveStage,
    pipelineIdentifier,
    executionIdentifier,
    source,
    connectorRef,
    branch,
    repoName,
    storeType
  } = props
  const subType = get(stage, 'data.moduleInfo.stepParameters.subType')
  const allChildren: PipelineGraphState[] = defaultTo(stage.data.children, [])
  const hasMore = allChildren.length > LIMIT
  const isMultiSvcOrMultiEnv = getIsMultiSvcOrMultiEnv(subType)
  const { getString } = useStrings()
  const { isOpen: isStagesExpanded, toggle: toggleStages } = useToggleOpen(true)
  const { isOpen: shouldShowAll, open: showAll } = useToggleOpen()
  const children: PipelineGraphState[] = allChildren.slice(0, hasMore && shouldShowAll ? Infinity : LIMIT)

  return (
    <Fragment>
      {stage.type === 'MATRIX' ? (
        <div className={cx(css.matrixStageList, { [css.multiSvcEnv]: isMultiSvcOrMultiEnv })}>
          <div className={css.matrixLabel}>
            <Icon size={16} name="looping" color={Color.WHITE} />
            {isStagesExpanded ? (
              <Text font={{ variation: FontVariation.SMALL }} color={Color.WHITE} margin={{ left: 'xsmall' }}>
                {isMultiSvcOrMultiEnv ? getString('pipelineSteps.deploy.create.deployStageName') : stage.type}
              </Text>
            ) : null}
          </div>
          {isMultiSvcOrMultiEnv ? (
            <MultiTypeDeploymentSummary
              stage={stage}
              onToggleClick={toggleStages}
              isStagesExpanded={isStagesExpanded}
            />
          ) : (
            <ExecutionStage
              stage={stage}
              isSelectiveStage={isSelectiveStage}
              row={row}
              isMatrixStage
              pipelineIdentifier={pipelineIdentifier}
              executionIdentifier={executionIdentifier}
              source={source}
              connectorRef={connectorRef}
              repoName={repoName}
              branch={branch}
              storeType={storeType}
            />
          )}
          {isStagesExpanded
            ? children.map(loopStage => (
                <ExecutionStage
                  stage={loopStage}
                  key={loopStage.identifier}
                  isSelectiveStage={isSelectiveStage}
                  isMatrixStage
                  row={row}
                  pipelineIdentifier={pipelineIdentifier}
                  executionIdentifier={executionIdentifier}
                  source={source}
                  connectorRef={connectorRef}
                  repoName={repoName}
                  branch={branch}
                  storeType={storeType}
                  link
                />
              ))
            : null}
          {hasMore && !shouldShowAll ? (
            <Button icon="chevron-down" variation={ButtonVariation.LINK} className={css.showAllBtn} onClick={showAll}>
              {getString('showAll')}
            </Button>
          ) : null}
        </div>
      ) : (
        <ExecutionStage
          stage={stage}
          isSelectiveStage={isSelectiveStage}
          row={row}
          pipelineIdentifier={pipelineIdentifier}
          executionIdentifier={executionIdentifier}
          source={source}
          connectorRef={connectorRef}
          repoName={repoName}
          branch={branch}
          storeType={storeType}
        />
      )}

      {stage.children?.map(subStage => (
        <ExecutionStage
          stage={subStage}
          key={subStage.identifier}
          isSelectiveStage={isSelectiveStage}
          pipelineIdentifier={pipelineIdentifier}
          executionIdentifier={executionIdentifier}
          source={source}
          connectorRef={connectorRef}
          repoName={repoName}
          branch={branch}
          storeType={storeType}
        />
      ))}
    </Fragment>
  )
}

export function ExecutionStageList({ row }: { row: Row<PipelineExecutionSummary> }): ReactElement {
  const data = row.original
  const elements = useMemo(() => processLayoutNodeMapV1(data), [data])
  const params = useParams<PipelineType<PipelinePathProps>>()
  const pipelineIdentifier = params.pipelineIdentifier || data.pipelineIdentifier || '-1'
  const executionIdentifier = data.planExecutionId || '-1'
  const source: ExecutionPathProps['source'] = params.pipelineIdentifier ? 'executions' : 'deployments'
  const queryParams = useQueryParams<GitQueryParams>()
  const connectorRef = data.connectorRef ?? queryParams.connectorRef
  const repoName = defaultTo(
    data.gitDetails?.repoName ?? queryParams.repoName,
    data.gitDetails?.repoIdentifier ?? queryParams.repoIdentifier
  )
  const branch = data.gitDetails?.branch ?? queryParams.branch
  const storeType = data.storeType ?? queryParams.storeType

  return (
    <div role="list" onClick={killEvent}>
      {elements?.map(stage => {
        return (
          <ExecutionStageWrapper
            key={stage.identifier}
            stage={stage}
            row={row}
            isSelectiveStage={!!data.stagesExecuted?.length}
            pipelineIdentifier={pipelineIdentifier}
            executionIdentifier={executionIdentifier}
            source={source}
            connectorRef={connectorRef}
            repoName={repoName}
            branch={branch}
            storeType={storeType}
          />
        )
      })}
    </div>
  )
}
