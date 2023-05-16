/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { Story, Meta } from '@storybook/react'

import { TestWrapper } from '@common/utils/testUtils'
import type { NotificationRulesItem, NotificationTableProps } from './NotificationTable';
import NotificationTable from './NotificationTable'
import { Actions } from './NotificationUtils'

export default {
  title: 'Common / NotificationTable',
  component: NotificationTable,
  argTypes: {}
} as Meta

const notificationRulesItems: NotificationRulesItem[] = [
  {
    index: 0,
    notificationRules: {
      name: 'name',
      enabled: true,
      pipelineEvents: [{ type: 'AllEvents' }],
      notificationMethod: {
        type: 'Email',
        spec: { userGroups: ['pl-cd-ng'], recipients: ['abc@harness.io'] }
      }
    }
  },
  {
    index: 1,
    notificationRules: {
      name: 'name',
      enabled: true,
      pipelineEvents: [{ type: 'AllEvents' }, { type: 'PipelineFailed' }],
      notificationMethod: {
        type: 'Slack',
        spec: { userGroups: ['pl-cd-ng'], webhookUrls: 'webhookURL' }
      }
    }
  },
  {
    index: 2,
    notificationRules: {
      name: 'name',
      enabled: true,
      pipelineEvents: [{ type: 'AllEvents' }],
      notificationMethod: { type: 'PagerDuty', spec: { userGroups: ['pl-cd-ng'], integrationKeys: '12345' } }
    }
  }
]

const Template: Story<NotificationTableProps> = args => (
  <TestWrapper>
    <NotificationTable {...args} />
  </TestWrapper>
)

export const Basic = Template.bind({})

Basic.args = {
  data: notificationRulesItems,
  onUpdate: (data, action?: Actions) => {
    if (action === Actions.Update) {
      notificationRulesItems[data!.index] = data!
    }
    if (action === Actions.Delete) {
      notificationRulesItems.splice(data!.index, 1)
    }
  },
  totalPages: 1,
  totalItems: 3,
  pageItemCount: 3,
  pageSize: 5,
  pageIndex: 0,
  onFilterType: _type => undefined,
  filterType: ''
}
