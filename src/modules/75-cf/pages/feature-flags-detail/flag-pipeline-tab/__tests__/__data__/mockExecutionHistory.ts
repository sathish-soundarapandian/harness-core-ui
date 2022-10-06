/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FeaturePipelineExecution } from 'services/cf'

/* 4 Executions:
  - 1. Waiting
  - 2. Success
  - 3. Success (Complex trigger details - default serve/many targets/target groups/percentage rollouts)
  - 4. Failure (1 Stage failed)
*/
const executionHistory: FeaturePipelineExecution[] = [
  {
    createdAt: 1659437602,
    environment: 'Production',
    executionId: '1998',
    runSequence: 1998,
    failedStagesCount: 0,
    status: 'TaskWaiting',
    succeededStagesCount: 2,
    totalStagesCount: 3,
    triggerDetails: {
      state: 'on',
      variationMap: [
        {
          targetSegments: ['All Users'],
          variation: 'True'
        }
      ]
    },
    triggeredBy: 'Brooklyn Simmons'
  },
  {
    createdAt: 1643452356001,
    endTs: 1643468556001,
    environment: 'Production',
    executionId: '1997',
    runSequence: 1997,
    failedStagesCount: 0,
    status: 'Success',
    succeededStagesCount: 3,
    totalStagesCount: 3,
    triggerDetails: {
      rules: [
        {
          clauses: [
            {
              attribute: '',
              negate: false,
              op: 'segmentMatch',
              values: ['Alpha Target Group']
            }
          ],
          priority: 2,
          ruleId: '93fe0bbf-79f4-4d46-98fc-6ebd78708369',
          serve: {
            distribution: {
              bucketBy: 'identifier',
              variations: [
                {
                  variation: 'true',
                  weight: 50
                },
                {
                  variation: 'false',
                  weight: 50
                }
              ]
            }
          }
        }
      ]
    },
    triggeredBy: 'Bessie Cooper'
  },
  {
    createdAt: 1643452356000,
    endTs: 1643468556000,
    environment: 'Production',
    executionId: '1996',
    runSequence: 1996,
    failedStagesCount: 0,
    status: 'Success',
    succeededStagesCount: 3,
    totalStagesCount: 3,
    triggerDetails: {
      defaultOffVariation: { variation: 'false' },
      defaultServe: { variation: 'true' },
      state: 'on',
      variationMap: [
        {
          targets: [
            {
              identifier: 'betaTarget',
              name: 'Beta Target'
            },
            {
              identifier: 'charlieTarget',
              name: 'Charlie Target'
            }
          ],
          variation: 'True'
        },
        {
          targets: [
            {
              identifier: 'deltaTarget',
              name: 'Delta Target'
            }
          ],
          variation: 'False'
        },
        {
          targetSegments: ['User Group 1'],
          variation: 'True'
        },
        {
          targetSegments: ['User Group 2'],
          variation: 'False'
        }
      ],
      rules: [
        {
          clauses: [
            {
              attribute: '',
              negate: false,
              op: 'segmentMatch',
              values: ['User Group 3']
            }
          ],
          priority: 2,
          ruleId: '93fe0bbf-79f4-4d46-98fc-6ebd78708369',
          serve: {
            distribution: {
              bucketBy: 'identifier',
              variations: [
                {
                  variation: 'true',
                  weight: 50
                },
                {
                  variation: 'false',
                  weight: 50
                }
              ]
            }
          }
        },
        {
          clauses: [
            {
              attribute: '',
              negate: false,
              op: 'segmentMatch',
              values: ['User Group 4']
            }
          ],
          priority: 2,
          ruleId: '93fe0bbf-79f4-4d46-98fc-6ebd78708369',
          serve: {
            distribution: {
              bucketBy: 'identifier',
              variations: [
                {
                  variation: 'true',
                  weight: 70
                },
                {
                  variation: 'false',
                  weight: 30
                }
              ]
            }
          }
        }
      ]
    },
    triggeredBy: 'Elenor Pena'
  },
  {
    createdAt: 1643452356003,
    environment: 'Production',
    executionId: '1998',
    runSequence: 1997,
    failedStagesCount: 1,
    status: 'Errored',
    succeededStagesCount: 2,
    totalStagesCount: 3,
    triggerDetails: {
      state: 'on',
      variationMap: [
        {
          targetSegments: ['All Users'],
          variation: 'True'
        }
      ]
    },
    triggeredBy: 'Brooklyn Simmons'
  }
]

export default executionHistory
