/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { NotificationRuleResponse, RestResponseNotificationRuleResponse } from 'services/cv'

export const mockedNotificationsTable = [
  {
    notificationRule: {
      orgIdentifier: 'default',
      projectIdentifier: 'SRMNotificationsTesting',
      identifier: 'asasas',
      name: 'asasas',
      type: 'ServiceLevelObjective',
      conditions: [
        {
          type: 'ErrorBudgetRemainingPercentage',
          spec: {
            threshold: 10
          }
        },
        {
          type: 'ErrorBudgetRemainingMinutes',
          spec: {
            threshold: 2
          }
        },
        {
          type: 'ErrorBudgetBurnRate',
          spec: {
            threshold: 2,
            lookBackDuration: '2m'
          }
        }
      ],
      notificationMethod: {
        type: 'Slack',
        spec: {
          userGroups: null,
          webhookUrl: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX'
        }
      },
      enabled: false
    },
    enabled: false,
    createdAt: 1652788835172,
    lastModifiedAt: 1652789124328
  }
]

export const updateNotificationRulesArgs = {
  conditions: [
    {
      id: '767c51ad-57e4-4703-8a38-e08c388f2c86',
      condition: {
        label: 'Change Impact',
        value: 'ChangeImpact'
      },
      changeType: {
        label: '',
        value: ''
      }
    }
  ],
  notificationRule: {
    id: '767c51ad-57e4-4703-8a38-e08c388f2c86',
    condition: {
      label: 'Change Impact',
      value: 'ChangeImpact'
    },
    changeType: {
      label: '',
      value: ''
    }
  },
  currentField: 'changeType',
  currentFieldValue: [
    {
      label: 'Deployment',
      value: 'Deployment'
    }
  ],
  nextField: 'threshold',
  nextFieldValue: undefined
}

export const updatedNotificationRulesResponse = [
  {
    changeType: [{ label: 'Deployment', value: 'Deployment' }],
    condition: { label: 'Change Impact', value: 'ChangeImpact' },
    id: '767c51ad-57e4-4703-8a38-e08c388f2c86',
    threshold: { label: '', value: '' }
  }
]

export const toggledNotificationResponse = [
  {
    createdAt: 1658578785337,
    enabled: true,
    lastModifiedAt: 1658578785337,
    notificationRule: {
      conditions: [
        { spec: { changeEventTypes: ['Infrastructure'], period: '1m', threshold: 1 }, type: 'ChangeImpact' }
      ],
      identifier: 'tEST_NEW',
      name: 'tEST NEW',
      notificationMethod: { spec: { userGroups: ['account.act_usergroup'], webhookUrl: '' }, type: 'Slack' },
      orgIdentifier: 'SRM',
      projectIdentifier: 'SRMSLOTesting',
      type: 'MonitoredService'
    }
  }
]

export const getUpdatedNotificationsResponse = [
  {
    createdAt: 1658579214570,
    enabled: false,
    lastModifiedAt: 1658579214570,
    notificationRule: {
      conditions: [
        {
          spec: { changeEventTypes: ['Deployment', 'Infrastructure'], period: '20m', threshold: 10 },
          type: 'ChangeImpact'
        }
      ],
      identifier: 'New_notification',
      name: 'New notification',
      notificationMethod: { spec: { userGroups: ['account.AccAdmin'], webhookUrl: '' }, type: 'Slack' },
      orgIdentifier: 'SRM',
      projectIdentifier: 'SRMSLOTesting',
      type: 'MonitoredService'
    }
  },
  {
    createdAt: 1658578785337,
    enabled: true,
    lastModifiedAt: 1658578785337,
    notificationRule: {
      conditions: [
        { spec: { changeEventTypes: ['Infrastructure'], period: '1m', threshold: 1 }, type: 'ChangeImpact' }
      ],
      identifier: 'tEST_NEW',
      name: 'tEST NEW',
      notificationMethod: { spec: { userGroups: ['account.act_usergroup'], webhookUrl: '' }, type: 'Slack' },
      orgIdentifier: 'SRM',
      projectIdentifier: 'SRMSLOTesting',
      type: 'MonitoredService'
    }
  }
]

export const latestNotification = {
  metaData: {},
  resource: {
    notificationRule: {
      orgIdentifier: 'SRM',
      projectIdentifier: 'SRMSLOTesting',
      identifier: 'New_notification',
      name: 'New notification',
      type: 'MonitoredService',
      conditions: [
        {
          type: 'ChangeImpact',
          spec: {
            changeEventTypes: ['Deployment', 'Infrastructure'],
            threshold: 10,
            period: '20m'
          }
        }
      ],
      notificationMethod: {
        type: 'Slack',
        spec: {
          userGroups: ['account.AccAdmin'],
          webhookUrl: ''
        }
      }
    },
    enabled: false,
    createdAt: 1658579214570,
    lastModifiedAt: 1658579214570
  },
  responseMessages: []
} as RestResponseNotificationRuleResponse

