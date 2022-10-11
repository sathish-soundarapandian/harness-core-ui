/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

const insightsMock = {
  insights: [
    {
      counts: [
        {
          key: 'SUCCESSFUL',
          value: 1
        },
        {
          key: 'FAILED',
          value: 1
        },
        {
          key: 'IN_PROGRESS',
          value: 1
        },
        {
          key: 'PERPETUAL_TASK_ASSIGNED',
          value: 1
        }
      ],
      timeStamp: 43322342
    }
  ]
} as any

export const delegateGroupsMock: any[] = [
  {
    activelyConnected: true,
    delegateConfigurationId: 'configId1',
    delegateDescription: 'description1',
    delegateGroupIdentifier: 'delGroupIdentifier1',
    delegateInsightsDetails: insightsMock,
    delegateInstanceDetails: [],
    delegateType: 'KUBERNETES',
    groupCustomSelectors: ['customtag1', 'customtag2'],
    groupId: 'dsadsadsad22',
    groupImplicitSelectors: {
      implicitSelector1: 'GROUP_SELECTORS'
    },
    groupName: 'delegate-1',
    lastHeartBeat: 1616541640941,
    autoUpgrade: 'ON'
  },
  {
    activelyConnected: false,
    delegateConfigurationId: 'configId1',
    delegateDescription: 'description1',
    delegateGroupIdentifier: 'delGroupIdentifier2',
    delegateInsightsDetails: {},
    delegateInstanceDetails: [],
    delegateType: 'KUBERNETES',
    groupCustomSelectors: [],
    groupId: 'groupId1',
    groupImplicitSelectors: {},
    groupName: 'Group1',
    lastHeartBeat: 20000,
    autoUpgrade: 'ON'
  },
  {
    groupId: 'ACDJgpvbTeWslY9NrSKU6Q',
    delegateGroupIdentifier: 'cdpworkloadidentitygcp',
    delegateType: 'KUBERNETES',
    groupName: 'cdp-workload-identity-gcp',
    groupImplicitSelectors: {
      'cdp-workload-identity-gcp': 'GROUP_NAME'
    },
    lastHeartBeat: 1662461017905,
    connectivityStatus: 'connected',
    activelyConnected: true,
    grpcActive: false,
    delegateInstanceDetails: [
      {
        uuid: 'k70Mh9EeQ7SDlV9xPfxpHg',
        lastHeartbeat: 1662461017905,
        activelyConnected: true,
        hostName: 'cdp-workload-identity-gcp-0',
        tokenActive: true,
        version: '1.0.76600',
        delegateExpirationTime: 0
      }
    ],
    groupVersion: '1.0.76600',
    tokenActive: true,
    autoUpgrade: 'OFF',
    delegateGroupExpirationTime: 0,
    upgraderLastUpdated: 0,
    immutable: false
  },

  {
    groupId: 'test',
    delegateGroupIdentifier: 'testold',
    delegateType: 'KUBERNETES',
    groupName: 'test-old',
    groupImplicitSelectors: {
      'test-old': 'GROUP_NAME'
    },
    lastHeartBeat: 1662461017905,
    connectivityStatus: 'connected',
    activelyConnected: true,
    grpcActive: false,
    delegateInstanceDetails: [
      {
        uuid: 'k70Mh9EeQ7SDlV9xPfxpHg',
        lastHeartbeat: 1662461017905,
        activelyConnected: true,
        hostName: 'testold-0',
        tokenActive: true,
        version: '1.0.76200',
        delegateExpirationTime: 0
      }
    ],
    groupVersion: '1.0.76200',
    tokenActive: true,
    autoUpgrade: 'ON',
    delegateGroupExpirationTime: 0,
    upgraderLastUpdated: 0,
    immutable: true
  }
]

export const singleDelegateResponseMock = {
  metadata: '',
  resource: {
    delegateGroupDetails: [delegateGroupsMock[0]]
  }
}

export const singleDelegateWithoutTagsResponseMock = {
  metadata: '',
  resource: {
    delegateGroupDetails: [{ ...delegateGroupsMock[0], tags: [] }]
  }
}

export const multipleDelegatesMock = {
  metadata: '',
  resource: {
    delegateGroupDetails: delegateGroupsMock
  }
}
