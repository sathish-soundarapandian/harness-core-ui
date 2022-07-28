/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { Story, Meta } from '@storybook/react'
import { HTMLTable } from '@blueprintjs/core'
import { TestWrapper } from '@common/utils/testUtils'
import { ExecutionStatusEnum } from '@pipeline/utils/statusHelpers'
import { ExecutionStatusIcon } from './ExecutionStatusIcon'

export default {
  title: 'Pipelines / Execution / Status Label',
  component: ExecutionStatusIcon,
  argTypes: {}
} as Meta

const allStatuses = Object.values(ExecutionStatusEnum)

const stringsData: Record<string, string> = {
  'pipeline.executionStatus.Aborted': 'ABORTED',
  'pipeline.executionStatus.Running': 'RUNNING',
  'pipeline.executionStatus.Failed': 'FAILED',
  'pipeline.executionStatus.NotStarted': 'NOT STARTED',
  'pipeline.executionStatus.Expired': 'EXPIRED',
  'pipeline.executionStatus.Queued': 'QUEUED',
  'pipeline.executionStatus.Paused': 'PAUSED',
  'pipeline.executionStatus.Waiting': 'WAITING',
  'pipeline.executionStatus.Skipped': 'SKIPPED',
  'pipeline.executionStatus.Success': 'SUCCESS',
  'pipeline.executionStatus.Suspended': 'SUSPENDED',
  'pipeline.executionStatus.Pausing': 'PAUSING',
  'pipeline.executionStatus.ApprovalRejected': 'REJECTED'
}

const getString = (key: string): string => stringsData[key] || key

export const Basic: Story<unknown> = () => {
  return (
    <TestWrapper stringsData={stringsData} getString={getString}>
      <HTMLTable>
        <thead>
          <tr>
            <th>Status</th>
            <th>Label</th>
          </tr>
        </thead>
        <tbody>
          {allStatuses.map(status => (
            <tr key={status}>
              <td>{status}</td>
              <td>
                <ExecutionStatusIcon status={status} />
              </td>
            </tr>
          ))}
        </tbody>
      </HTMLTable>
    </TestWrapper>
  )
}
