import type { LogFeedback } from 'services/cv'
import type { ActivityHeadingContentProps } from '../../LogAnalysisDetailsDrawer.types'

export const messageFrequency: ActivityHeadingContentProps['messageFrequency'] = [
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
  },
  {
    hostName: 'host3',
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
        data: [0, 0, 0, 2, 2],
        type: 'column',
        custom: {
          timestamp: [1672845420, 1672845480, 1672845540, 1672845600, 1672845660]
        }
      }
    ]
  },
  {
    hostName: 'host4',
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
        data: [0, 0, 0, 4, 4],
        type: 'column',
        custom: {
          timestamp: [1672845420, 1672845480, 1672845540, 1672845600, 1672845660]
        }
      }
    ]
  }
]

export const feedbackMock: LogFeedback = {
  feedbackScore: 'HIGH_RISK',
  description:
    'Some applied reason Some applied reason Some applied reason Some applied reason Some applied reasonSome applied reason',
  createdBy: 'pranesh@harness.io',
  createdAt: 1677414780069,
  updatedBy: 'pranesh@harness.io',
  updatedAt: 1677414840933,
  feedbackId: 'abc'
}
