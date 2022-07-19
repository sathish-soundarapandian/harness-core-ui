/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { Meta, Story } from '@storybook/react'
import { noop } from 'lodash-es'

import { TestWrapper } from '@common/utils/testUtils'
import { ExecutionContext, ExecutionContextParams } from '@pipeline/context/ExecutionContext'
import { StageSelection } from './StageSelection'

const contextValue: ExecutionContextParams = {
  allNodeMap: {},
  pipelineExecutionDetail: {},
  selectedStageId: '',
  selectedStepId: '',
  selectedStageExecutionId: '',
  loading: false,
  isDataLoadedForSelectedStage: false,
  queryParams: {},
  logsToken: '',
  setLogsToken: noop,
  addNewNodeToMap: noop,
  setSelectedStepId: noop,
  setSelectedStageId: noop,
  setSelectedStageExecutionId: noop,
  pipelineStagesMap: new Map([
    ['stage1', { nodeIdentifier: 'stage1', name: 'Stage 1', status: 'Success' }],
    ['stage2', { nodeIdentifier: 'stage2', name: 'Stage 2', status: 'Success' }],
    ['stage3', { nodeIdentifier: 'stage3', name: 'Stage 3', status: 'Success' }]
  ])
}

export default {
  title: 'Pipelines / Components / StageSelection',
  component: StageSelection
} as Meta

export const Basic: Story = args => {
  return (
    <TestWrapper>
      <ExecutionContext.Provider value={contextValue}>
        <StageSelection {...args} />
      </ExecutionContext.Provider>
    </TestWrapper>
  )
}

Basic.args = {}
