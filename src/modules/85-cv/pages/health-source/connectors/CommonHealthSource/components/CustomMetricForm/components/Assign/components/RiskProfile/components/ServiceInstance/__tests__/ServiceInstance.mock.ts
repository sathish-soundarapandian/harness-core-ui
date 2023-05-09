import type { RecordProps } from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/components/CommonCustomMetricFormContainer/CommonCustomMetricFormContainerLayout/CommonCustomMetricFormContainer.types'
import type { FIELD_ENUM } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import type { ServiceInstanceProps } from '../ServiceInstance'

export const serviceInstancePropsMock: ServiceInstanceProps = {
  serviceInstanceField: 'sourceHost',
  continuousVerificationEnabled: true,
  serviceInstanceConfig: [
    {
      type: 'JsonSelector' as FIELD_ENUM.JSON_SELECTOR,
      isTemplateSupportEnabled: true,
      label: 'Service Instance Identifier',
      identifier: 'serviceInstanceField'
    }
  ],
  recordProps: {
    isRecordsLoading: false,
    isQueryRecordsAvailable: false,
    sampleRecords: []
  }
}

export const serviceInstancePropsMockWithDefaultValue: ServiceInstanceProps = {
  ...serviceInstancePropsMock,
  serviceInstanceConfig: [
    {
      type: 'JsonSelector' as FIELD_ENUM.JSON_SELECTOR,
      isTemplateSupportEnabled: true,
      label: 'Service Instance Identifier',
      identifier: 'serviceInstanceField',
      defaultValue: 'testDefault'
    }
  ]
}

export const recordsMock = [
  {
    properties: {
      computationId: 'FueGkq4AwAA',
      'container.id': 'c379adde3dc0cdad516022aabd9051816b390388963d0738edfef3d7900aa9e9',
      'container.image.name': 'docker.elastic.co/beats/elastic-agent',
      'container.image.tag': '8.6.1',
      'k8s.cluster.name': 'local-cluster',
      'k8s.container.name': 'elastic-agent',
      'k8s.namespace.name': 'kube-system',
      'k8s.node.name': 'docker-desktop',
      'k8s.pod.name': 'elastic-agent-p5wkn',
      'k8s.pod.uid': 'd07ffd94-032b-4177-bfb3-31a3008ffca4',
      metric_source: 'kubernetes',
      receiver: 'k8scluster',
      sf_createdOnMs: 1681702328000,
      sf_isPreQuantized: true,
      sf_key: [
        'k8s.container.name',
        'k8s.namespace.name',
        'container.image.tag',
        'receiver',
        'k8s.cluster.name',
        'k8s.pod.uid',
        'container.id',
        'computationId',
        'metric_source',
        'k8s.node.name',
        'container.image.name',
        'k8s.pod.name',
        'sf_metric',
        'sf_originatingMetric'
      ],
      sf_metric: '_SF_COMP_FueGkq4AwAA_01-PUBLISH_METRIC',
      sf_organizationID: 'FtkZSjtA0AA',
      sf_originatingMetric: 'k8s.container.memory_request',
      sf_resolutionMs: 10000,
      sf_singletonFixedDimensions: ['sf_metric'],
      sf_type: 'MetricTimeSeries'
    },
    tsId: 'AAAAAH3QKL8'
  },
  {
    data: [
      {
        tsId: 'AAAAABsnoAw',
        value: 1.048576e8
      },
      {
        tsId: 'AAAAAFyvdFk',
        value: 5.24288e8
      },
      {
        tsId: 'AAAAADcZHtE',
        value: 2.097152e8
      },
      {
        tsId: 'AAAAAD0iS34',
        value: 1.048576e8
      },
      {
        tsId: 'AAAAALbaunc',
        value: 7.340032e7
      },
      {
        tsId: 'AAAAAItEG1w',
        value: 5.24288e8
      },
      {
        tsId: 'AAAAAEcekFA',
        value: 7.340032e7
      }
    ],
    logicalTimestampMs: 1681701970000,
    maxDelayMs: 13200
  },
  {
    data: [
      {
        tsId: 'AAAAABsnoAw',
        value: 1.048576e8
      },
      {
        tsId: 'AAAAAFyvdFk',
        value: 5.24288e8
      },
      {
        tsId: 'AAAAADcZHtE',
        value: 2.097152e8
      },
      {
        tsId: 'AAAAAD0iS34',
        value: 1.048576e8
      },
      {
        tsId: 'AAAAALbaunc',
        value: 7.340032e7
      },
      {
        tsId: 'AAAAAItEG1w',
        value: 5.24288e8
      },
      {
        tsId: 'AAAAAEcekFA',
        value: 7.340032e7
      }
    ],
    logicalTimestampMs: 1681701980000,
    maxDelayMs: 13200
  }
]

export const serviceInstancePropsMockWithRecords: RecordProps = {
  isRecordsLoading: false,
  isQueryRecordsAvailable: true,
  sampleRecords: recordsMock
}
