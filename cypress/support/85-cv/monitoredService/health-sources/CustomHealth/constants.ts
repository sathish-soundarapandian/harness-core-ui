export const baseURLCall = `/ng/api/connectors/customconnector?*`

export const baseURLResponse = {
  status: 'SUCCESS',
  data: {
    connector: {
      name: 'customconnector1',
      identifier: 'customconnector1',
      description: null,
      orgIdentifier: null,
      projectIdentifier: null,
      tags: {},
      type: 'CustomHealth',
      spec: {
        baseURL: 'https://app.datadoghq.com/api/v1/',
        headers: [],
        params: [
          {
            key: 'application_key',
            encryptedValueRef: null,
            value: '37d4030504ef3302049868a43d38c7f42da6b028',
            valueEncrypted: false
          },
          {
            key: 'api_key',
            encryptedValueRef: 'account.ddapikeysecret',
            value: null,
            valueEncrypted: true
          }
        ],
        method: 'GET',
        validationBody: '{"query":"*exception*","time":{"from":"1637095592175","to":"1637181955327"}}',
        validationPath: 'logs-queries/list?',
        delegateSelectors: []
      }
    },
    createdAt: 1639595462540,
    lastModifiedAt: 1642058731415
  },
  metaData: null,
  correlationId: '6474b2da-aa40-4347-bf7b-a7407278328e'
}

