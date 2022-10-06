export const setThresholdStateMockFn = jest.fn()

const formikValues = {
  healthSourceName: 'dyntrace',
  healthSourceIdentifier: 'dyntrace',
  connectorRef: 'org.dynatrace',
  isEdit: true,
  selectedService: {
    label: ':4444',
    value: 'SERVICE-D739201C4CBBA618'
  },
  metricPacks: [
    {
      identifier: 'Performance',
      metricThresholds: [
        {
          type: 'IgnoreThreshold',
          spec: {
            action: 'Ignore'
          },
          criteria: {
            type: 'Absolute',
            spec: {
              greaterThan: 56
            }
          },
          metricType: 'Performance',
          metricName: 'Number of server side errors',
          groupName: 'sdfs'
        }
      ]
    },
    {
      identifier: 'Infrastructure',
      metricThresholds: [
        {
          type: 'FailImmediately',
          spec: {
            action: 'FailAfterOccurrence',
            spec: {
              count: 34
            }
          },
          criteria: {
            type: 'Absolute',
            spec: {
              greaterThan: 1
            }
          },
          metricType: 'Infrastructure',
          metricName: 'IO time',
          groupName: 'xfvd'
        }
      ]
    },
    {
      identifier: 'Custom',
      metricThresholds: [
        {
          type: 'IgnoreThreshold',
          spec: {
            action: 'Ignore'
          },
          criteria: {
            type: 'Absolute',
            spec: {
              greaterThan: 5
            }
          },
          metricType: 'Custom',
          metricName: 'Dynatrace metric 2',
          groupName: 'G2'
        },
        {
          type: 'FailImmediately',
          spec: {
            action: 'FailImmediately',
            spec: {}
          },
          criteria: {
            type: 'Absolute',
            spec: {
              greaterThan: 343
            }
          },
          metricType: 'Custom',
          metricName: 'Dynatrace metric',
          groupName: 'g1'
        }
      ]
    }
  ],
  metricData: {
    Performance: true,
    Infrastructure: true,
    Custom: true
  },
  serviceMethods: ['SERVICE_METHOD-F3988BEE84FF7388'],
  customMetrics: {},
  ignoreThresholds: [
    {
      type: 'IgnoreThreshold',
      spec: {
        action: 'Ignore'
      },
      criteria: {
        type: 'Absolute',
        spec: {
          greaterThan: 56
        }
      },
      metricType: 'Performance',
      metricName: 'Number of server side errors',
      groupName: 'sdfs'
    },
    {
      type: 'IgnoreThreshold',
      spec: {
        action: 'Ignore'
      },
      criteria: {
        type: 'Absolute',
        spec: {
          greaterThan: 5
        }
      },
      metricType: 'Custom',
      metricName: 'Dynatrace metric 2',
      groupName: 'G2'
    }
  ],
  failFastThresholds: [
    {
      type: 'FailImmediately',
      spec: {
        action: 'FailAfterOccurrence',
        spec: {
          count: 34
        }
      },
      criteria: {
        type: 'Absolute',
        spec: {
          greaterThan: 1
        }
      },
      metricType: 'Infrastructure',
      metricName: 'IO time',
      groupName: 'xfvd'
    },
    {
      type: 'FailImmediately',
      spec: {
        action: 'FailImmediately',
        spec: {}
      },
      criteria: {
        type: 'Absolute',
        spec: {
          greaterThan: 343
        }
      },
      metricType: 'Custom',
      metricName: 'Dynatrace metric',
      groupName: 'g1'
    }
  ],
  metricSelector: 'builtin:service.ioTime',
  identifier: 'Dynatrace_metric',
  metricName: 'Dynatrace metric',
  riskCategory: '',
  lowerBaselineDeviation: false,
  higherBaselineDeviation: false,
  groupName: {
    label: 'g1',
    value: 'g1'
  },
  continuousVerification: false,
  healthScore: false,
  sli: true,
  isManualQuery: false,
  showCustomMetric: true
}

export const MockContextValues = {
  formikValues: formikValues,
  metricPacks: [
    {
      identifier: 'Performance'
    },
    {
      identifier: 'Errors'
    }
  ],
  groupedCreatedMetrics: {
    g1: [
      {
        groupName: {
          label: 'g1',
          value: 'g1'
        },
        metricName: 'Dynatrace metric',
        continuousVerification: true
      }
    ]
  },
  setThresholdState: setThresholdStateMockFn
}

export const formikInitialValues = {
  ...formikValues,
  ignoreThresholds: [
    {
      metricType: null,
      groupName: null,
      metricName: null,
      type: 'IgnoreThreshold',
      spec: {
        action: 'Ignore'
      },
      criteria: {
        type: 'Absolute',
        spec: {
          greaterThan: 0,
          lessThan: 0
        }
      }
    }
  ],
  failFastThresholds: [
    {
      metricType: null,
      groupName: null,
      metricName: null,
      type: 'FailImmediately',
      spec: {
        action: 'FailImmediately',
        spec: {}
      },
      criteria: {
        type: 'Absolute',
        spec: {
          greaterThan: 0,
          lessThan: 0
        }
      }
    }
  ]
}
