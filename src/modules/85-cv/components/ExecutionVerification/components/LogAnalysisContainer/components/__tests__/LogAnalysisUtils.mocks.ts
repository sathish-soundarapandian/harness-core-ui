import type {
  RestResponseAnalyzedRadarChartLogDataWithCountDTO,
  RestResponseLogAnalysisRadarChartListWithCountDTO
} from 'services/cv'

export const logsData: RestResponseLogAnalysisRadarChartListWithCountDTO = {
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

export const logsDataForServicePage: RestResponseAnalyzedRadarChartLogDataWithCountDTO = {
  metaData: {},
  resource: {
    totalClusters: 29,
    eventCounts: [
      { clusterType: 'KNOWN_EVENT', count: 24, displayName: 'Known' },
      { clusterType: 'UNKNOWN_EVENT', count: 4, displayName: 'Unknown' },
      { clusterType: 'UNEXPECTED_FREQUENCY', count: 1, displayName: 'Unexpected Frequency' }
    ],
    logAnalysisRadarCharts: {
      totalPages: 3,
      totalItems: 29,
      pageItemCount: 10,
      pageSize: 10,
      content: [
        {
          message: 'Test Message',
          label: 0,
          risk: 'UNHEALTHY',
          clusterType: 'UNEXPECTED_FREQUENCY',
          count: 258,
          frequencyData: [
            {
              count: 12,
              timestamp: 1
            },
            {
              count: 13,
              timestamp: 1
            }
          ],
          clusterId: '1'
        },
        {
          message:
            '2022-02-10 07:22:59 UTC | TRACE | INFO | (pkg/trace/info/stats.go:104 in LogStats) | No data received',
          label: 30003,
          risk: 'UNHEALTHY',
          clusterType: 'UNKNOWN_EVENT',
          count: 1,
          frequencyData: [
            {
              count: 111,
              timestamp: 32
            },
            {
              count: 78,
              timestamp: 6
            }
          ],
          clusterId: '2'
        }
      ],
      pageIndex: 0,
      empty: false
    }
  },
  responseMessages: []
}

export const expectedData = [
  {
    clusterId: '29659f5a-f6ad-308c-97dc-d54d0ac07c1c',
    clusterType: 'KNOWN',
    count: 8,
    message: 'test data - host1 - log1',
    messageFrequency: [
      {
        data: [
          {
            color: 'var(--grey-300)',
            custom: { timestamp: [1672845060, 1672845120, 1672845180, 1672845240, 1672845300] },
            data: [1, 2, 1, 3, 10],
            type: 'column'
          },
          {
            color: 'var(--primary-5)',
            custom: { timestamp: [1672845420, 1672845480, 1672845540, 1672845600, 1672845660] },
            data: [1, 0, 0, 0, 0],
            type: 'column'
          }
        ],
        hostName: 'host1'
      },
      {
        data: [
          {
            color: 'var(--grey-300)',
            custom: { timestamp: [1672845060, 1672845120, 1672845180, 1672845240, 1672845300] },
            data: [1, 2, 1, 3, 10],
            type: 'column'
          },
          {
            color: 'var(--primary-5)',
            custom: { timestamp: [1672845420, 1672845480, 1672845540, 1672845600, 1672845660] },
            data: [2, 0, 0, 0, 0],
            type: 'column'
          }
        ],
        hostName: 'host2'
      },
      {
        data: [
          {
            color: 'var(--grey-300)',
            custom: { timestamp: [1672845060, 1672845120, 1672845180, 1672845240, 1672845300] },
            data: [1, 2, 1, 3, 10],
            type: 'column'
          },
          {
            color: 'var(--primary-5)',
            custom: { timestamp: [1672845420, 1672845480, 1672845540, 1672845600, 1672845660] },
            data: [0, 0, 0, 2, 2],
            type: 'column'
          }
        ],
        hostName: 'host3'
      },
      {
        data: [
          {
            color: 'var(--grey-300)',
            custom: { timestamp: [1672845060, 1672845120, 1672845180, 1672845240, 1672845300] },
            data: [1, 2, 1, 3, 10],
            type: 'column'
          },
          {
            color: 'var(--primary-5)',
            custom: { timestamp: [1672845420, 1672845480, 1672845540, 1672845600, 1672845660] },
            data: [0, 0, 0, 4, 4],
            type: 'column'
          }
        ],
        hostName: 'host4'
      }
    ],
    riskStatus: 'HEALTHY'
  }
]
