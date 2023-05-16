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

import type { JiraApprovalTabProps } from './JiraApprovalTab';
import { JiraApprovalTab } from './JiraApprovalTab'
import jiraApprovalData from './__tests__/JiraAprovalData.json'

export default {
  title: 'Pipelines / Execution / JiraApprovalTab',
  component: JiraApprovalTab,
  argTypes: {
    type: {
      control: {
        type: 'radio',
        options: ['HarnessApproval', 'JiraApproval']
      }
    }
  }
} as Meta

export const Basic: Story<JiraApprovalTabProps> = args => {
  return (
    <TestWrapper>
      <JiraApprovalTab {...args} />
    </TestWrapper>
  )
}

Basic.args = {
  isWaiting: true,
  approvalData: jiraApprovalData as any
}