export const fetchRecordsCall = '/cv/api/custom-health/sample-data?*'
export const fetchRecordsRespose = {
  status: 'SUCCESS',
  data: {
    status: 'ok',
    resp_version: 1.0,
    series: [
      {
        end: 1.645457579e12,
        attributes: {},
        metric: 'kubernetes.cpu.usage.total',
        interval: 60.0,
        tag_set: ['pod_name:fluentbit-gke-hwksj'],
        start: 1.64545578e12,
        length: 30.0,
        query_index: 0.0,
        aggr: null,
        scope: 'pod_name:fluentbit-gke-hwksj',
        pointlist: [
          [1.64545578e12, 2970892.296875],
          [1.64545584e12, 3320970.9375],
          [1.6454559e12, 3547163.9375],
          [1.64545596e12, 3795073.03125],
          [1.64545602e12, 3215560.5625],
          [1.64545608e12, 3251221.78125],
          [1.64545614e12, 3566361.71875],
          [1.6454562e12, 2796729.03125],
          [1.64545626e12, 3741298.21875],
          [1.64545632e12, 2970393.28125],
          [1.64545638e12, 3251637.5390625],
          [1.64545644e12, 3590339.890625],
          [1.6454565e12, 2988204.703125],
          [1.64545656e12, 3024281.71875],
          [1.64545662e12, 3059430.796875],
          [1.64545668e12, 3755212.765625],
          [1.64545674e12, 3040758.453125],
          [1.6454568e12, 3915693.25],
          [1.64545686e12, 3356260.96875],
          [1.64545692e12, 3513404.0],
          [1.64545698e12, 3232864.609375],
          [1.64545704e12, 3736624.9375],
          [1.6454571e12, 3111074.828125],
          [1.64545716e12, 3357928.21875],
          [1.64545722e12, 3304051.15625],
          [1.64545728e12, 2936706.703125],
          [1.64545734e12, 3901102.0],
          [1.6454574e12, 3236031.6953125],
          [1.64545746e12, 3110968.921875],
          [1.64545752e12, 3322056.875]
        ],
        expression: 'kubernetes.cpu.usage.total{pod_name:fluentbit-gke-hwksj}.rollup(avg, 60)',
        unit: [
          {
            family: 'cpu',
            scale_factor: 1.0e-9,
            name: 'nanocore',
            short_name: 'ncores',
            plural: 'nanocores',
            id: 121.0
          },
          null
        ],
        display_name: 'kubernetes.cpu.usage.total'
      },
      {
        end: 1.645457579e12,
        attributes: {},
        metric: 'kubernetes.cpu.usage.total',
        interval: 60.0,
        tag_set: ['pod_name:kd1-gcp-0'],
        start: 1.64545578e12,
        length: 30.0,
        query_index: 0.0,
        aggr: null,
        scope: 'pod_name:kd1-gcp-0',
        pointlist: [
          [1.64545578e12, 2.78967415e7],
          [1.64545584e12, 2.63259135e7],
          [1.6454559e12, 2.560605e7],
          [1.64545596e12, 2.19936765e7],
          [1.64545602e12, 2.50599005e7],
          [1.64545608e12, 3.2379529e7],
          [1.64545614e12, 2.3405691e7],
          [1.6454562e12, 1.87503325e7],
          [1.64545626e12, 3.17325045e7],
          [1.64545632e12, 2.13035035e7],
          [1.64545638e12, 2.59941355e7],
          [1.64545644e12, 3.1819348e7],
          [1.6454565e12, 2.1497963e7],
          [1.64545656e12, 2.76458585e7],
          [1.64545662e12, 2.5656434e7],
          [1.64545668e12, 2.18762115e7],
          [1.64545674e12, 3.2190286e7],
          [1.6454568e12, 2.520692575e7],
          [1.64545686e12, 2.71886555e7],
          [1.64545692e12, 2.2345727e7],
          [1.64545698e12, 2.677226925e7],
          [1.64545704e12, 2.8456421e7],
          [1.6454571e12, 2.8473843e7],
          [1.64545716e12, 2.69282245e7],
          [1.64545722e12, 2.29987715e7],
          [1.64545728e12, 2.7138511e7],
          [1.64545734e12, 3.6536458e7],
          [1.6454574e12, 2.63215235e7],
          [1.64545746e12, 3.7558511e7],
          [1.64545752e12, 2.3335469e7]
        ],
        expression: 'kubernetes.cpu.usage.total{pod_name:kd1-gcp-0}.rollup(avg, 60)',
        unit: [
          {
            family: 'cpu',
            scale_factor: 1.0e-9,
            name: 'nanocore',
            short_name: 'ncores',
            plural: 'nanocores',
            id: 121.0
          },
          null
        ],
        display_name: 'kubernetes.cpu.usage.total'
      },
      {
        end: 1.645457579e12,
        attributes: {},
        metric: 'kubernetes.cpu.usage.total',
        interval: 60.0,
        tag_set: ['pod_name:oneagent-ktdph'],
        start: 1.64545578e12,
        length: 30.0,
        query_index: 0.0,
        aggr: null,
        scope: 'pod_name:oneagent-ktdph',
        pointlist: [
          [1.64545578e12, 3.93988665e7],
          [1.64545584e12, 6.2008987e7],
          [1.6454559e12, 5.6721879e7],
          [1.64545596e12, 4.38591635e7],
          [1.64545602e12, 5.0816838e7],
          [1.64545608e12, 5.9758916e7],
          [1.64545614e12, 5.4147459e7],
          [1.6454562e12, 5.7008811e7],
          [1.64545626e12, 5.7456113e7],
          [1.64545632e12, 4.1733535e7],
          [1.64545638e12, 5.1308051e7],
          [1.64545644e12, 5.547468e7],
          [1.6454565e12, 5.2554208e7],
          [1.64545656e12, 4.9701618e7],
          [1.64545662e12, 4.9477133e7],
          [1.64545668e12, 6.0174619e7],
          [1.64545674e12, 4.8791613e7],
          [1.6454568e12, 5.4705036e7],
          [1.64545686e12, 5.7324943e7],
          [1.64545692e12, 4.4478247e7],
          [1.64545698e12, 5.57305385e7],
          [1.64545704e12, 4.91394185e7],
          [1.6454571e12, 4.59006255e7],
          [1.64545716e12, 6.6245075e7],
          [1.64545722e12, 5.9399446e7],
          [1.64545728e12, 5.9475966e7],
          [1.64545734e12, 5.0613103e7],
          [1.6454574e12, 4.3721115e7],
          [1.64545746e12, 6.5212565e7],
          [1.64545752e12, 3.4951516e7]
        ],
        expression: 'kubernetes.cpu.usage.total{pod_name:oneagent-ktdph}.rollup(avg, 60)',
        unit: [
          {
            family: 'cpu',
            scale_factor: 1.0e-9,
            name: 'nanocore',
            short_name: 'ncores',
            plural: 'nanocores',
            id: 121.0
          },
          null
        ],
        display_name: 'kubernetes.cpu.usage.total'
      },
      {
        end: 1.645457579e12,
        attributes: {},
        metric: 'kubernetes.cpu.usage.total',
        interval: 60.0,
        tag_set: ['pod_name:oneagent-fp7f7'],
        start: 1.64545578e12,
        length: 30.0,
        query_index: 0.0,
        aggr: null,
        scope: 'pod_name:oneagent-fp7f7',
        pointlist: [
          [1.64545578e12, 3.8924228e7],
          [1.64545584e12, 5.60822495e7],
          [1.6454559e12, 5.3447752e7],
          [1.64545596e12, 4.9451873e7],
          [1.64545602e12, 4.0669035e7],
          [1.64545608e12, 5.9842636e7],
          [1.64545614e12, 4.4458325e7],
          [1.6454562e12, 5.4974307e7],
          [1.64545626e12, 5.4525565e7],
          [1.64545632e12, 4.7863072e7],
          [1.64545638e12, 5.0102758e7],
          [1.64545644e12, 5.5121313e7],
          [1.6454565e12, 4.8580606e7],
          [1.64545656e12, 4.2850911e7],
          [1.64545662e12, 6.12249125e7],
          [1.64545668e12, 4.9251329e7],
          [1.64545674e12, 4.32030365e7],
          [1.6454568e12, 5.6637633e7],
          [1.64545686e12, 4.8904923e7],
          [1.64545692e12, 4.9308157e7],
          [1.64545698e12, 5.88502035e7],
          [1.64545704e12, 4.7046975e7],
          [1.6454571e12, 5.3406133e7],
          [1.64545716e12, 6.3420467e7],
          [1.64545722e12, 4.3196753e7],
          [1.64545728e12, 5.5711921e7],
          [1.64545734e12, 5.8237389e7],
          [1.6454574e12, 5.3144557e7],
          [1.64545746e12, 3.9803849e7],
          [1.64545752e12, 5.2347516e7]
        ],
        expression: 'kubernetes.cpu.usage.total{pod_name:oneagent-fp7f7}.rollup(avg, 60)',
        unit: [
          {
            family: 'cpu',
            scale_factor: 1.0e-9,
            name: 'nanocore',
            short_name: 'ncores',
            plural: 'nanocores',
            id: 121.0
          },
          null
        ],
        display_name: 'kubernetes.cpu.usage.total'
      },
      {
        end: 1.645457579e12,
        attributes: {},
        metric: 'kubernetes.cpu.usage.total',
        interval: 60.0,
        tag_set: ['pod_name:subscriber-86d9d5ddbc-t6f26'],
        start: 1.64545578e12,
        length: 30.0,
        query_index: 0.0,
        aggr: null,
        scope: 'pod_name:subscriber-86d9d5ddbc-t6f26',
        pointlist: [
          [1.64545578e12, 305810.9375],
          [1.64545584e12, 14383.4970703125],
          [1.6454559e12, 14383.4970703125],
          [1.64545596e12, 14383.4970703125],
          [1.64545602e12, 14383.4970703125],
          [1.64545608e12, 14383.4970703125],
          [1.64545614e12, 14383.4970703125],
          [1.6454562e12, 7089439.875],
          [1.64545626e12, 7089439.875],
          [1.64545632e12, 7089439.875],
          [1.64545638e12, 7089439.875],
          [1.64545644e12, 7089439.875],
          [1.6454565e12, 7818063.916666667],
          [1.64545656e12, 18046.556640625],
          [1.64545662e12, 18046.556640625],
          [1.64545668e12, 18046.556640625],
          [1.64545674e12, 18046.556640625],
          [1.6454568e12, 18046.556640625],
          [1.64545686e12, 19745.955078125],
          [1.64545692e12, 279763.53125],
          [1.64545698e12, 279763.53125],
          [1.64545704e12, 279763.53125],
          [1.6454571e12, 279763.53125],
          [1.64545716e12, 279763.53125],
          [1.64545722e12, 3447985.59375],
          [1.64545728e12, 5032096.625],
          [1.64545734e12, 5032096.625],
          [1.6454574e12, 5032096.625],
          [1.64545746e12, 5032096.625],
          [1.64545752e12, 5032096.625]
        ],
        expression: 'kubernetes.cpu.usage.total{pod_name:subscriber-86d9d5ddbc-t6f26}.rollup(avg, 60)',
        unit: [
          {
            family: 'cpu',
            scale_factor: 1.0e-9,
            name: 'nanocore',
            short_name: 'ncores',
            plural: 'nanocores',
            id: 121.0
          },
          null
        ],
        display_name: 'kubernetes.cpu.usage.total'
      },
      {
        end: 1.645457579e12,
        attributes: {},
        metric: 'kubernetes.cpu.usage.total',
        interval: 60.0,
        tag_set: ['pod_name:automationfour-k8s-delegate-rxuxvb-2'],
        start: 1.64545578e12,
        length: 30.0,
        query_index: 0.0,
        aggr: null,
        scope: 'pod_name:automationfour-k8s-delegate-rxuxvb-2',
        pointlist: [
          [1.64545578e12, 3.6433351e8],
          [1.64545584e12, 2.962177e8],
          [1.6454559e12, 3.89942622e8],
          [1.64545596e12, 2.75372368e8],
          [1.64545602e12, 2.76660499e8],
          [1.64545608e12, 2.84128438e8],
          [1.64545614e12, 3.80128026e8],
          [1.6454562e12, 2.7867134e8],
          [1.64545626e12, 4.22691476e8],
          [1.64545632e12, 2.70443178e8],
          [1.64545638e12, 3.20004332e8],
          [1.64545644e12, 3.13461278e8],
          [1.6454565e12, 2.83057208e8],
          [1.64545656e12, 4.1330048e8],
          [1.64545662e12, 3.74296058e8],
          [1.64545668e12, 2.88471502e8],
          [1.64545674e12, 2.74256848e8],
          [1.6454568e12, 2.98185678e8],
          [1.64545686e12, 2.92514444e8],
          [1.64545692e12, 2.67107144e8],
          [1.64545698e12, 3.44460738e8],
          [1.64545704e12, 4.27557286e8],
          [1.6454571e12, 3.10708268e8],
          [1.64545716e12, 2.9692028e8],
          [1.64545722e12, 3.10703226e8],
          [1.64545728e12, 2.68242069e8],
          [1.64545734e12, 2.95620658e8],
          [1.6454574e12, 3.5635253e8],
          [1.64545746e12, 4.31583774e8],
          [1.64545752e12, 1.46479488e8]
        ],
        expression: 'kubernetes.cpu.usage.total{pod_name:automationfour-k8s-delegate-rxuxvb-2}.rollup(avg, 60)',
        unit: [
          {
            family: 'cpu',
            scale_factor: 1.0e-9,
            name: 'nanocore',
            short_name: 'ncores',
            plural: 'nanocores',
            id: 121.0
          },
          null
        ],
        display_name: 'kubernetes.cpu.usage.total'
      },
      {
        end: 1.645457579e12,
        attributes: {},
        metric: 'kubernetes.cpu.usage.total',
        interval: 60.0,
        tag_set: ['pod_name:datadog-agent-new-zbvjk'],
        start: 1.64545578e12,
        length: 30.0,
        query_index: 0.0,
        aggr: null,
        scope: 'pod_name:datadog-agent-new-zbvjk',
        pointlist: [
          [1.64545578e12, 1.7256198885416668e7],
          [1.64545584e12, 1.2362026375e7],
          [1.6454559e12, 1.8355964729166668e7],
          [1.64545596e12, 1.46513170625e7],
          [1.64545602e12, 1.6422575083333334e7],
          [1.64545608e12, 1.4067060958333334e7],
          [1.64545614e12, 1.4943052833333334e7],
          [1.6454562e12, 1.7817917354166668e7],
          [1.64545626e12, 1.4452821270833334e7],
          [1.64545632e12, 1.6038136104166666e7],
          [1.64545638e12, 1.5717540708333334e7],
          [1.64545644e12, 1.57913171875e7],
          [1.6454565e12, 1.5701832645833334e7],
          [1.64545656e12, 1.4132516708333334e7],
          [1.64545662e12, 1.70179693125e7],
          [1.64545668e12, 1.4870437833333334e7],
          [1.64545674e12, 1.5336475135416666e7],
          [1.6454568e12, 1.6729492354166666e7],
          [1.64545686e12, 1.5745238833333334e7],
          [1.64545692e12, 1.4265709166666666e7],
          [1.64545698e12, 1.4400879229166666e7],
          [1.64545704e12, 1.7731008270833332e7],
          [1.6454571e12, 1.53596113125e7],
          [1.64545716e12, 1.3011991354166666e7],
          [1.64545722e12, 1.7153766875e7],
          [1.64545728e12, 1.3690546708333334e7],
          [1.64545734e12, 1.87605844375e7],
          [1.6454574e12, 1.5362675666666666e7],
          [1.64545746e12, 1.4714248208333334e7],
          [1.64545752e12, 1.5260045833333334e7]
        ],
        expression: 'kubernetes.cpu.usage.total{pod_name:datadog-agent-new-zbvjk}.rollup(avg, 60)',
        unit: [
          {
            family: 'cpu',
            scale_factor: 1.0e-9,
            name: 'nanocore',
            short_name: 'ncores',
            plural: 'nanocores',
            id: 121.0
          },
          null
        ],
        display_name: 'kubernetes.cpu.usage.total'
      }
    ],
    to_date: 1.645457555e12,
    query: 'kubernetes.cpu.usage.total{*}by{pod_name}.rollup(avg,60)',
    message: '',
    res_type: 'time_series',
    times: [],
    from_date: 1.645455755e12,
    group_by: ['pod_name'],
    values: []
  },
  metaData: null,
  correlationId: '8d83bf11-8c23-496c-a2fd-f2944e16fa6f'
}

