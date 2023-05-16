/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { Story, Meta } from '@storybook/react'
// import styled from '@emotion/styled'
import { TestWrapper } from '@common/utils/testUtils'

import type { HarnessApprovalTabProps } from './HarnessApprovalTab';
import { HarnessApprovalTab } from './HarnessApprovalTab'
import harnessApprovalData from './__tests__/HarnessApprovalData.json'

export default {
  title: 'Pipelines / Execution / HarnessApprovalTab',
  component: HarnessApprovalTab,
  argTypes: {
    type: {
      control: {
        type: 'radio',
        options: ['HarnessApproval', 'JiraApproval']
      }
    }
  }
} as Meta

export const Basic: Story<HarnessApprovalTabProps> = args => {
  return (
    <TestWrapper>
      <HarnessApprovalTab {...args} />
    </TestWrapper>
  )
}

Basic.args = {
  isWaiting: true,
  authData: {
    data: { authorized: true }
  },
  approvalData: harnessApprovalData as any
}
