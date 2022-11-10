/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const getGlobalFreezeWithBannerDetailsNoFreeze = {
  status: 'SUCCESS',
  data: {
    activeOrUpcomingGlobalFreezes: []
  },
  metaData: null,
  correlationId: '6db1e6bc-cc96-4b3b-ba90-0d57660c48f0'
}

export const getGlobalFreezeWithBannerDetailsSingleFreeze = {
  status: 'SUCCESS',
  data: {
    activeOrUpcomingGlobalFreezes: [
      {
        window: {
          startTime: 1667976120000,
          endTime: 1667983320000
        },
        windows: [
          {
            timeZone: 'Asia/Calcutta',
            startTime: '2022-11-09 12:12 PM',
            duration: '2h',
            endTime: null,
            recurrence: null
          }
        ],
        identifier: '_GLOBAL_',
        name: 'Global Freeze',
        orgIdentifier: 'default',
        projectIdentifier: null,
        freezeScope: 'org',
        accountId: 'zEaak-FLS425IEO7OLzMUg'
      }
    ]
  },
  metaData: null,
  correlationId: '60ba0aa9-6c63-4a1e-8f35-81a7c5bac50d'
}

export const getGlobalFreezeWithBannerDetailsMultiFreeze = {
  status: 'SUCCESS',
  data: {
    activeOrUpcomingGlobalFreezes: [
      {
        window: {
          startTime: 1667976300000,
          endTime: 1668064500000
        },
        windows: [
          {
            timeZone: 'Asia/Calcutta',
            startTime: '2022-11-09 12:15 PM',
            duration: null,
            endTime: '2022-11-10 12:45 PM',
            recurrence: null
          }
        ],
        identifier: '_GLOBAL_',
        name: 'Global Freeze',
        orgIdentifier: null,
        projectIdentifier: null,
        freezeScope: 'account',
        accountId: 'zEaak-FLS425IEO7OLzMUg'
      },
      {
        window: {
          startTime: 1667976120000,
          endTime: 1667983320000
        },
        windows: [
          {
            timeZone: 'Asia/Calcutta',
            startTime: '2022-11-09 12:12 PM',
            duration: '2h',
            endTime: null,
            recurrence: null
          }
        ],
        identifier: '_GLOBAL_',
        name: 'Global Freeze',
        orgIdentifier: 'default',
        projectIdentifier: null,
        freezeScope: 'org',
        accountId: 'zEaak-FLS425IEO7OLzMUg'
      }
    ]
  },
  metaData: null,
  correlationId: 'aeb97525-c2f7-45d8-b6b6-b68ab0b2fb0e'
}
