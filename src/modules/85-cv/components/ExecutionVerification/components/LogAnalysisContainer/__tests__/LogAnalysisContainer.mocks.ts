/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { RestResponseLogAnalysisRadarChartListWithCountDTO } from 'services/cv'

export const mockedLogAnalysisData: RestResponseLogAnalysisRadarChartListWithCountDTO = {
  metaData: {},
  resource: {
    totalClusters: 1,
    eventCounts: [
      {
        clusterType: 'KNOWN_EVENT',
        count: 1,
        displayName: 'Known'
      },
      {
        clusterType: 'UNEXPECTED_FREQUENCY',
        count: 0,
        displayName: 'Unexpected Frequency'
      },
      {
        clusterType: 'UNKNOWN_EVENT',
        count: 0,
        displayName: 'Unknown'
      },
      {
        clusterType: 'BASELINE',
        count: 1,
        displayName: 'Baseline'
      }
    ],
    logAnalysisRadarCharts: {
      totalPages: 1,
      totalItems: 1,
      pageItemCount: 1,
      pageSize: 10,
      content: [
        {
          message: 'test data - host1 - log1',
          clusterId: '29659f5a-f6ad-308c-97dc-d54d0ac07c1c',
          label: 0,
          risk: 'HEALTHY',
          clusterType: 'KNOWN_EVENT',
          count: 8,

          testHostFrequencyData: [
            {
              frequencies: [
                {
                  timeStamp: 1672845420,
                  count: 1.0
                },
                {
                  timeStamp: 1672845480,
                  count: 0.0
                },
                {
                  timeStamp: 1672845540,
                  count: 0.0
                },
                {
                  timeStamp: 1672845600,
                  count: 0.0
                },
                {
                  timeStamp: 1672845660,
                  count: 0.0
                }
              ],
              host: 'host1'
            },
            {
              frequencies: [
                {
                  timeStamp: 1672845420,
                  count: 2.0
                },
                {
                  timeStamp: 1672845480,
                  count: 0.0
                },
                {
                  timeStamp: 1672845540,
                  count: 0.0
                },
                {
                  timeStamp: 1672845600,
                  count: 0.0
                },
                {
                  timeStamp: 1672845660,
                  count: 0.0
                }
              ],
              host: 'host2'
            },
            {
              frequencies: [
                {
                  timeStamp: 1672845420,
                  count: 0.0
                },
                {
                  timeStamp: 1672845480,
                  count: 0.0
                },
                {
                  timeStamp: 1672845540,
                  count: 0.0
                },
                {
                  timeStamp: 1672845600,
                  count: 2.0
                },
                {
                  timeStamp: 1672845660,
                  count: 2.0
                }
              ],
              host: 'host3'
            },
            {
              frequencies: [
                {
                  timeStamp: 1672845420,
                  count: 0.0
                },
                {
                  timeStamp: 1672845480,
                  count: 0.0
                },
                {
                  timeStamp: 1672845540,
                  count: 0.0
                },
                {
                  timeStamp: 1672845600,
                  count: 4.0
                },
                {
                  timeStamp: 1672845660,
                  count: 4.0
                }
              ],
              host: 'host4'
            }
          ],
          totalTestFrequencyData: [
            {
              timeStamp: 1672845420,
              count: 3.0
            },
            {
              timeStamp: 1672845480,
              count: 0.0
            },
            {
              timeStamp: 1672845540,
              count: 0.0
            },
            {
              timeStamp: 1672845600,
              count: 6.0
            },
            {
              timeStamp: 1672845660,
              count: 6.0
            }
          ],
          averageControlFrequencyData: [
            {
              timeStamp: 1672845060,
              count: 1
            },
            {
              timeStamp: 1672845120,
              count: 2
            },
            {
              timeStamp: 1672845180,
              count: 1
            },
            {
              timeStamp: 1672845240,
              count: 3
            },
            {
              timeStamp: 1672845300,
              count: 10
            }
          ]
        }
      ],
      pageIndex: 0,
      empty: false
    }
  },
  responseMessages: []
}

export const mockedLogChartsData = {
  metaData: {},
  resource: [
    {
      label: 0,
      message: 'projects/chi-play/logs/stdout',
      risk: 'HEALTHY',
      radius: 1.357564536113864,
      angle: 0.0,
      baseline: {
        label: 0,
        message: 'projects/chi-play/logs/stdout',
        risk: 'NO_ANALYSIS',
        radius: 0.5,
        angle: 0.0,
        baseline: null,
        clusterType: 'BASELINE',
        hasControlData: false
      },
      clusterType: 'KNOWN_EVENT',
      hasControlData: true
    },
    {
      label: 2,
      message: 'projects/chi-play/logs/stderr',
      risk: 'HEALTHY',
      radius: 1.8066135269309567,
      angle: 120.0,
      baseline: {
        label: 2,
        message: 'projects/chi-play/logs/stderr',
        risk: 'NO_ANALYSIS',
        radius: 0.2,
        angle: 120.0,
        baseline: null,
        clusterType: 'BASELINE',
        hasControlData: false
      },
      clusterType: 'KNOWN_EVENT',
      hasControlData: true
    },
    {
      label: 1,
      message: 'projects/chi-play/logs/events',
      risk: 'HEALTHY',
      radius: 1.480099986754282,
      angle: 240.0,
      baseline: {
        label: 1,
        message: 'projects/chi-play/logs/events',
        risk: 'NO_ANALYSIS',
        radius: 0.3698184595475662,
        angle: 240.0,
        baseline: null,
        clusterType: 'BASELINE',
        hasControlData: false
      },
      clusterType: 'KNOWN_EVENT',
      hasControlData: true
    }
  ],
  responseMessages: []
}

export const mockedHealthSourcesData = {
  data: {
    resource: [
      {
        identifier: 'GCO_Health_source',
        name: 'GCO Health source',
        type: 'STACKDRIVER_LOG'
      },
      {
        identifier: 'Appd_Health_source',
        name: 'Appd Health source',
        type: 'APP_DYNAMICS'
      }
    ]
  }
}

export const logsNodeNamesMock = {
  resource: ['V', 'W']
}