export const monitoredServiceWithCustomHealthSource = {
  status: 'SUCCESS',
  data: {
    createdAt: 1641423752954,
    lastModifiedAt: 1645085265902,
    monitoredService: {
      orgIdentifier: 'default',
      projectIdentifier: 'customhealthtest',
      identifier: 'customDD_prod',
      name: 'customDD_prod',
      type: 'Application',
      description: '',
      serviceRef: 'customDD',
      environmentRef: 'prod',
      environmentRefList: ['prod'],
      tags: {},
      sources: {
        healthSources: [
          {
            name: 'CustomHealth Metric',
            identifier: 'CustomHealth_Metric',
            type: 'CustomHealthMetric',
            spec: {
              connectorRef: 'account.customconnector1',
              metricDefinitions: [
                {
                  identifier: 'CustomHealth_Metric_101',
                  metricName: 'CustomHealth Metric 101',
                  riskProfile: {
                    riskCategory: 'Errors',
                    thresholdTypes: ['ACT_WHEN_HIGHER', 'ACT_WHEN_LOWER']
                  },
                  analysis: {
                    liveMonitoring: {
                      enabled: true
                    },
                    deploymentVerification: {
                      enabled: false,
                      serviceInstanceFieldName: null,
                      serviceInstanceMetricPath: null
                    },
                    riskProfile: {
                      riskCategory: 'Errors',
                      thresholdTypes: ['ACT_WHEN_HIGHER', 'ACT_WHEN_LOWER']
                    }
                  },
                  sli: {
                    enabled: false
                  },
                  requestDefinition: {
                    urlPath:
                      'query?query=avg:system.disk.free{*}.rollup(avg, 60)&from=start_time_seconds&to=end_time_seconds&pod_name=harness-datadog-dummy-pipeline-deployment-canary-76586cb6fvjsfp',
                    requestBody: '',
                    method: 'GET',
                    startTimeInfo: {
                      placeholder: 'start_time_seconds',
                      timestampFormat: 'SECONDS',
                      customTimestampFormat: ''
                    },
                    endTimeInfo: {
                      placeholder: 'end_time_seconds',
                      timestampFormat: 'SECONDS',
                      customTimestampFormat: ''
                    }
                  },
                  queryType: 'SERVICE_BASED',
                  metricResponseMapping: {
                    metricValueJsonPath: '$.series.[*].metric',
                    timestampJsonPath: '$.series.[*].start',
                    serviceInstanceJsonPath: null,
                    timestampFormat: ''
                  },
                  groupName: 'Group 1'
                }
              ]
            }
          }
        ],
        changeSources: []
      },
      dependencies: []
    }
  },
  metaData: null,
  correlationId: '46d05db2-5e21-4b28-b621-1e631c5d9c11'
}
