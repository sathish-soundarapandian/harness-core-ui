export const mockLogAnalysisForServiceHealthProps = {
  data: {
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
                    count: 1
                  }
                ],
                host: 'host1'
              }
            ],
            totalTestFrequencyData: [
              {
                timeStamp: 1672845420,
                count: 3
              },
              {
                timeStamp: 1672845480,
                count: 0
              },
              {
                timeStamp: 1672845540,
                count: 0
              },
              {
                timeStamp: 1672845600,
                count: 6
              },
              {
                timeStamp: 1672845660,
                count: 6
              }
            ],
            averageControlFrequencyData: [
              {
                timeStamp: 1672845060,
                count: 1
              }
            ]
          }
        ],
        pageIndex: 0,
        empty: false
      }
    },
    responseMessages: []
  },
  clusterChartData: null,
  filteredAngle: {
    min: 0,
    max: 360
  },
  logsLoading: true,
  logsError: null,
  clusterChartError: null,
  clusterChartLoading: true,
  activityId: 'Z8CepBdITeW2C2LO-obbzw',
  isErrorTracking: false,
  goToPage: jest.fn(),
  handleAngleChange: jest.fn(),
  refetchLogAnalysis: jest.fn(),
  refetchClusterAnalysis: jest.fn()
}

export const mockLogAnalysisForServiceHealthPropsWithError = {
  ...mockLogAnalysisForServiceHealthProps,
  logsLoading: false,
  logsError: {
    message: 'some error',
    data: 'error data'
  }
}

export const mockLogAnalysisForServiceHealthPropsWithNoData = {
  ...mockLogAnalysisForServiceHealthProps,
  clusterChartLoading: false,
  logsLoading: false,
  data: []
}
