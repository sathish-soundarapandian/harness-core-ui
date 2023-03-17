/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AllowedTypes, SelectOption } from '@harness/uicore'
import type { ConnectorSelectedValue } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import type { PipelineInfoConfig } from 'services/pipeline-ng'
import type {
  ManifestConfig,
  ConnectorConfigDTO,
  ManifestConfigWrapper,
  PageConnectorResponse,
  ServiceDefinition,
  TasManifest
} from 'services/cd-ng'
import type { Scope } from '@common/interfaces/SecretsInterface'

export type ManifestTypes =
  | 'K8sManifest'
  | 'Values'
  | 'HelmChart'
  | 'Kustomize'
  | 'OpenshiftTemplate'
  | 'OpenshiftParam'
  | 'KustomizePatches'
  | 'ServerlessAwsLambda'
  | 'EcsTaskDefinition'
  | 'EcsServiceDefinition'
  | 'EcsScalableTargetDefinition'
  | 'EcsScalingPolicyDefinition'
  | 'TasManifest'
  | 'TasVars'
  | 'TasAutoScaler'
  | 'AsgConfiguration'
  | 'AsgLaunchTemplate'
  | 'AsgScalingPolicy'
  | 'AsgScheduledUpdateGroupAction'
  | 'GoogleCloudFunctionDefinition'
  | 'HelmRepoOverride'
  | 'AwsLambdaFunctionDefinition'
  | 'AwsLambdaFunctionAliasDefinition'

export type PrimaryManifestType =
  | 'K8sManifest'
  | 'HelmChart'
  | 'OpenshiftTemplate'
  | 'Kustomize'
  | 'TasVars'
  | 'TasAutoScaler'

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
  | 'AzureRepo'

export type ManifestStoreTypeWithoutConnector = 'InheritFromManifest' | 'Harness' | 'Inline' | 'CustomRemote'

export type HelmOCIVersionOptions = 'V380'
export type HelmVersionOptions = 'V2' | 'V3'
export type CLIVersionOptions = TasManifest['cfCliVersion']
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
  availableManifestTypes: ManifestTypes[]
  deleteManifest?: (index: number) => void
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
  availableManifestTypes: ManifestTypes[]
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
  enableDeclarativeRollback?: boolean
  repoName?: string
  valuesPaths?: any
}
export interface HelmRepoOverrideManifestDataType {
  identifier: string
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
  showIdentifierField?: boolean
  containsTASManifest?: boolean
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
  subChartName?: string
  helmVersion: HelmVersionOptions
  valuesPaths?: any
  skipResourceVersioning: boolean
  enableDeclarativeRollback?: boolean
  commandFlags: Array<CommandFlags>
}
export interface HelmWithHTTPDataType {
  identifier: string
  helmVersion: HelmVersionOptions
  skipResourceVersioning: boolean
  enableDeclarativeRollback?: boolean
  chartName: string
  chartVersion: string
  subChartName?: string
  valuesPaths?: any
  commandFlags: Array<CommandFlags>
}

export interface HelmWithOCIDataType {
  identifier: string
  helmVersion: HelmOCIVersionOptions
  skipResourceVersioning: boolean
  enableDeclarativeRollback?: boolean
  basePath: string
  chartName: string
  chartVersion: string
  subChartName?: string
  valuesPaths?: any
  commandFlags: Array<CommandFlags>
}
export interface TASManifestDataType {
  identifier: string
  branch: string | undefined
  commitId: string | undefined
  gitFetchType: 'Branch' | 'Commit'
  paths: any
  skipResourceVersioning?: boolean
  repoName?: string
  varsPaths?: any
  autoScalerPath?: any
  cfCliVersion?: TasManifest['cfCliVersion']
}
export interface HelmWithGcsDataType extends HelmWithHTTPDataType {
  bucketName: SelectOption | string
  folderPath: string
}
export interface HelmWithS3DataType extends HelmWithGcsDataType {
  region: SelectOption | string
}
export interface HelmWithHarnessStoreDataType {
  identifier: string
  files: string[]
  valuesPaths: string[]
  skipResourceVersioning: boolean
  enableDeclarativeRollback?: boolean
  helmVersion: HelmVersionOptions
  commandFlags: Array<CommandFlags>
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
  enableDeclarativeRollback?: boolean
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
  enableDeclarativeRollback?: boolean
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
  enableDeclarativeRollback?: boolean
}
export interface HarnessFileStoreFormData {
  identifier: string
  files: string | string[]
  skipResourceVersioning: boolean
  enableDeclarativeRollback?: boolean
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
  varsPaths?: Array<{ path: string }> | string
  autoScalerPath?: Array<{ path: string }> | string
  cfCliVersion?: CLIVersionOptions
  skipResourceVersioning?: boolean
  enableDeclarativeRollback?: boolean
  helmVersion: HelmVersionOptions
  commandFlags: Array<CommandFlags>
}

