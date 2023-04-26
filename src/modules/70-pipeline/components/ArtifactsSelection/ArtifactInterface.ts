/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AllowedTypes, SelectOption } from '@harness/uicore'
import type { FormikProps, FormikValues } from 'formik'
import type { GetDataError } from 'restful-react'
import type { SelectWithBiLevelOption } from '@harness/uicore/dist/components/Select/BiLevelSelect'
import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import type { DeploymentStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import type {
  ArtifactConfig,
  PrimaryArtifact,
  PageConnectorResponse,
  SidecarArtifactWrapper,
  DockerBuildDetailsDTO,
  Failure,
  Error,
  ArtifactoryBuildDetailsDTO,
  ServiceDefinition,
  ArtifactSource,
  ConnectorConfigDTO
} from 'services/cd-ng'
import type { ScriptType } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
import type { RepositoryFormatTypes } from '@pipeline/utils/stageHelpers'
import type { ModalViewFor } from './ArtifactHelper'
import type { ArtifactConnectorStepDataToLastStep } from './hooks/useArtifactSelectionLastSteps'

export interface ArtifactListViewProps {
  stage: StageElementWrapper<DeploymentStageElementConfig> | undefined
  primaryArtifact: PrimaryArtifact | ArtifactSource[]
  sideCarArtifact: SidecarArtifactWrapper[] | undefined
  addNewArtifact: (view: ModalViewFor) => void
  handleUseArtifactSourceTemplate?: (view: ModalViewFor) => void
  editArtifact: (view: ModalViewFor, type?: ArtifactType, index?: number) => void
  removeSidecar: (index: number) => void
  fetchedConnectorResponse: PageConnectorResponse | undefined
  accountId: string
  refetchConnectors: () => void
  isReadonly: boolean
  removePrimary?: () => void
  removeArtifactSource?: (index: number) => void
  isSidecarAllowed?: boolean
  isMultiArtifactSource?: boolean
  deploymentType: ServiceDefinition['type']
}

export type ArtifactType = Required<PrimaryArtifact>['type']
export interface ArtifactsSelectionProps {
  isPropagating?: boolean
  deploymentType: ServiceDefinition['type']
  isReadonlyServiceMode: boolean
  readonly: boolean
  availableArtifactTypes?: ArtifactType[]
}

export interface OrganizationCreationType {
  type: ArtifactType
}
export enum TagTypes {
  Value = 'value',
  Regex = 'regex'
}
export enum RepositoryPortOrServer {
  RepositoryPort = 'repositoryPort',
  RepositoryUrl = 'repositoryUrl'
}
export interface InitialArtifactDataType {
  submittedArtifact?: ArtifactType | null
  connectorId: string | undefined | ConnectorSelectedValue
}
export interface ImagePathTypes {
  identifier: string
  imagePath?: string
  digest?: any
  artifactPath?: SelectOption | string
  tag: any
  tagRegex: any
  tagType: TagTypes
  registryHostname?: string
  region?: any
  repositoryPort?: number | string
  repository?: SelectOption | string
  repositoryUrl?: string
  repositoryPortorRepositoryURL?: string
  artifactDirectory?: string
  repositoryFormat?: string
}

export interface VariableInterface {
  value: number | string
  id: string
  name?: string
  type?: 'String' | 'Number'
}

export interface CustomArtifactSource {
  type?: string
  identifier?: string
  formType?: string
  spec?: {
    version?: string
    delegateSelectors?: SelectOption[] | string[] | string
    inputs?: VariableInterface[]
    timeout?: string
    scripts?: {
      fetchAllArtifacts?: {
        artifactsArrayPath?: string
        attributes?: VariableInterface[]
        versionPath?: string
        spec: {
          shell?: ScriptType
          source: {
            spec: {
              script?: string
            }
            type?: string
          }
        }
      }
    }
  }
}

export interface AmazonS3InitialValuesType {
  identifier: string
  region: string
  bucketName: string
  tagType: TagTypes
  filePath?: string
  filePathRegex?: string
}

export interface ImagePathProps<T> {
  key: string
  name: string
  expressions: string[]
  context: number
  initialValues: T
  handleSubmit: (data: ArtifactConfig) => void
  artifactIdentifiers: string[]
  isReadonly?: boolean
  selectedArtifact: ArtifactType | null
  allowableTypes: AllowedTypes
  selectedDeploymentType?: string
  isMultiArtifactSource?: boolean
  formClassName?: string
  prevStepData?: ConnectorConfigDTO
  editArtifactModePrevStepData?: ArtifactConnectorStepDataToLastStep
}

export interface AzureArtifactsInitialValues {
  identifier?: string
  versionType?: string
  scope: string
  project?: string
  feed: string
  packageType: string
  package: string
  version?: string
  versionRegex?: string
}

export interface AmazonS3ArtifactProps {
  key: string
  name: string
  expressions: string[]
  context: number
  initialValues: AmazonS3InitialValuesType
  handleSubmit: (data: ArtifactConfig) => void
  artifactIdentifiers: string[]
  isReadonly?: boolean
  selectedArtifact: ArtifactType | null
  allowableTypes: AllowedTypes
  isMultiArtifactSource?: boolean
  formClassName?: string
  editArtifactModePrevStepData?: ArtifactConnectorStepDataToLastStep
}

export interface GithubPackageRegistryInitialValuesType {
  identifier?: string
  versionType?: TagTypes
  spec: {
    connectorRef: string
    packageType: string
    org: string
    packageName: string
    version: string
    versionRegex: string
  }
}

export interface AmazonMachineImageInitialValuesType {
  identifier?: string
  versionType?: string
  spec: {
    connectorRef?: string
    region?: string | SelectOption
    filters?: VariableInterface[] | string | { [key: string]: any }
    tags?: VariableInterface[] | string | { [key: string]: any }
    version?: string
    versionRegex?: string
  }
}

export interface GithubPackageRegistryProps {
  key: string
  name: string
  expressions: string[]
  context: number
  initialValues: GithubPackageRegistryInitialValuesType
  handleSubmit: (data: ArtifactConfig) => void
  artifactIdentifiers: string[]
  isReadonly?: boolean
  selectedArtifact: ArtifactType | null
  allowableTypes: AllowedTypes
  isMultiArtifactSource?: boolean
  editArtifactModePrevStepData?: ArtifactConnectorStepDataToLastStep
}

export interface ACRArtifactProps {
  key: string
  name: string
  expressions: string[]
  context: number
  initialValues: ACRArtifactType
  handleSubmit: (data: ArtifactConfig) => void
  artifactIdentifiers: string[]
  isReadonly?: boolean
  selectedArtifact: ArtifactType | null
  allowableTypes: AllowedTypes
  isMultiArtifactSource?: boolean
  formClassName?: string
  editArtifactModePrevStepData?: ArtifactConnectorStepDataToLastStep
}

export interface JenkinsArtifactProps {
  key: string
  name: string
  expressions: string[]
  context: number
  initialValues: JenkinsArtifactType
  handleSubmit: (data: ArtifactConfig) => void
  artifactIdentifiers: string[]
  isReadonly?: boolean
  selectedArtifact: ArtifactType | null
  allowableTypes: AllowedTypes
  isMultiArtifactSource?: boolean
  editArtifactModePrevStepData?: ArtifactConnectorStepDataToLastStep
}

export interface BambooArtifactProps {
  key: string
  name: string
  expressions: string[]
  context: number
  initialValues: BambooArtifactType
  handleSubmit: (data: BambooArtifactType) => void
  artifactIdentifiers: string[]
  isReadonly?: boolean
  selectedArtifact: ArtifactType | null
  allowableTypes: AllowedTypes
  isMultiArtifactSource?: boolean
  editArtifactModePrevStepData?: ArtifactConnectorStepDataToLastStep
  selectedDeploymentType?: string
  isTasDeploymentTypeSelected?: boolean
}

export interface ArtifactFormikProps<Values> {
  formik: FormikProps<Values>
  formClassName?: string
}

export interface GoogleArtifactRegistryInitialValuesType {
  identifier?: string
  versionType?: TagTypes
  spec: {
    connectorRef: string
    repositoryType: string
    package: string
    project: string
    region: SelectOption & string
    repositoryName: string
    version?: string
    versionRegex?: string
  }
}

export interface GoogleArtifactRegistryProps {
  key: string
  name: string
  expressions: string[]
  context: number
  initialValues: GoogleArtifactRegistryInitialValuesType
  handleSubmit: (data: ArtifactConfig) => void
  artifactIdentifiers: string[]
  isReadonly?: boolean
  selectedArtifact: ArtifactType | null
  allowableTypes: AllowedTypes
  isMultiArtifactSource?: boolean
  formClassName?: string
  editArtifactModePrevStepData?: ArtifactConnectorStepDataToLastStep
}

export interface Nexus2ArtifactProps {
  key: string
  name: string
  expressions: string[]
  context: number
  initialValues: Nexus2InitialValuesType
  handleSubmit: (data: ArtifactConfig) => void
  artifactIdentifiers: string[]
  isReadonly?: boolean
  selectedArtifact: ArtifactType | null
  allowableTypes: AllowedTypes
  isMultiArtifactSource?: boolean
  formClassName?: string
}

export interface NexusSpecType {
  artifactId?: string
  groupId?: string
  group?: string
  extension?: string
  classifier?: string
  packageName?: string
  artifactPath?: string
  repositoryUrl?: string
  repositoryPort?: string
  repositoryPortorRepositoryURL?: string
}

export interface Nexus2InitialValuesType {
  identifier: string
  tagType?: string
  connectorRef: string
  tag: SelectOption & string
  tagRegex: string
  repository: string
  repositoryFormat: string
  spec: NexusSpecType
}

export interface JenkinsArtifactType {
  identifier: string
  spec: {
    connectorRef?: string
    artifactPath?: SelectOption | string
    build?: SelectOption | string
    jobName?: SelectWithBiLevelOption | string
    childJobName?: SelectWithBiLevelOption | string
  }
}

export interface BambooArtifactType {
  identifier: string
  type?: string
  spec: {
    connectorRef?: string
    artifactPaths?: SelectOption[] | string[]
    build?: SelectOption | string
    planKey?: SelectOption | string
  }
}

export interface ConnectorRefLabelType {
  firstStepName: string
  secondStepName: string
}

export interface ArtifactTagHelperText {
  imagePath?: string
  package?: string
  project?: string
  repositoryName?: string
  artifactPath?: string
  region?: string
  connectorRef: string
  registryHostname?: string
  repository?: string
  repositoryPort?: number
  artifactDirectory?: string
  subscription?: string
  registry?: string
  subscriptionId?: string
  repositoryFormat?: RepositoryFormatTypes
  artifactId?: string
  groupId?: string
  artifactArrayPath?: string
  versionPath?: string
  packageName?: string
  feed?: string
}
export interface ArtifactImagePathTagViewProps {
  selectedArtifact: ArtifactType
  formik: FormikValues
  expressions: string[]
  isReadonly?: boolean
  allowableTypes: AllowedTypes
  connectorIdValue: string
  fetchTags: (val: string) => void
  buildDetailsLoading: boolean
  tagList: DockerBuildDetailsDTO[] | ArtifactoryBuildDetailsDTO[] | undefined
  setTagList: any
  tagError: GetDataError<Failure | Error> | null
  tagDisabled: boolean
  isArtifactPath?: boolean
  isImagePath?: boolean
  isServerlessDeploymentTypeSelected?: boolean
  canFetchTags?: () => boolean
  tooltipId?: string
}

export interface ACRArtifactType {
  identifier: string
  tag: SelectOption | string
  tagRegex: SelectOption | string
  tagType: TagTypes
  repository?: SelectOption | string
  subscriptionId?: SelectOption | string
  registry?: SelectOption | string
  spec?: any
}

export interface GoogleCloudStorageInitialValuesType {
  identifier: string
  project: string
  bucket: string
  artifactPath: string
}

export interface GoogleCloudStorageArtifactProps {
  key: string
  name: string
  expressions: string[]
  context: number
  initialValues: GoogleCloudStorageInitialValuesType
  handleSubmit: (data: ArtifactConfig) => void
  artifactIdentifiers: string[]
  isReadonly?: boolean
  selectedArtifact: ArtifactType | null
  allowableTypes: AllowedTypes
  isMultiArtifactSource?: boolean
  formClassName?: string
  editArtifactModePrevStepData?: ArtifactConnectorStepDataToLastStep
}

export interface GoogleCloudSourceRepositoriesInitialValuesType {
  identifier: string
  project: string
  repository: string
  sourceDirectory: string
  fetchType: 'Branch' | 'Commit' | 'Tag'
  branch?: string
  commitId?: string
  tag?: string
}

export interface GoogleCloudSourceRepositoriesArtifactProps {
  key: string
  name: string
  expressions: string[]
  context: number
  initialValues: GoogleCloudSourceRepositoriesInitialValuesType
  handleSubmit: (data: ArtifactConfig) => void
  artifactIdentifiers: string[]
  isReadonly?: boolean
  selectedArtifact: ArtifactType | null
  allowableTypes: AllowedTypes
  isMultiArtifactSource?: boolean
  formClassName?: string
  editArtifactModePrevStepData?: ArtifactConnectorStepDataToLastStep
}
