/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ConnectivityModeType } from '@common/components/ConnectivityMode/ConnectivityMode'
import type { IGitContextFormProps } from '@common/components/GitContextForm/GitContextForm'
import type { SaveToGitFormInterface } from '@common/components/SaveToGitForm/SaveToGitForm'
import type { UseStringsReturn } from 'framework/strings'
import type {
  GetTemplateProps,
  GetTemplateResponse
} from 'framework/Templates/TemplateSelectorContext/useTemplateSelector'
import type {
  ConnectorInfoDTO,
  ConnectorConnectivityDetails,
  Activity,
  EntityDetail,
  ConnectorRequestBody,
  ResponseBoolean,
  Connector
} from 'services/cd-ng'

interface ConnectorType {
  [key: string]: ConnectorInfoDTO['type']
}
interface ConnectorStatusType {
  [key: string]: ConnectorConnectivityDetails['status']
}

interface ReferenceEntityType {
  [key: string]: EntityDetail['type']
}

interface ActivityStatusType {
  [key: string]: Activity['activityStatus']
}

interface ActivityType {
  [key: string]: Activity['type']
}

export interface ConnectorCreateEditProps {
  gitData?: SaveToGitFormInterface
  payload?: Connector
}

export interface HelpPanelOptions {
  contentWidth: number
  referenceId: string
}
export interface CreateConnectorModalProps {
  onClose: () => void
  onSuccess: (data?: ConnectorRequestBody) => void | Promise<void>
  isEditMode: boolean
  setIsEditMode: (val: boolean) => void
  connectorInfo: ConnectorInfoDTO | void
  gitDetails?: IGitContextFormProps
  status?: ConnectorConnectivityDetails
  connectivityMode?: ConnectivityModeType
  setConnectivityMode?: (val: ConnectivityModeType) => void
  accountId: string
  orgIdentifier: string
  projectIdentifier: string
  mock?: ResponseBoolean
  getTemplate?: (data: GetTemplateProps) => Promise<GetTemplateResponse>
}

export const Connectors: ConnectorType = {
  KUBERNETES_CLUSTER: 'K8sCluster',
  CUSTOM: 'CustomHealth',
  GIT: 'Git',
  GITHUB: 'Github',
  GITLAB: 'Gitlab',
  BITBUCKET: 'Bitbucket',
  AZURE_REPO: 'AzureRepo',
  AZURE_ARTIFACTS: 'AzureArtifacts',
  VAULT: 'Vault',
  APP_DYNAMICS: 'AppDynamics',
  SPLUNK: 'Splunk',
  DOCKER: 'DockerRegistry',
  GCP: 'Gcp',
  GCP_KMS: 'GcpKms',
  LOCAL: 'Local',
  AWS: 'Aws',
  PDC: 'Pdc',
  AWS_CODECOMMIT: 'Codecommit',
  NEXUS: 'Nexus',
  ARTIFACTORY: 'Artifactory',
  CEAWS: 'CEAws',
  HttpHelmRepo: 'HttpHelmRepo',
  OciHelmRepo: 'OciHelmRepo',
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
  AZURE: 'Azure',
  AWSSECRETMANAGER: 'AwsSecretManager',
  JENKINS: 'Jenkins',
  CUSTOM_SECRET_MANAGER: 'CustomSecretManager',
  ELK: 'ElasticSearch',
  GcpSecretManager: 'GcpSecretManager',
  SPOT: 'Spot',
  TAS: 'Tas',
  TERRAFORM_CLOUD: 'TerraformCloud',
  Bamboo: 'Bamboo'
}

