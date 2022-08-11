/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AllowedTypes, SelectOption } from '@wings-software/uicore'
import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import type { PipelineInfoConfig } from 'services/pipeline-ng'
import type {
  ManifestConfig,
  ConnectorConfigDTO,
  ManifestConfigWrapper,
  PageConnectorResponse,
  ServiceDefinition
} from 'services/cd-ng'

export type ManifestTypes =
  | 'K8sManifest'
  | 'Values'
  | 'HelmChart'
  | 'Kustomize'
  | 'OpenshiftTemplate'
  | 'OpenshiftParam'
  | 'KustomizePatches'
  | 'ServerlessAwsLambda'

export type PrimaryManifestType = 'K8sManifest' | 'HelmChart' | 'OpenshiftTemplate' | 'Kustomize'

export type ManifestStores =
  | 'Git'
  | 'Github'
  | 'GitLab'
  | 'Bitbucket'
  | 'Http'
  | 'OciHelmChart'
  | 'S3'
  | 'Gcs'
  | 'InheritFromManifest'
  | 'Inline'
  | 'Harness'
  | 'CustomRemote'

export type ManifestStoreTypeWithoutConnector = 'InheritFromManifest' | 'Harness' | 'Inline' | 'CustomRemote'

export type HelmOCIVersionOptions = 'V380'
export type HelmVersionOptions = 'V2' | 'V3'
export type ManifestStoreWithoutConnector = Exclude<ManifestStores, ManifestStoreTypeWithoutConnector>

export interface ManifestSelectionProps {
  isPropagating?: boolean
  deploymentType: ServiceDefinition['type']
  isReadonlyServiceMode: boolean
  readonly: boolean
  updateManifestList?: (manifestObj: ManifestConfigWrapper, manifestIndex: number) => void
  initialManifestList?: ManifestConfigWrapper[]
  allowOnlyOneManifest?: boolean
  addManifestBtnText?: string
  preSelectedManifestType?: ManifestTypes
}

export interface ManifestListViewProps {
  pipeline: PipelineInfoConfig
  connectors: PageConnectorResponse | undefined
  listOfManifests: ManifestConfigWrapper[]
  isReadonly: boolean
  deploymentType: ServiceDefinition['type']
  allowableTypes: AllowedTypes
  updateManifestList: (obj: ManifestConfigWrapper, idx: number) => void
  removeManifestConfig: (idx: number) => void
  attachPathYaml: (formData: ConnectorConfigDTO, manifestId: string, manifestType: PrimaryManifestType) => void
  removeValuesYaml: (index: number, manifestId: string, manifestType: PrimaryManifestType) => void
  allowOnlyOneManifest?: boolean
  addManifestBtnText?: string
  preSelectedManifestType?: ManifestTypes
}

export interface ManifestStepInitData {
  connectorRef: string | undefined | ConnectorSelectedValue
  store: ManifestStores | string
  selectedManifest: ManifestTypes | null
}
export interface CommonManifestDataType {
  identifier: string
  branch: string | undefined
  commitId: string | undefined
  gitFetchType: 'Branch' | 'Commit'
  paths: any
  skipResourceVersioning?: boolean
  repoName?: string
  valuesPaths?: any
}
export interface ManifestLastStepProps {
  key: string
  name: string
  expressions: string[]
  allowableTypes: AllowedTypes
  stepName: string
  initialValues: ManifestConfig
  handleSubmit: (data: ManifestConfigWrapper) => void
  selectedManifest: ManifestTypes | null
  manifestIdsList: Array<string>
  isReadonly?: boolean
  deploymentType?: string
}
export interface CommandFlags {
  commandType: string | SelectOption | undefined
  flag: string | undefined
  id?: string
}
export interface HelmWithGITDataType {
  identifier: string
  branch: string | undefined
  commitId: string | undefined
  repoName?: string
  gitFetchType: 'Branch' | 'Commit'
  folderPath: string
  helmVersion: HelmVersionOptions
  valuesPaths?: any
  skipResourceVersioning: boolean
  commandFlags: Array<CommandFlags>
}
export interface HelmWithHTTPDataType {
  identifier: string
  helmVersion: HelmVersionOptions
  skipResourceVersioning: boolean
  chartName: string
  chartVersion: string
  valuesPaths?: any
  commandFlags: Array<CommandFlags>
}

export interface HelmWithOCIDataType {
  identifier: string
  helmVersion: HelmOCIVersionOptions
  skipResourceVersioning: boolean
  basePath: string
  chartName: string
  chartVersion: string
  valuesPaths?: any
  commandFlags: Array<CommandFlags>
}

export interface HelmWithGcsDataType extends HelmWithHTTPDataType {
  bucketName: SelectOption | string
  folderPath: string
}
export interface OpenShiftTemplateGITDataType {
  identifier: string
  branch: string | undefined
  commitId: string | undefined
  repoName?: string
  gitFetchType: 'Branch' | 'Commit'
  path: string
  paramsPaths?: any
  skipResourceVersioning: boolean
}

export interface KustomizePatchDataType {
  identifier: string
  branch: string | undefined
  commitId: string | undefined
  gitFetchType: 'Branch' | 'Commit'
  paths: string[] | any
  repoName?: string | any
}
export interface KustomizeWithGITDataType {
  identifier: string
  branch: string | undefined
  commitId: string | undefined
  repoName?: string
  gitFetchType: 'Branch' | 'Commit'
  skipResourceVersioning: boolean
  folderPath: string
  pluginPath: string
  patchesPaths?: any
  optimizedKustomizeManifestCollection?: boolean
  kustomizeYamlFolderPath?: string
}
export interface OpenShiftParamDataType {
  identifier: string
  branch?: string | undefined
  commitId?: string | undefined
  repoName?: string
  gitFetchType?: 'Branch' | 'Commit'
  paths: string[] | any
}
export interface ServerlessManifestDataType extends CommonManifestDataType {
  identifier: string
  branch: string | undefined
  commitId: string | undefined
  gitFetchType: 'Branch' | 'Commit'
  paths: any
  repoName?: string
  configOverridePath?: string
}
export interface InheritFromManifestDataType {
  identifier: string
  paths: any
}
export interface InlineDataType {
  identifier: string
  content: string
}
export interface HarnessFileStoreDataType {
  identifier: string
  files: string[]
  valuesPaths: string[]
  paramsPaths: string[]
  skipResourceVersioning?: boolean
}
export interface HarnessFileStoreFormData {
  identifier: string
  files: string | string[]
  skipResourceVersioning: boolean
  valuesPaths?: string | string[]
  paramsPaths?: string | string[]
}
export interface HelmHarnessFileStoreFormData extends HarnessFileStoreFormData {
  helmVersion: HelmVersionOptions
  commandFlags: Array<CommandFlags>
}
export interface KustomizeWithHarnessStorePropTypeDataType extends HarnessFileStoreFormData {
  overlayConfiguration?:
    | string
    | {
        kustomizeYamlFolderPath: string
      }
  pluginPath?: string
  patchesPaths?: string[] | string
}
export interface CustomManifestManifestDataType {
  identifier: string
  extractionScript: string
  filePath: string
  delegateSelectors: Array<string> | string
  valuesPaths?: Array<{ path: string }> | string
  paramsPaths?: Array<{ path: string }> | string
  skipResourceVersioning?: boolean
}