export interface ECSWithS3DataType {
  identifier: string
  region: SelectOption | string
  bucketName: SelectOption | string
  paths: any
}

export interface ServerlessLambdaWithS3DataType {
  identifier: string
  region: SelectOption | string
  bucketName: SelectOption | string
  paths: any
  configOverridePath?: string
}
export interface TASWithHarnessStorePropType extends Omit<HarnessFileStoreFormData, 'skipResourceVersioning'> {
  varsPaths?: string[] | string
  autoScalerPath?: string[] | string
  cfCliVersion?: CLIVersionOptions
}

export interface ManifestConnectorRefType {
  label: string
  value: string
  scope: Scope
  live: boolean
  connector: ConnectorConfigDTO
}
export interface ManifestLastStepPrevStepData {
  selectedManifest: ManifestTypes | null
  store: ManifestStores
  connectorRef: ManifestConnectorRefType
}

export type CommonManifestLastStepPrevStepData = CommonManifestDataType & ManifestLastStepPrevStepData

export type HelmRepoOverrideManifestLastStepPrevStepData = HelmRepoOverrideManifestDataType &
  ManifestLastStepPrevStepData

export type HelmWithGITManifestLastStepPrevStepData = HelmWithGITDataType & ManifestLastStepPrevStepData

export type HelmWithHTTPManifestLastStepPrevStepData = HelmWithHTTPDataType & ManifestLastStepPrevStepData

export type HelmWithOCIManifestLastStepPrevStepData = HelmWithOCIDataType & ManifestLastStepPrevStepData

export type HelmWithS3ManifestLastStepPrevStepData = HelmWithS3DataType & ManifestLastStepPrevStepData

export type HelmWithHarnessStoreManifestLastStepPrevStepData = HelmWithHarnessStoreDataType &
  ManifestLastStepPrevStepData

export type TASManifestLastStepPrevStepData = TASManifestDataType & ManifestLastStepPrevStepData

export type HelmWithGcsManifestLastStepPrevStepData = HelmWithGcsDataType & ManifestLastStepPrevStepData

export type OpenShiftTemplateGITManifestLastStepPrevStepData = OpenShiftTemplateGITDataType &
  ManifestLastStepPrevStepData

export type KustomizePatchManifestLastStepPrevStepData = KustomizePatchDataType & ManifestLastStepPrevStepData

export type KustomizeWithGITManifestLastStepPrevStepData = KustomizeWithGITDataType & ManifestLastStepPrevStepData

export type OpenShiftParamManifestLastStepPrevStepData = OpenShiftParamDataType & ManifestLastStepPrevStepData

export type ServerlessLambdaManifestLastStepPrevStepData = ServerlessManifestDataType & ManifestLastStepPrevStepData

export type HelmHarnessFileStoreManifestLastStepPrevStepData = HelmHarnessFileStoreFormData &
  ManifestLastStepPrevStepData

export type KustomizeWithHarnessStoreManifestLastStepPrevStepData = KustomizeWithHarnessStorePropTypeDataType &
  ManifestLastStepPrevStepData

export type InheritFromManifestLastStepPrevStepData = InheritFromManifestDataType & ManifestLastStepPrevStepData

export type HarnessFileStoreManifestLastStepPrevStepData = HarnessFileStoreDataType & ManifestLastStepPrevStepData

export type CustomRemoteManifestManifestLastStepPrevStepData = CustomManifestManifestDataType &
  ManifestLastStepPrevStepData

export type ECSWithS3ManifestLastStepPrevStepData = ECSWithS3DataType & ManifestLastStepPrevStepData

export type ServerlessLambdaWithS3ManifestLastStepPrevStepData = ServerlessLambdaWithS3DataType &
  ManifestLastStepPrevStepData

export type TASWithHarnessStoreManifestLastStepPrevStepData = TASWithHarnessStorePropType & ManifestLastStepPrevStepData
