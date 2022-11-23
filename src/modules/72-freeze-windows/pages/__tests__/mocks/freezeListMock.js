/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const projectLevelFreezeList = {
  status: 'SUCCESS',
  data: {
    totalPages: 1,
    totalItems: 3,
    pageItemCount: 3,
    pageSize: 20,
    content: [
      {
        accountId: 'zEaak-FLS425IEO7OLzMUg',
        type: 'MANUAL',
        status: 'Disabled',
        name: 'Account level freeze2',
        description: '',
        tags: {},
        windows: [
          {
            timeZone: 'Asia/Calcutta',
            startTime: '2022-11-03 11:16 AM',
            duration: null,
            endTime: '2022-12-31 11:59 PM',
            recurrence: null
          }
        ],
        currentOrUpcomingWindow: {
          startTime: 1667454360000,
          endTime: 1672511340000
        },
        identifier: 'Account_level_freeze2',
        createdAt: 1667461223606,
        lastUpdatedAt: 1667461232402,
        freezeScope: 'account',
        yaml: 'freeze:\n  identifier: "Account_level_freeze2"\n  name: "Account level freeze2"\n  description: null\n  status: "Disabled"\n  windows:\n  - timeZone: "Asia/Calcutta"\n    startTime: "2022-11-03 11:16 AM"\n    endTime: "2022-12-31 11:59 PM"\n  entityConfigs:\n  - name: "Rule 1"\n    entities:\n    - filterType: "NotEquals"\n      type: "Org"\n      entityRefs:\n      - "default"\n      - "CV_Stable"\n      - "Another_Test_Organization"\n    - filterType: "All"\n      type: "Project"\n    - filterType: "All"\n      type: "Service"\n    - filterType: "Equals"\n      type: "EnvType"\n      entityRefs:\n      - "Production"\n  - name: "Rule 2"\n    entities:\n    - filterType: "Equals"\n      type: "Org"\n      entityRefs:\n      - "Another_Test_Organization"\n    - filterType: "Equals"\n      type: "Project"\n      entityRefs:\n      - "proj4"\n      - "proj3"\n      - "proj2"\n    - filterType: "All"\n      type: "Service"\n    - filterType: "All"\n      type: "EnvType"\n'
      },
      {
        accountId: 'zEaak-FLS425IEO7OLzMUg',
        type: 'MANUAL',
        status: 'Disabled',
        name: 'account level 2',
        description: '',
        tags: {},
        windows: [
          {
            timeZone: 'Asia/Calcutta',
            startTime: '2022-11-03 11:17 AM',
            duration: '1h',
            endTime: null,
            recurrence: null
          }
        ],
        identifier: 'account_level_2',
        createdAt: 1667454471459,
        lastUpdatedAt: 1667461071473,
        freezeScope: 'account',
        yaml: 'freeze:\n  identifier: "account_level_2"\n  name: "account level 2"\n  description: null\n  status: "Disabled"\n  windows:\n  - timeZone: "Asia/Calcutta"\n    startTime: "2022-11-03 11:17 AM"\n    duration: "1h"\n  entityConfigs:\n  - name: "rule 2"\n    entities:\n    - filterType: "All"\n      type: "Org"\n    - filterType: "All"\n      type: "Project"\n    - filterType: "All"\n      type: "Service"\n    - filterType: "All"\n      type: "EnvType"\n  notificationRules:\n  - name: "Notify Sales Team"\n    enabled: true\n    events:\n    - type: "FreezeWindowEnabled"\n    - type: "TriggerInvocationRejectedDueToFreeze"\n    notificationMethod:\n      type: "Email"\n      spec:\n        userGroups: []\n        recipients:\n        - "ishantmeta01@gmail.com"\n'
      },
      {
        accountId: 'zEaak-FLS425IEO7OLzMUg',
        type: 'MANUAL',
        status: 'Enabled',
        name: 'Account level freeze',
        description: '',
        tags: {},
        windows: [
          {
            timeZone: 'Asia/Calcutta',
            startTime: '2022-11-03 11:16 AM',
            duration: '5h',
            endTime: null,
            recurrence: {
              spec: {
                until: '2022-12-31 11:59 PM'
              },
              type: 'Weekly'
            }
          }
        ],
        currentOrUpcomingWindow: {
          startTime: 1667454360000,
          endTime: 1667472360000
        },
        identifier: 'Account_level_freeze',
        createdAt: 1667454438495,
        lastUpdatedAt: 1667454504771,
        freezeScope: 'account',
        yaml: 'freeze:\n  identifier: "Account_level_freeze"\n  name: "Account level freeze"\n  description: null\n  status: "Enabled"\n  windows:\n  - timeZone: "Asia/Calcutta"\n    startTime: "2022-11-03 11:16 AM"\n    duration: "5h"\n    recurrence:\n      spec:\n        until: "2022-12-31 11:59 PM"\n      type: "Weekly"\n  entityConfigs:\n  - name: "Rule 1"\n    entities:\n    - filterType: "NotEquals"\n      type: "Org"\n      entityRefs:\n      - "default"\n      - "CV_Stable"\n      - "Another_Test_Organization"\n    - filterType: "All"\n      type: "Project"\n    - filterType: "All"\n      type: "Service"\n    - filterType: "Equals"\n      type: "EnvType"\n      entityRefs:\n      - "Production"\n  - name: "Rule 2"\n    entities:\n    - filterType: "Equals"\n      type: "Org"\n      entityRefs:\n      - "Another_Test_Organization"\n    - filterType: "Equals"\n      type: "Project"\n      entityRefs:\n      - "proj4"\n      - "proj3"\n      - "proj2"\n    - filterType: "All"\n      type: "Service"\n    - filterType: "All"\n      type: "EnvType"\n'
      }
    ],
    pageIndex: 0,
    empty: false
  },
  metaData: null,
  correlationId: '3e9d4dc4-bec8-467d-b774-51f0323f91e9'
}
