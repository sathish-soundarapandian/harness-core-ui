/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AllowedTypes, SelectOption } from '@wings-software/uicore'
import type { FormikValues } from 'formik'
import type { GetDataError } from 'restful-react'
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
  ArtifactSource
} from 'services/cd-ng'
import type { ScriptType } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
import type { RepositoryFormatTypes } from '@pipeline/utils/stageHelpers'
import type { ModalViewFor } from './ArtifactHelper'

export interface ArtifactListViewProps {
  stage: StageElementWrapper<DeploymentStageElementConfig> | undefined
  primaryArtifact: PrimaryArtifact | ArtifactSource[]
  sideCarArtifact: SidecarArtifactWrapper[] | undefined
  addNewArtifact: (view: ModalViewFor) => void
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
}
export interface ArtifactsSelectionProps {
  isPropagating?: boolean
  deploymentType: ServiceDefinition['type']
  isReadonlyServiceMode: boolean
  readonly: boolean
}

export type ArtifactType = Required<PrimaryArtifact>['type']

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
  artifactPath?: string
  tag: any
  tagRegex: any
  tagType: TagTypes
  registryHostname?: string
  region?: any
  repositoryPort?: number | string
  repository?: string | SelectOption
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
  spec?: {
    version: string
    delegateSelectors?: SelectOption | string[] | string
    inputs?: VariableInterface[]
    timeout?: string
    scripts: {
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
  selectedDeploymentType: string
  isMultiArtifactSource?: boolean
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
}

export interface Nexus2InitialValuesType {
  identifier: string
  tagType?: string
  connectorRef: string
  tag: SelectOption & string
  tagRegex: string
  repository: string
  repositoryFormat: string
  spec: {
    artifactId?: string
    groupId?: string
    extension?: string
    classifier?: string
    packageName?: string
    artifactPath?: string
    repositoryUrl?: string
    repositoryPort?: string
    repositoryPortorRepositoryURL?: string
  }
}

export interface JenkinsArtifactType {
  identifier: string
  spec: {
    connectorRef?: string
    artifactPath?: SelectOption | string
    build?: SelectOption | string
    jobName?: SelectOption | string
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
  packageName?: string
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