export const currentNotificationsInTable = [
  {
    notificationRule: {
      orgIdentifier: 'SRM',
      projectIdentifier: 'SRMSLOTesting',
      identifier: 'tEST_NEW',
      name: 'tEST NEW',
      type: 'MonitoredService',
      conditions: [
        {
          type: 'ChangeImpact',
          spec: {
            changeEventTypes: ['Infrastructure'],
            threshold: 1,
            period: '1m'
          }
        }
      ],
      notificationMethod: {
        type: 'Slack',
        spec: {
          userGroups: ['account.act_usergroup'],
          webhookUrl: ''
        }
      }
    },
    enabled: true,
    createdAt: 1658578785337,
    lastModifiedAt: 1658578785337
  }
] as NotificationRuleResponse[]

export const updatedNotificationsInTable = [
  {
    notificationRule: {
      orgIdentifier: 'SRM',
      projectIdentifier: 'SRMSLOTesting',
      identifier: 'New_notification',
      name: 'New notification',
      type: 'MonitoredService',
      conditions: [
        {
          type: 'ChangeImpact',
          spec: {
            changeEventTypes: ['Deployment', 'Infrastructure'],
            threshold: 10,
            period: '20m'
          }
        }
      ],
      notificationMethod: {
        type: 'Slack',
        spec: {
          userGroups: ['account.AccAdmin'],
          webhookUrl: ''
        }
      }
    },
    enabled: false,
    createdAt: 1658579214570,
    lastModifiedAt: 1658579214570
  },
  {
    notificationRule: {
      orgIdentifier: 'SRM',
      projectIdentifier: 'SRMSLOTesting',
      identifier: 'tEST_NEW',
      name: 'tEST NEW',
      type: 'MonitoredService',
      conditions: [
        {
          type: 'ChangeImpact',
          spec: {
            changeEventTypes: ['Infrastructure'],
            threshold: 1,
            period: '1m'
          }
        }
      ],
      notificationMethod: {
        type: 'Slack',
        spec: {
          userGroups: ['account.act_usergroup'],
          webhookUrl: ''
        }
      }
    },
    enabled: true,
    createdAt: 1658578785337,
    lastModifiedAt: 1658578785337
  },
  {
    notificationRule: {
      orgIdentifier: 'SRM',
      projectIdentifier: 'SRMSLOTesting',
      identifier: 'Test123new',
      name: 'Test123-new',
      type: 'MonitoredService',
      conditions: [
        {
          type: 'ChangeImpact',
          spec: {
            changeEventTypes: ['Deployment', 'Infrastructure'],
            threshold: 25,
            period: '3m'
          }
        }
      ],
      notificationMethod: {
        type: 'Slack',
        spec: {
          userGroups: ['account.AccAdmin', 'account.act_usergroup'],
          webhookUrl: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX'
        }
      }
    },
    enabled: true,
    createdAt: 1653892682680,
    lastModifiedAt: 1658578766445
  },
  {
    notificationRule: {
      orgIdentifier: 'SRM',
      projectIdentifier: 'SRMSLOTesting',
      identifier: 'moninotification',
      name: 'monitored-service-notification',
      type: 'MonitoredService',
      conditions: [
        {
          type: 'ChangeImpact',
          spec: {
            changeEventTypes: ['Deployment', 'Infrastructure'],
            threshold: 80,
            period: '10m'
          }
        },
        {
          type: 'HealthScore',
          spec: {
            threshold: 70,
            period: '10m'
          }
        },
        {
          type: 'ChangeObserved',
          spec: {
            changeEventTypes: ['Deployment', 'Infrastructure', 'Incident']
          }
        }
      ],
      notificationMethod: {
        type: 'Slack',
        spec: {
          userGroups: ['account.AccAdmin'],
          webhookUrl: 'https://hooks.slack.com/services/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'
        }
      }
    },
    enabled: true,
    createdAt: 1653974532738,
    lastModifiedAt: 1653974590316
  },
  {
    notificationRule: {
      orgIdentifier: 'SRM',
      projectIdentifier: 'SRMSLOTesting',
      identifier: 'notify2',
      name: 'notify-2',
      type: 'MonitoredService',
      conditions: [
        {
          type: 'HealthScore',
          spec: {
            threshold: 2,
            period: '2m'
          }
        }
      ],
      notificationMethod: {
        type: 'Slack',
        spec: {
          userGroups: ['account.act_usergroup', 'account.pipelinetest'],
          webhookUrl: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX'
        }
      }
    },
    enabled: true,
    createdAt: 1653892741040,
    lastModifiedAt: 1653892741040
  }
] as NotificationRuleResponse[]
