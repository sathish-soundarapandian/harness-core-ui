/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@harness/icons'
import type { AllowedTypes as MultiTypeAllowedTypes, StepProps } from '@harness/uicore'
import { Connectors } from '@connectors/constants'
import type { StringKeys } from 'framework/strings'
import type {
  AzureWebAppServiceSpec,
  ConnectorConfigDTO,
  ConnectorInfoDTO,
  PageConnectorResponse,
  ServiceDefinition,
  StageElementConfig,
  ConnectionStringsConfiguration,
  ApplicationSettingsConfiguration
} from 'services/cd-ng'
import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import type { StageElementWrapper } from '@pipeline/utils/pipelineTypes'

export const AllowedTypes = ['Git', 'Github', 'GitLab', 'Bitbucket', 'Harness']
export type ConnectorTypes = 'Git' | 'Github' | 'GitLab' | 'Bitbucket' | 'Harness'

export const ConnectorIcons: Record<string, IconName> = {
  Git: 'service-github',
  Github: 'github',
  GitLab: 'service-gotlab',
  Bitbucket: 'bitbucket',
  Harness: 'harness'
}

export const ConnectorMap: Record<string, ConnectorInfoDTO['type']> = {
  Git: Connectors.GIT,
  Github: Connectors.GITHUB,
  GitLab: Connectors.GITLAB,
  Bitbucket: Connectors.BITBUCKET
}

export const ConnectorLabelMap: Record<ConnectorTypes, StringKeys> = {
  Git: 'pipeline.manifestType.gitConnectorLabel',
  Github: 'common.repo_provider.githubLabel',
  GitLab: 'common.repo_provider.gitlabLabel',
  Bitbucket: 'pipeline.manifestType.bitBucketLabel',
  Harness: 'pipeline.manifestType.bitBucketLabel'
}

export interface StartupScriptSelectionProps {
  isPropagating?: boolean
  deploymentType: ServiceDefinition['type']
  isReadonlyServiceMode: boolean
  readonly: boolean
}

export enum ModalViewOption {
  APPLICATIONSETTING = 0,
  CONNECTIONSTRING = 1
}

export interface WizardStepNames {
  wizardName: string
  firstStepName: string
  secondStepName: string
  pathPlaceholder: string
  firstStepSubtitle: string
  firstStepTitle: string
  secondStepTitle: string
}

export interface AppServiceConfigDataType {
  branch: string | undefined
  commitId: string | undefined
  gitFetchType: 'Branch' | 'Commit'
  paths: string | string[] | undefined
  repoName?: string | undefined
}

export interface LastStepProps {
  key: string
  name: string
  expressions: string[]
  allowableTypes: MultiTypeAllowedTypes
  stepName: string
  initialValues: ApplicationSettingsConfiguration | ConnectionStringsConfiguration
  handleSubmit: (data: ApplicationSettingsConfiguration | ConnectionStringsConfiguration) => void
  isReadonly?: boolean
  pathPlaceholder?: string
  title?: string
}

export interface AzureWebAppsServiceDefinition {
  spec: AzureWebAppServiceSpec
  type: 'Kubernetes' | 'NativeHelm' | 'Ssh' | 'WinRm' | 'ServerlessAwsLambda' | 'AzureWebApp'
}

export interface AzureWebAppWizardInitData {
  connectorRef: string | undefined | ConnectorSelectedValue
  selectedStore: ConnectorTypes | string
}

