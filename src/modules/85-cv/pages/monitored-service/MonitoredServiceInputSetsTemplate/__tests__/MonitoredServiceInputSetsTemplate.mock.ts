/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

export const spec = {
  applicationName: '<+input>',
  tierName: '<+input>',
  metricData: { Errors: true, Performance: true },
  metricDefinitions: [
    {
      identifier: 'appdMetric_101',
      metricName: 'appdMetric 101',
      baseFolder: '',
      metricPath: '',
      completeMetricPath: '<+input>',
      groupName: 'Group 1',
      sli: { enabled: true },
      analysis: {
        riskProfile: { category: 'Performance', metricType: 'RESP_TIME', thresholdTypes: ['ACT_WHEN_HIGHER'] },
        liveMonitoring: { enabled: false },
        deploymentVerification: { enabled: true, serviceInstanceMetricPath: RUNTIME_INPUT_VALUE }
      }
    }
  ],
  feature: 'Application Monitoring',
  connectorRef: '<+input>',
  metricPacks: [{ identifier: 'Errors' }, { identifier: 'Performance' }]
}

export const pathList = [
  {
    name: 'applicationName',
    path: 'path.applicationName'
  },
  {
    name: 'tierName',
    path: 'path.tierName'
  },
  {
    name: 'completeMetricPath',
    path: 'path.metricDefinitions.0.completeMetricPath'
  },
  {
    name: 'serviceInstanceMetricPath',
    path: 'path.metricDefinitions.0.analysis.deploymentVerification.serviceInstanceMetricPath'
  },
  {
    name: 'connectorRef',
    path: 'path.connectorRef'
  }
]

export const templateYamlData = {
  correlationId: '98305889-6183-4b93-84dd-0305a5bef1d1',
  data: {
    accountId: 'zEaak-FLS425IEO7OLzMUg',
    childType: 'Application',
    description: '',
    entityValidityDetails: { valid: true, invalidYaml: null },
    gitDetails: {},
    identifier: 'Demo_Template',
    lastUpdatedAt: 1654668248587,
    name: 'Demo Template ',
    orgIdentifier: 'CVNG',
    projectIdentifier: 'SRM',
    stableTemplate: false,
    tags: {},
    templateEntityType: 'MonitoredService',
    templateScope: 'project',
    version: 1,
    versionLabel: '3',
    yaml: 'template:\n    name: "Demo Template "\n    identifier: Demo_Template\n    versionLabel: "3"\n    type: MonitoredService\n    projectIdentifier: SRM\n    orgIdentifier: CVNG\n    tags: {}\n    spec:\n        serviceRef: <+input>\n        environmentRef: <+input>\n        type: Application\n        sources:\n            healthSources:\n                - name: AppD default metrics runtime connector\n                  identifier: AppD_default_metrics_runtime_connector\n                  type: AppDynamics\n                  spec:\n                      applicationName: <+input>\n                      tierName: <+input>\n                      metricData:\n                          Errors: true\n                          Performance: true\n                      metricDefinitions: []\n                      feature: Application Monitoring\n                      connectorRef: <+input>\n                      metricPacks:\n                          - identifier: Errors\n                          - identifier: Performance\n                - name: Appd with custom and runtime connector\n                  identifier: Appd_with_custom_and_runtime_connector\n                  type: AppDynamics\n                  spec:\n                      applicationName: <+input>\n                      tierName: <+input>\n                      metricData:\n                          Errors: true\n                          Performance: true\n                      metricDefinitions:\n                          - identifier: appdMetric_101\n                            metricName: appdMetric 101\n                            baseFolder: ""\n                            metricPath: ""\n                            completeMetricPath: <+input>\n                            groupName: Group 1\n                            sli:\n                                enabled: true\n                            analysis:\n                                riskProfile:\n                                    category: Performance\n                                    metricType: RESP_TIME\n                                    thresholdTypes:\n                                        - ACT_WHEN_HIGHER\n                                liveMonitoring:\n                                    enabled: false\n                                deploymentVerification:\n                                    enabled: true\n                                    serviceInstanceMetricPath: <+input>\n                      feature: Application Monitoring\n                      connectorRef: <+input>\n                      metricPacks:\n                          - identifier: Errors\n                          - identifier: Performance\n        name: <+monitoredService.serviceRef> <+monitoredService.environmentRef>\n        identifier: <+monitoredService.serviceRef>_<+monitoredService.environmentRef>\n'
  },
  metaData: null,
  status: 'SUCCESS'
}

export const templateYamlDataGCO = {
  status: 'SUCCESS',
  data: {
    accountId: '-k53qRQAQ1O7DBLb9ACnjQ',
    orgIdentifier: 'cvng',
    projectIdentifier: 'Template_testing',
    identifier: 'gco_logs_runtime',
    name: 'gco logs runtime',
    description: '',
    tags: {},
    yaml: 'template:\n  name: gco logs runtime\n  type: MonitoredService\n  projectIdentifier: Template_testing\n  orgIdentifier: cvng\n  tags: {}\n  spec:\n    serviceRef: <+input>\n    environmentRef: qa3\n    type: Application\n    sources:\n      changeSources:\n        - name: Harness CD Next Gen\n          identifier: harness_cd_next_gen\n          type: HarnessCDNextGen\n          enabled: true\n          category: Deployment\n          spec: {}\n      healthSources:\n        - type: Stackdriver\n          identifier: metric\n          name: metric\n          spec:\n            connectorRef: <+input>\n            feature: Cloud Metrics\n            metricDefinitions:\n              - dashboardName: ""\n                dashboardPath: ""\n                metricName: test\n                metricTags:\n                  - ada\n                identifier: test\n                isManualQuery: true\n                jsonMetricDefinition: <+input>\n                riskProfile:\n                  thresholdTypes: []\n                sli:\n                  enabled: true\n                analysis:\n                  riskProfile:\n                    thresholdTypes: []\n                  liveMonitoring:\n                    enabled: false\n                  deploymentVerification:\n                    enabled: false\n    variables:\n      - name: query\n        type: String\n        value: resource.type="k8s_container" resource.labels.location="us-central1-c"\n  identifier: gco_logs_runtime\n  versionLabel: "1"\n',
    versionLabel: '1',
    templateEntityType: 'MonitoredService',
    childType: 'Application',
    templateScope: 'project',
    version: 1,
    gitDetails: {
      objectId: null,
      branch: null,
      repoIdentifier: null,
      rootFolder: null,
      filePath: null,
      repoName: null,
      commitId: null,
      fileUrl: null,
      repoUrl: null
    },
    entityValidityDetails: { valid: true, invalidYaml: null },
    lastUpdatedAt: 1663047103991,
    storeType: 'INLINE',
    stableTemplate: true
  },
  metaData: null,
  correlationId: '458ea1a0-c04d-4180-8e22-5fa4a2511cb8'
}
