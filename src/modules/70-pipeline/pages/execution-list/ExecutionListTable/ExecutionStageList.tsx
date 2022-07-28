/* eslint-disable react/function-component-definition */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Fragment, ReactElement } from 'react'
import type { Row } from 'react-table'
import { processLayoutNodeMapV1 } from '@pipeline/utils/executionUtils'
import type { PipelineExecutionSummary } from 'services/pipeline-ng'
import { ExecutionStage } from './ExecutionStage'

export function ExecutionStageList({ row }: { row: Row<PipelineExecutionSummary> }): ReactElement {
  const data = row.original
  const elements = processLayoutNodeMapV1(data)

  return (
    <div role="list">
      {elements?.map(stage => {
        return (
          <Fragment key={stage.identifier}>
            <ExecutionStage stage={stage} />
            {stage.children?.map(subStage => (
              <ExecutionStage stage={subStage} key={subStage.identifier} />
            ))}
          </Fragment>
        )
      })}
    </div>
  )
}
