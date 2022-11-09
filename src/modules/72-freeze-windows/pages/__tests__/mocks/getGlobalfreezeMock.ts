/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const getGlobalfreezeDisabledOrgScope = {
  status: 'SUCCESS',
  data: {
    accountId: 'zEaak-FLS425IEO7OLzMUg',
    type: 'GLOBAL',
    status: 'Disabled',
    name: 'Global Freeze',
    description: '',
    tags: {},
    orgIdentifier: 'default',
    identifier: '_GLOBAL_',
    createdAt: 1667453545570,
    lastUpdatedAt: 1667974777934,
    freezeScope: 'org',
    yaml: 'freeze:\n  identifier: "_GLOBAL_"\n  name: "Global Freeze"\n  description: null\n  status: "Disabled"\n'
  },
  metaData: null,
  correlationId: 'd8a3912b-702d-46b3-8259-097066eab865'
}

export const getGlobalfreezeEnabledOrgScope = {
  status: 'SUCCESS',
  data: {
    accountId: 'zEaak-FLS425IEO7OLzMUg',
    type: 'GLOBAL',
    status: 'Enabled',
    name: 'Global Freeze',
    description: '',
    tags: {},
    orgIdentifier: 'default',
    windows: [
      {
        timeZone: 'Asia/Calcutta',
        startTime: '2022-11-09 12:12 PM',
        duration: '2h',
        endTime: null,
        recurrence: null
      }
    ],
    currentOrUpcomingWindow: {
      startTime: 1667976120000,
      endTime: 1667983320000
    },
    identifier: '_GLOBAL_',
    createdAt: 1667453545570,
    lastUpdatedAt: 1667976168493,
    freezeScope: 'org',
    yaml: 'freeze:\n  identifier: _GLOBAL_\n  name: Global Freeze\n  status: Enabled\n  windows:\n    - timeZone: Asia/Calcutta\n      startTime: 2022-11-09 12:12 PM\n      duration: 2h\n'
  },
  metaData: null,
  correlationId: '20cbe817-e323-4b18-9bba-3b25e8d0c894'
}
