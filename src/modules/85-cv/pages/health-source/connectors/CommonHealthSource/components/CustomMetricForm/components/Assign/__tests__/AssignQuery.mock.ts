/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { HealthSourceConfig } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import { healthSourceConfigMock } from '../components/RiskProfile/tests/RiskProfile.mock'

export const metricPackResponse = {
  data: {
    metaData: {},
    resource: [
      {
        uuid: '-vIcKFYkQKarOHTJZa_01Q',
        accountId: 'kmpySmUISimoRrJL6NL73w',
        orgIdentifier: 'default',
        projectIdentifier: 'Deepesh_Testing',
        dataSourceType: 'PROMETHEUS',
        identifier: 'Errors',
        category: 'Errors',
        metrics: [
          {
            name: 'Errors',
            type: 'ERROR',
            path: null,
            validationPath: null,
            responseJsonPath: null,
            validationResponseJsonPath: null,
            thresholds: [],
            included: false
          }
        ],
        thresholds: null
      },
      {
        uuid: 'lCTSFk5wR3CjtxEI1Xy5ig',
        accountId: 'kmpySmUISimoRrJL6NL73w',
        orgIdentifier: 'default',
        projectIdentifier: 'Deepesh_Testing',
        dataSourceType: 'PROMETHEUS',
        identifier: 'Infrastructure',
        category: 'Infrastructure',
        metrics: [
          {
            name: 'Infrastructure',
            type: 'INFRA',
            path: null,
            validationPath: null,
            responseJsonPath: null,
            validationResponseJsonPath: null,
            thresholds: [],
            included: false
          }
        ],
        thresholds: null
      },
      {
        uuid: 'qphaYKy9SiCC-ug-CHaViA',
        accountId: 'kmpySmUISimoRrJL6NL73w',
        orgIdentifier: 'default',
        projectIdentifier: 'Deepesh_Testing',
        dataSourceType: 'PROMETHEUS',
        identifier: 'Performance',
        category: 'Performance',
        metrics: [
          {
            name: 'Other',
            type: 'ERROR',
            path: null,
            validationPath: null,
            responseJsonPath: null,
            validationResponseJsonPath: null,
            thresholds: [],
            included: false
          },
          {
            name: 'Throughput',
            type: 'THROUGHPUT',
            path: null,
            validationPath: null,
            responseJsonPath: null,
            validationResponseJsonPath: null,
            thresholds: [],
            included: false
          },
          {
            name: 'Response Time',
            type: 'RESP_TIME',
            path: null,
            validationPath: null,
            responseJsonPath: null,
            validationResponseJsonPath: null,
            thresholds: [],
            included: false
          }
        ],
        thresholds: null
      }
    ],
    responseMessages: []
  },
  response: {},
  loading: false,
  error: null,
  absolutePath:
    '/cv/api/metric-pack?routingId=kmpySmUISimoRrJL6NL73w&projectIdentifier=Deepesh_Testing&orgIdentifier=default&accountId=kmpySmUISimoRrJL6NL73w&dataSourceType=PROMETHEUS'
}

export const labelNamesResponse = {
  data: {
    status: 'SUCCESS',
    data: [
      '__name__',
      'alertname',
      'alertstate',
      'apiservice',
      'app',
      'beta_kubernetes_io_arch',
      'beta_kubernetes_io_instance_type',
      'beta_kubernetes_io_os',
      'boot_id',
      'build_date',
      'cloud_google_com_gke_boot_disk',
      'cloud_google_com_gke_container_runtime',
      'cloud_google_com_gke_nodepool',
      'cloud_google_com_gke_os_distribution',
      'cloud_google_com_machine_family',
      'code',
      'compiler',
      'component',
      'container',
      'container_state',
      'contentType',
      'cpu',
      'device',
      'dockerVersion',
      'endpoint',
      'failure_domain_beta_kubernetes_io_region',
      'failure_domain_beta_kubernetes_io_zone',
      'failure_type',
      'git_commit',
      'git_tree_state',
      'git_version',
      'go_version',
      'group',
      'grpc_code',
      'grpc_method',
      'grpc_service',
      'grpc_type',
      'harness_io_release_name',
      'harness_io_track',
      'host',
      'id',
      'image',
      'instance',
      'interface',
      'job',
      'k8s_app',
      'kernelVersion',
      'kind',
      'kubernetes_io_arch',
      'kubernetes_io_hostname',
      'kubernetes_io_os',
      'kubernetes_namespace',
      'kubernetes_pod_name',
      'le',
      'level',
      'long_running',
      'machine_id',
      'major',
      'mark',
      'method',
      'minor',
      'mode',
      'name',
      'namespace',
      'node',
      'node_kubernetes_io_instance_type',
      'operation',
      'operation_name',
      'operation_type',
      'osVersion',
      'path',
      'persistentvolumeclaim',
      'phase',
      'platform',
      'plugin_name',
      'pod',
      'pod_template_hash',
      'quantile',
      'reason',
      'rejected',
      'removed_release',
      'request_kind',
      'resource',
      'result',
      'scope',
      'server_type',
      'severity',
      'state',
      'status',
      'subresource',
      'system_uuid',
      'topology_kubernetes_io_region',
      'topology_kubernetes_io_zone',
      'type',
      'uid',
      'ulimit',
      'url',
      'username',
      'verb',
      'version',
      'volume_plugin'
    ],
    metaData: null,
    correlationId: 'c09f4886-4313-42a0-981c-94bfcc77615a'
  },
  response: {},
  loading: false,
  error: null,
  absolutePath:
    '/cv/api/prometheus/label-names?routingId=kmpySmUISimoRrJL6NL73w&projectIdentifier=Deepesh_Testing&orgIdentifier=default&accountId=kmpySmUISimoRrJL6NL73w&connectorIdentifier=account.prometheus&tracingId=460c01d1t8s'
}

export const riskProfileResponse = {
  data: {
    metaData: {},
    resource: [
      { identifier: 'Errors', displayName: 'Errors', timeSeriesMetricType: 'ERROR', cvMonitoringCategory: 'Errors' },
      {
        identifier: 'Infrastructure',
        displayName: 'Infrastructure',
        timeSeriesMetricType: 'INFRA',
        cvMonitoringCategory: 'Infrastructure'
      },
      {
        identifier: 'Performance_Throughput',
        displayName: 'Performance/Throughput',
        timeSeriesMetricType: 'THROUGHPUT',
        cvMonitoringCategory: 'Performance'
      },
      {
        identifier: 'Performance_Other',
        displayName: 'Performance/Other',
        timeSeriesMetricType: 'OTHER',
        cvMonitoringCategory: 'Performance'
      },
      {
        identifier: 'Performance_ResponseTime',
        displayName: 'Performance/Response Time',
        timeSeriesMetricType: 'RESP_TIME',
        cvMonitoringCategory: 'Performance'
      }
    ],
    responseMessages: []
  },
  response: {},
  loading: false,
  error: null,
  absolutePath: '/cv/api/risk-category?routingId=-k53qRQAQ1O7DBLb9ACnjQ'
}

export const assignSectionConfig = {
  ...healthSourceConfigMock,
  customMetrics: {
    ...healthSourceConfigMock.customMetrics,
    assign: {
      enabled: true,
      hideCV: true,
      hideServiceIdentifier: true,
      hideSLIAndHealthScore: true,
      defaultServiceInstance: '_sourceHost'
    }
  }
} as HealthSourceConfig
