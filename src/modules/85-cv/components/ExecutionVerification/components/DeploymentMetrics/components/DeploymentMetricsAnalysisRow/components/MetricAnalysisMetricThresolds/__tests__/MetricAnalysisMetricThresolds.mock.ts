import type { MetricThresholdCriteriaV2, MetricThresholdV2 } from 'services/cv'

export const mockedThresholds = {
  thresholds: [
    {
      id: '6L6gbC9oRlCS8ypbtCi0rA',
      thresholdType: 'IGNORE' as MetricThresholdV2['thresholdType'],
      isUserDefined: false,
      action: 'Ignore' as MetricThresholdV2['action'],
      criteria: {
        measurementType: 'ratio' as MetricThresholdCriteriaV2['measurementType'],
        lessThanThreshold: 0
      }
    },
    {
      id: '6L6gbC9oRlCS8ypbtCi0rA',
      thresholdType: 'IGNORE' as MetricThresholdV2['thresholdType'],
      isUserDefined: false,
      action: 'FailImmediately' as MetricThresholdV2['action'],
      criteria: {
        measurementType: 'ratio' as MetricThresholdCriteriaV2['measurementType'],
        lessThanThreshold: 0
      }
    },
    {
      id: '6L6gbC9oRlCS8ypbtCi0rA',
      thresholdType: 'IGNORE' as MetricThresholdV2['thresholdType'],
      isUserDefined: false,
      action: 'FailAfterOccurrence' as MetricThresholdV2['action'],
      criteria: {
        measurementType: 'ratio' as MetricThresholdCriteriaV2['measurementType'],
        lessThanThreshold: 0
      }
    },
    {
      id: '6L6gbC9oRlCS8ypbtCi0rA',
      thresholdType: 'IGNORE' as MetricThresholdV2['thresholdType'],
      isUserDefined: false,
      action: 'FailAfterConsecutiveOccurrence' as MetricThresholdV2['action'],
      criteria: {
        measurementType: 'ratio' as MetricThresholdCriteriaV2['measurementType'],
        lessThanThreshold: 0
      }
    },
    {
      id: '6L6gbC9oRlCS8ypbtCi0rA',
      thresholdType: 'FAIL_FAST' as MetricThresholdV2['thresholdType'],
      isUserDefined: false,
      action: 'Ignore' as MetricThresholdV2['action'],
      criteria: {
        measurementType: 'delta' as MetricThresholdCriteriaV2['measurementType'],
        lessThanThreshold: 0
      }
    },
    {
      id: '6L6gbC9oRlCS8ypbtCi0rA',
      thresholdType: 'IGNORE' as MetricThresholdV2['thresholdType'],
      isUserDefined: false,
      action: 'Ignore' as MetricThresholdV2['action'],
      criteria: {
        measurementType: 'absolute-value' as MetricThresholdCriteriaV2['measurementType'],
        lessThanThreshold: 0
      }
    },
    {
      id: '6L6gbC9oRlCS8ypbtCi0rA',
      thresholdType: 'IGNORE' as MetricThresholdV2['thresholdType'],
      isUserDefined: false,
      action: '',
      criteria: {
        measurementType: 'absolute-value' as MetricThresholdCriteriaV2['measurementType'],
        lessThanThreshold: 0
      }
    },
    {
      id: '6L6gbC9oRlCS8ypbtCi0rA',
      thresholdType: 'IGNORE' as MetricThresholdV2['thresholdType'],
      isUserDefined: false,
      action: 'Ignore' as MetricThresholdV2['action'],
      criteria: ''
    },
    {
      id: 'Fh-N1OUnTmmrBWhqqWqJvQ',
      thresholdType: 'IGNORE' as MetricThresholdV2['thresholdType'],
      isUserDefined: true,
      action: 'Ignore' as MetricThresholdV2['action'],
      criteria: {
        measurementType: 'delta' as MetricThresholdCriteriaV2['measurementType'],
        lessThanThreshold: 0
      }
    },
    {
      id: 'Fh-N1OUnTmmrBWhqqWqJvQ',
      thresholdType: '',
      isUserDefined: true,
      action: '',
      criteria: {
        measurementType: '',
        lessThanThreshold: 0,
        greaterThanThreshold: 10
      }
    },
    {
      id: 'Fh-N1OUnTmmrBWhqqWqJvQ',
      thresholdType: '',
      isUserDefined: true,
      action: '',
      criteria: ''
    },
    {
      id: 'Fh-N1OUnTmmrBWhqqWqJvQ',
      thresholdType: '',
      isUserDefined: true,
      action: '',
      criteria: {
        measurementType: '',
        greaterThanThreshold: 100
      }
    }
  ] as MetricThresholdV2[]
}
