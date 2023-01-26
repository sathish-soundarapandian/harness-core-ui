import type { Tooltip, TooltipFormatterContextObject } from 'highcharts'
import type { LogAnalysisDetailsDrawerProps } from '../LogAnalysisDetailsDrawer.types'

export const drawerPropsMockData: Pick<LogAnalysisDetailsDrawerProps, 'isDataLoading' | 'rowData' | 'logsError'> = {
  rowData: {
    clusterType: 'KNOWN',
    count: 8,
    message: 'test data - host1 - log1',
    clusterId: '29659f5a-f6ad-308c-97dc-d54d0ac07c1c',
    riskStatus: 'HEALTHY',
    messageFrequency: [
      {
        hostName: 'host1',
        data: [
          {
            color: 'var(--grey-300)',
            data: [1, 2, 1, 3, 10],
            type: 'column',
            custom: {
              timestamp: [1672845060, 1672845120, 1672845180, 1672845240, 1672845300]
            }
          },
          {
            color: 'var(--primary-4)',
            data: [1, 0, 0, 0, 0],
            type: 'column',
            custom: {
              timestamp: [1672845420, 1672845480, 1672845540, 1672845600, 1672845660]
            }
          }
        ]
      },
      {
        hostName: 'host2',
        data: [
          {
            color: 'var(--grey-300)',
            data: [1, 2, 1, 3, 10],
            type: 'column',
            custom: {
              timestamp: [1672845060, 1672845120, 1672845180, 1672845240, 1672845300]
            }
          },
          {
            color: 'var(--primary-4)',
            data: [2, 0, 0, 0, 0],
            type: 'column',
            custom: {
              timestamp: [1672845420, 1672845480, 1672845540, 1672845600, 1672845660]
            }
          }
        ]
      }
    ]
  },
  isDataLoading: false,
  logsError: null
}

export const thisValueForTooltip = {
  points: [
    {
      point: {
        index: 1
      }
    }
  ]
} as unknown as Tooltip

export const thisValueForFormatter = {
  ...thisValueForTooltip
} as unknown as TooltipFormatterContextObject
