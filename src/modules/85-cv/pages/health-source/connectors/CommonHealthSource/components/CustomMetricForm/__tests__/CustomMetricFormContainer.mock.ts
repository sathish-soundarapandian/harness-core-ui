import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

export const mockedCustomMetricFormContainerData = {
  mappedMetrics: new Map(),
  selectedMetric: 'HealthSource Metric',
  connectorIdentifier: 'Sumo_logic',
  isMetricThresholdEnabled: false,
  nonCustomFeilds: {
    appdApplication: '',
    appDTier: '',
    metricData: {},
    ignoreThresholds: [],
    failFastThresholds: []
  },
  createdMetrics: ['HealthSource Metric'],
  isTemplate: false,
  expressions: [],
  healthSourceConfig: {
    customMetrics: {
      enabled: true
    },
    sideNav: {
      shouldBeAbleToDeleteLastMetric: true
    }
  },
  healthSourceData: {
    name: 'a',
    identifier: 'a',
    connectorRef: {
      connector: { identifier: 'Sumo_logic' },
      isEdit: false,
      product: {
        value: 'METRICS',
        label: 'SumoLogic Cloud Metrics'
      },
      type: 'AppDynamics',
      applicationName: '',
      tierName: '',
      customMetricsMap: {}
    },
    groupedCreatedMetrics: {
      'Please Select Group Name': [
        {
          groupName: {
            label: 'Please Select Group Name',
            value: 'Please Select Group Name'
          },
          metricName: ''
        }
      ]
    }
  }
}

const mappedMetrics = new Map()

mappedMetrics.set('dasdaa', {
  identifier: 'dasdaa',
  metricName: 'dasdaa',
  groupName: {
    label: 'Logs Group',
    value: 'logsGroup'
  }
})

export const mockedCustomMetricsFormForLogsTable = {
  mappedMetrics,
  selectedMetric: 'dasdaa',
  connectorIdentifier: 'Sumo_logic',
  isMetricThresholdEnabled: true,
  createdMetrics: [],
  isTemplate: false,
  expressions: [],
  healthSourceConfig: {
    addQuery: {
      label: 'Log',
      enableDefaultGroupName: true
    },
    customMetrics: {
      enabled: true,
      fieldMappings: [
        {
          type: 'JsonSelector',
          label: 'Identifier service path',
          identifier: 'serviceInstance',
          defaultValue: '_sourcehost'
        }
      ],
      queryAndRecords: {
        enabled: true
      },
      logsTable: {
        enabled: true
      }
    },
    sideNav: {
      shouldBeAbleToDeleteLastMetric: true,
      enableDefaultGroupName: true
    }
  },
  healthSourceData: {
    name: 'sdfs',
    identifier: 'sdfs',
    connectorRef: 'Sumo_logic',
    isEdit: false,
    product: {
      value: 'LOGS',
      label: 'SumoLogic Cloud Logs'
    },
    type: 'SumoLogic',
    customMetricsMap: mappedMetrics
  },
  groupedCreatedMetrics: {
    'Logs Group': [
      {
        index: 0,
        groupName: {
          label: 'Logs Group',
          value: 'logsGroup'
        },
        metricName: 'dasdaa'
      }
    ]
  }
}

export const mockedCustomMetricsFormForLogsTableConnectorTemplates = {
  ...mockedCustomMetricsFormForLogsTable,
  connectorIdentifier: RUNTIME_INPUT_VALUE
}

const mappedMetrics2 = new Map()

mappedMetrics2.set('dasdaa', {
  identifier: 'dasdaa',
  metricName: 'dasdaa',
  query: 'Select *',
  groupName: {
    label: 'Logs Group',
    value: 'logsGroup'
  }
})

export const mockedCustomMetricsFormForLogsTable2 = {
  ...mockedCustomMetricsFormForLogsTable,
  mappedMetrics: mappedMetrics2,
  healthSourceData: {
    ...mockedCustomMetricsFormForLogsTable.healthSourceData,
    customMetricsMap: mappedMetrics2
  }
}

