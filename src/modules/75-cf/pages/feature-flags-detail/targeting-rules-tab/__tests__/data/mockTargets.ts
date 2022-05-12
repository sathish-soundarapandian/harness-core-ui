/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { Target } from 'services/cf'

const mockTargets: Target[] = [
  {
    account: '',
    anonymous: false,
    attributes: {},
    createdAt: 1646810437267,
    environment: 'qatest',
    identifier: 'target4',
    name: 'target_4',
    org: '',
    project: 'cmproj',
    segments: []
  },
  {
    account: '',
    anonymous: false,
    attributes: {},
    createdAt: 1646810437258,
    environment: 'qatest',
    identifier: 'target3',
    name: 'target_3',
    org: '',
    project: 'cmproj',
    segments: []
  },
  {
    account: '',
    anonymous: false,
    attributes: {},
    createdAt: 1646810408416,
    environment: 'qatest',
    identifier: 'target2',
    name: 'target_2',
    org: '',
    project: 'cmproj',
    segments: []
  },
  {
    account: '',
    anonymous: false,
    attributes: {},
    createdAt: 1646810408416,
    environment: 'qatest',
    identifier: 'target_1',
    name: 'target_1',
    org: '',
    project: 'cmproj',
    segments: []
  }
]

export default mockTargets
