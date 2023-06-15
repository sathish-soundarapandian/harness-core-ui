/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { DelegateGroupDetails } from 'services/portal'

export default {
  activelyConnected: true,
  delegateConfigurationId: 'config-id-1',
  delegateDescription: 'desc 1',
  delegateGroupIdentifier: 'id1',
  delegateInsightsDetails: {},
  delegateInstanceDetails: [],
  delegateType: 'ECS',
  groupCustomSelectors: ['sel-1', 'sel-2'],
  groupHostName: 'group-host-1',
  groupId: 'groupId1',
  groupName: 'group-name-1',
  lastHeartBeat: 1231231,
  groupImplicitSelectors: {
    DELEGATE_NAME: 'DELEGATE_NAME',
    HOST_NAME: 'HOST_NAME',
    PROFILE_NAME: 'PROFILE_NAME'
  }
} as DelegateGroupDetails