export const ConnectorLabels: Record<ConnectorInfoDTO['type'], string> = {
  K8sCluster: 'K8sCluster',
  Git: 'Git',
  Splunk: 'Splunk',
  AppDynamics: 'AppDynamics',
  Prometheus: 'Prometheus',
  Dynatrace: 'Dynatrace',
  Bamboo: 'Bamboo',
  Vault: 'Vault',
  AzureKeyVault: 'AzureKeyVault',
  DockerRegistry: 'DockerRegistry',
  Local: 'Local',
  AwsKms: 'AwsKms',
  GcpKms: 'GcpKms',
  AwsSecretManager: 'AwsSecretManager',
  Gcp: 'GCP',
  Aws: 'AWS',
  Azure: 'Azure',
  Artifactory: 'Artifactory',
  Jira: 'Jira',
  Nexus: 'Nexus',
  Github: 'Github',
  Gitlab: 'Gitlab',
  Bitbucket: 'Bitbucket',
  Codecommit: 'Codecommit',
  CEAws: 'AWS',
  CEAzure: 'Azure',
  GcpCloudCost: 'GcpCloudCost',
  CEK8sCluster: 'K8sCluster',
  HttpHelmRepo: 'HttpHelmRepo',
  NewRelic: 'NewRelic',
  Datadog: 'Datadog',
  SumoLogic: 'SumoLogic',
  PagerDuty: 'PagerDuty',
  CustomHealth: 'CustomHealth',
  ServiceNow: 'ServiceNow',
  ErrorTracking: 'ErrorTracking',
  Pdc: 'PDC',
  AzureRepo: 'AzureRepo',
  Jenkins: 'Jenkins',
  OciHelmRepo: 'OciHelmRepo',
  CustomSecretManager: 'CustomSecretManager',
  ElasticSearch: 'ElasticSearch',
  GcpSecretManager: 'GcpSecretManager',
  AzureArtifacts: 'AzureArtifacts',
  Spot: 'Spot',
  Tas: 'TAS',
  TerraformCloud: 'TerraformCloud'
}

export const ConnectorStatus: ConnectorStatusType = {
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE'
}

export const EntityTypes: ReferenceEntityType = {
  PIPELINE: 'Pipelines',
  PROJECT: 'Projects',
  CONNECTOR: 'Connectors',
  SECRET: 'Secrets',
  SERVICE: 'Service',
  ENVIRONMENT: 'Environment',
  CV_CONFIG: 'CvConfig',
  INPUT_SETS: 'InputSets',
  CV_VERIFICATION_JOB: 'CvVerificationJob',
  CV_K8_ACTIVITY_SOURCE: 'CvKubernetesActivitySource'
}

export const ActivityStatus: ActivityStatusType = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED'
}

export const ActivityType: ActivityType = {
  CONNECTIVITY_CHECK: 'CONNECTIVITY_CHECK',
  ENTITY_USAGE: 'ENTITY_USAGE',
  ENTITY_CREATION: 'ENTITY_CREATION',
  ENTITY_UPDATE: 'ENTITY_UPDATE'
}

export const connectorUrlType = {
  ACCOUNT: 'Account',
  REPO: 'Repo',
  REGION: 'Region',
  PROJECT: 'Project'
}

export const CONNECTOR_CREDENTIALS_STEP_IDENTIFIER = 'CONNECTOR_CREDENTIALS_STEP_IDENTIFIER'

export const TESTCONNECTION_STEP_INDEX = 3
export const GIT_TESTCONNECTION_STEP_INDEX = 4
export const SECRET_MANAGER_TESTCONNECTION_STEP_INDEX = 2

export const connectorHelperUrls = {
  ceAwsLaunchConsole: 'https://console.aws.amazon.com/billing/home?#/reports',
  ceAwscostUsageReportSteps:
    'https://docs.harness.io/article/80vbt5jv0q-set-up-cost-visibility-for-aws#step_2_cost_and_usage_report',
  ceAwsNoAccount:
    'https://developer.harness.io/docs/cloud-cost-management/getting-started-ccm/set-up-cloud-cost-management/set-up-cost-visibility-for-aws/#aws-access-permissions',
  ceAwsRoleARNsteps:
    'https://docs.harness.io/article/80vbt5jv0q-set-up-cost-visibility-for-aws#step_4_create_cross_account_role',
  ceAzureLaunchConsole: 'https://portal.azure.com/#blade/Microsoft_Azure_CostManagement/Menu/exports',
  ceAzureBillingExport:
    'https://docs.harness.io/article/v682mz6qfd-set-up-cost-visibility-for-azure#step_2_azure_billing_exports'
}

interface GetElkAuthTypeReturn {
  label: string
  value: string
}

export const getELKAuthType = (getString: UseStringsReturn['getString']): GetElkAuthTypeReturn[] => [
  {
    label: getString('usernamePassword'),
    value: ElkAuthType.USERNAME_PASSWORD
  },
  {
    label: getString('common.apikey'),
    value: ElkAuthType.API_CLIENT_TOKEN
  },
  {
    label: getString('connectors.elk.noAuthentication'),
    value: ElkAuthType.NONE
  }
]

export const ELKConnectorFields = {
  USERNAME: 'username',
  PASSWORD: 'password'
}

export const ElkAuthType = {
  USERNAME_PASSWORD: 'UsernamePassword',
  API_CLIENT_TOKEN: 'ApiClientToken',
  NONE: 'None'
}

export const CONNECTOR_MODAL_MIN_WIDTH = 1175