export const logsTablePayloadMock = {
  connectorIdentifier: 'Sumo_logic',
  endTime: expect.any(Number),
  healthSourceQueryParams: { serviceInstanceField: '_sourcehost' },
  providerType: 'SUMOLOGIC_LOG',
  query: 'select *',
  startTime: expect.any(Number)
}

export const sampleDataResponse = [
  {
    message: `glide.quota.manager SYSTEM URL= /incident_list.do?
      sysparm_userpref_module=b55fbec4c0a800090088e83d7ff500de&active=true&sysparm_query=active=true^EQ,
      THREAD= http-bio-8080-exec-3, FG= true, TYPE= 1, STATE= 2, USER= null, TIME= 8,807, MEM= 0, ATTRIBUTES= {}`,
    serviceInstance: 'sdfs df sdf sdf sdfsdfsdfsdfsf',
    timestamp: Date.now()
  },
  {
    message: `glide.quota.manager SYSTEM URL= /incident_list.do?
      sysparm_userpref_module=b55fbec4c0a800090088e83d7ff500de&active=true&sysparm_query=active=true^EQ,
      THREAD= http-bio-8080-exec-3, FG= true, TYPE= 1, STATE= 2, USER= null, TIME= 8,807, MEM= 0, ATTRIBUTES= {}`,
    serviceInstance: 'sdfs df sdf sdf sdfsdfsdfsdfsf',
    timestamp: Date.now()
  },
  {
    message: `glide.quota.manager SYSTEM URL= /incident_list.do?
      sysparm_userpref_module=b55fbec4c0a800090088e83d7ff500de&active=true&sysparm_query=active=true^EQ,
      THREAD= http-bio-8080-exec-3, FG= true, TYPE= 1, STATE= 2, USER= null, TIME= 8,807, MEM= 0, ATTRIBUTES= {}`,
    serviceInstance: 'sdfs df sdf sdf sdfsdfsdfsdfsf',
    timestamp: Date.now()
  },
  {
    message: `glide.quota.manager SYSTEM URL= /incident_list.do?
      sysparm_userpref_module=b55fbec4c0a800090088e83d7ff500de&active=true&sysparm_query=active=true^EQ,
      THREAD= http-bio-8080-exec-3, FG= true, TYPE= 1, STATE= 2, USER= null, TIME= 8,807, MEM= 0, ATTRIBUTES= {}`,
    serviceInstance: 'sdfs df sdf sdf sdfsdfsdfsdfsf',
    timestamp: Date.now()
  }
]

export const sampleRawRecordsMock = [
  {
    insertId: '18es9xoe5o7za',
    jsonPayload: {
      statusDetails: 'response_sent_by_backend',
      '@type': 'type.googleapis.com/google.cloud.loadbalancing.type.LoadBalancerLogEntry'
    },
    httpRequest: {
      requestMethod: 'PUT',
      requestUrl:
        'https://app.harness.io/gratis/log-service//stream?accountID=vpCkHKsDSxK9_KYfjCTMKA&key=accountId:vpCkHKsDSxK9_KYfjCTMKA/orgId:default/projectId:PRCHECKS/pipelineId:runUnitTests2/runSequence:5588/level0:pipeline/level1:stages/level2:unittest2/addon:20004',
      requestSize: '236',
      status: 204,
      responseSize: '38',
      userAgent: 'Go-http-client/2.0',
      remoteIp: '34.145.51.27',
      serverIp: '10.138.0.90',
      latency: '0.003925s'
    },
    resource: {
      type: 'http_load_balancer',
      labels: {
        backend_service_name: 'prod-primary-ingress-controller',
        zone: 'global',
        target_proxy_name: 'prod-gclb-target-proxy',
        project_id: 'prod-setup-205416',
        url_map_name: 'prod-gclb',
        forwarding_rule_name: 'prod-frontend'
      }
    },
    timestamp: '2021-07-14T13:00:03.260370Z',
    severity: 'INFO',
    logName: 'projects/prod-setup-205416/logs/requests',
    trace: 'projects/prod-setup-205416/traces/8fe3b2f18d4420149b26a65d777e83be',
    receiveTimestamp: '2021-07-14T13:00:03.417558104Z',
    spanId: '4f71be0a0da5e27d'
  }
]
