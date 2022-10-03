/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const Connectors = {
  KUBERNETES_CLUSTER: 'K8sCluster',
  CUSTOM: 'CustomHealth',
  GIT: 'Git',
  GITHUB: 'Github',
  GITLAB: 'Gitlab',
  BITBUCKET: 'Bitbucket',
  VAULT: 'Vault',
  APP_DYNAMICS: 'AppDynamics',
  SPLUNK: 'Splunk',
  DOCKER: 'DockerRegistry',
  GCP: 'Gcp',
  GCP_KMS: 'GcpKms',
  LOCAL: 'Local',
  AWS: 'Aws',
  AWS_CODECOMMIT: 'Codecommit',
  NEXUS: 'Nexus',
  ARTIFACTORY: 'Artifactory',
  CEAWS: 'CEAws',
  HttpHelmRepo: 'HttpHelmRepo',
  Jira: 'Jira',
  NEW_RELIC: 'NewRelic',
  AWS_KMS: 'AwsKms',
  PROMETHEUS: 'Prometheus',
  CE_AZURE: 'CEAzure',
  CE_KUBERNETES: 'CEK8sCluster',
  DATADOG: 'Datadog',
  AZURE_KEY_VAULT: 'AzureKeyVault',
  DYNATRACE: 'Dynatrace',
  SUMOLOGIC: 'SumoLogic',
  CE_GCP: 'GcpCloudCost',
  AWS_SECRET_MANAGER: 'AwsSecretManager',
  PAGER_DUTY: 'PagerDuty',
  SERVICE_NOW: 'ServiceNow',
  CUSTOM_HEALTH: 'CustomHealth',
  ERROR_TRACKING: 'ErrorTracking',
  ELK: 'ELK'
}

export const getConnectorIconByType = (type: string): string => {
  switch (type) {
    case Connectors.APP_DYNAMICS:
      return 'service-appdynamics'
    case Connectors.DATADOG:
      return 'service-datadog'
    case Connectors.CUSTOM_HEALTH:
      return 'service-custom-connector'
    case Connectors.ELK:
      return 'elk'
    case Connectors.SPLUNK:
      return 'service-splunk'
    case Connectors.NEW_RELIC:
      return 'service-newrelic'
    case Connectors.PROMETHEUS:
      return 'service-prometheus'
    case Connectors.DYNATRACE:
      return 'service-dynatrace'
    case Connectors.PAGER_DUTY:
      return 'service-pagerduty'
    case Connectors.GCP:
      return 'service-stackdriver'
    case Connectors.CE_GCP:
    case 'Gcr':
      return 'service-gcp'
    case Connectors.AWS:
      return 'service-aws'
    default:
      return 'placeholder'
  }
}
