/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Card, Layout } from '@harness/uicore'
import React, { FC } from 'react'

import type { FeaturePipelineExecution, Variation } from 'services/cf'
import ExecutionCardHeader from './execution-card/ExecutionCardHeader'
import ExecutionCardBody from './execution-card/ExecutionCardBody'
import css from './ExecutionList.module.scss'

interface ExecutionListProps {
  executionHistory: FeaturePipelineExecution[]
  flagVariations: Variation[]
  pipelineIdentifier: string
}

const ExecutionList: FC<ExecutionListProps> = ({ executionHistory, flagVariations, pipelineIdentifier }) => {
  return (
    <Layout.Vertical spacing="medium" role="list">
      {executionHistory.map(executionHistoryItem => (
        <Card elevation={0} className={css.executionCard} key={executionHistoryItem.executionId} role="listitem">
          <ExecutionCardHeader executionHistoryItem={executionHistoryItem} pipelineIdentifier={pipelineIdentifier} />
          <ExecutionCardBody executionHistoryItem={executionHistoryItem} flagVariations={flagVariations} />
        </Card>
      ))}
    </Layout.Vertical>
  )
}

export default ExecutionList
