/* eslint-disable react/function-component-definition */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Fragment, ReactElement } from 'react'
import type { Row } from 'react-table'
import { Color, FontVariation, Icon, Text } from '@harness/uicore'
import { processLayoutNodeMapV1 } from '@pipeline/utils/executionUtils'
import type { PipelineExecutionSummary } from 'services/pipeline-ng'
import type { PipelineGraphState } from '@pipeline/components/PipelineDiagram/types'
import { killEvent } from '@common/utils/eventUtils'
import { ExecutionStage } from './ExecutionStage'
import css from './ExecutionListTable.module.scss'

export function ExecutionStageList({ row }: { row: Row<PipelineExecutionSummary> }): ReactElement {
  const data = row.original
  const elements = processLayoutNodeMapV1(data)

  return (
    <div role="list" onClick={killEvent}>
      {elements?.map(stage => {
        return (
          <Fragment key={stage.identifier}>
            <ExecutionStage stage={stage} isSelectiveStage={!!data?.stagesExecuted?.length} />
            {stage.type === 'MATRIX' && (
              <div className={css.matrixStageList}>
                <div className={css.matrixLabel}>
                  <Icon size={16} name="looping" color={Color.WHITE} />
                  <Text font={{ variation: FontVariation.SMALL }} color={Color.WHITE} margin={{ left: 'xsmall' }}>
                    {stage.type}
                  </Text>
                </div>
                {(stage.data.children as PipelineGraphState[])?.map(loopStage => (
                  <ExecutionStage
                    stage={loopStage}
                    key={loopStage.identifier}
                    isSelectiveStage={!!data?.stagesExecuted?.length}
                    isMatrixStage
                  />
                ))}
              </div>
            )}
            {stage.children?.map(subStage => (
              <ExecutionStage
                stage={subStage}
                key={subStage.identifier}
                isSelectiveStage={!!data?.stagesExecuted?.length}
              />
            ))}
          </Fragment>
        )
      })}
    </div>
  )
}
