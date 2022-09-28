/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { Feature } from 'services/cf'

const mockFeature: Feature = {
  archived: false,
  createdAt: 1635243729074,
  defaultOffVariation: 'false',
  defaultOnVariation: 'true',
  description: '',
  envProperties: {
    pipelineConfigured: false,
    pipelineDetails: undefined,
    defaultServe: { variation: 'false' },
    environment: 'testnonprod',
    modifiedAt: 1635333973373,
    offVariation: 'false',
    rules: [],
    state: 'on',
    variationMap: [
      {
        targetSegments: ['test_target_group'],
        targets: [{ identifier: 'another_target', name: 'another target' }],
        variation: 'true'
      }
    ],
    version: 56
  },
  evaluation: 'false',
  evaluationIdentifier: 'false',
  identifier: 'new_flag',
  kind: 'boolean',
  modifiedAt: 1635333973371,
  name: 'new flag ',
  owner: ['chris.blakely@harness.io'],
  permanent: false,
  prerequisites: [
    {
      feature: 'Test_Paging_Flag',
      variations: ['false']
    },
    {
      feature: 'X_Flag_11',
      variations: ['false']
    },
    {
      feature: 'X_Flag_10',
      variations: ['true']
    }
  ],
  project: 'chrisgit2',
  results: undefined,
  status: { lastAccess: -6795364578871, status: 'never-requested' },
  services: [
    { name: 'My Service 1', identifier: 'service1Id' },
    { name: 'My Service 2', identifier: 'service2Id' }
  ],
  tags: [],
  variations: [
    { identifier: 'true', name: 'True', value: 'true' },
    { identifier: 'false', name: 'False', value: 'false' }
  ]
}

export default mockFeature