export interface AzureWebAppListViewProps {
  pipeline: any
  updateStage?: (stage: StageElementConfig) => Promise<void>
  stage: StageElementWrapper | undefined
  isPropagating?: boolean
  isReadonly: boolean
  stringsConnectors: PageConnectorResponse | undefined
  settingsConnectors: PageConnectorResponse | undefined
  refetchStringsConnectors: () => void
  refetchSettingsConnectors: () => void
  deploymentType?: ServiceDefinition['type']
  allowableTypes: MultiTypeAllowedTypes
  applicationSettings?: ApplicationSettingsConfiguration | ConnectionStringsConfiguration
  connectionStrings?: ApplicationSettingsConfiguration | ConnectionStringsConfiguration
  selectedOption: ModalViewOption | undefined
  setSelectedOption: (option: ModalViewOption | undefined) => void
  showApplicationSettings?: boolean
  showConnectionStrings?: boolean
  selectionType: AzureWebAppSelectionTypes
  handleSubmitConfig?: (config: ApplicationSettingsConfiguration | ConnectionStringsConfiguration) => void
  handleDeleteConfig?: (index: number) => void
  editServiceOverride?: () => void
}

export interface StepChangeData<SharedObject> {
  prevStep?: number
  nextStep?: number
  prevStepData: SharedObject
}

export interface AzureWebAppServiceConfigWizardInitData {
  connectorRef: string | undefined | ConnectorSelectedValue
  selectedStore: ConnectorTypes | string
}

export interface AzureWebAppServiceConfigWizardStepsProps<T> {
  handleConnectorViewChange: (isConnectorView: boolean) => void
  initialValues: AzureWebAppServiceConfigWizardInitData
  newConnectorView: boolean
  expressions: string[]
  allowableTypes: MultiTypeAllowedTypes
  newConnectorSteps?: any
  lastSteps: React.ReactElement<StepProps<ConnectorConfigDTO>> | null
  isReadonly: boolean
  handleStoreChange: (store?: T) => void
  connectorTypes: any
  labels: WizardStepNames
}

export interface AzureWebAppServicesStepOneProps {
  stepName: string
  expressions: string[]
  allowableTypes: MultiTypeAllowedTypes
  isReadonly: boolean
  connectorTypes: Array<ConnectorTypes>
  initialValues: AzureWebAppServiceConfigWizardInitData
  handleConnectorViewChange: () => void
  handleStoreChange: (store: ConnectorTypes) => void
  title?: string
  subtitle?: string
}

export interface AzureWebAppServiceStepTwoProps {
  stepName: string
  expressions: string[]
  allowableTypes: MultiTypeAllowedTypes
  initialValues: ApplicationSettingsConfiguration | ConnectionStringsConfiguration
  handleSubmit: (data: ApplicationSettingsConfiguration | ConnectionStringsConfiguration) => void
  isReadonly?: boolean
  pathPlaceholder?: string
  title?: string
}

export const gitFetchTypeList = [
  { label: 'Latest from Branch', value: 'Branch' },
  { label: 'Specific Commit Id / Git Tag', value: 'Commit' }
]

export enum GitFetchTypes {
  Branch = 'Branch',
  Commit = 'Commit'
}

export interface ConnectorFieldPropType {
  connectorRef: string
  connectorColor: string
  connectorName: string | undefined
}

export interface AzureWebAppSelectionProps {
  isPropagating?: boolean
  deploymentType?: ServiceDefinition['type']
  isReadonlyServiceMode?: boolean
  readonly: boolean
  updateStage?: (stage: any) => Promise<void>
  showApplicationSettings?: boolean
  showConnectionStrings?: boolean
  data?: ApplicationSettingsConfiguration | ConnectionStringsConfiguration
  selectionType: AzureWebAppSelectionTypes
  handleSubmitConfig?: (config: ApplicationSettingsConfiguration | ConnectionStringsConfiguration) => void
  handleDeleteConfig?: (index: number) => void
  editServiceOverride?: () => void
  environmentAllowableTypes?: MultiTypeAllowedTypes
}

export enum AzureWebAppSelectionTypes {
  PIPELINE = 'PIPELINE',
  ENV_CONFIG = 'ENV_CONFIG',
  SERVICE_OVERRIDE = 'SERVICE_OVERRIDE',
  SERVICE_OVERRIDE_WIDGET = 'SERVICE_OVERRIDE_WIDGET'
}
