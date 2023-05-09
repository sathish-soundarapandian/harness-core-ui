/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AllowedTypes, IconName } from '@harness/uicore'

import type { ServiceDefinition, StageElementConfig, ConfigFileWrapper, ConnectorConfigDTO } from 'services/cd-ng'
import type { Scope } from '@common/interfaces/SecretsInterface'
import type { StageElementWrapper } from '@pipeline/utils/pipelineTypes'

export interface ConfigFilesSelectionProps {
  isPropagating?: boolean
  deploymentType: ServiceDefinition['type']
  readonly?: boolean
  isReadonlyServiceMode: boolean
}

export interface ConfigFilesListViewProps {
  isReadonly: boolean
  isPropagating?: boolean
  deploymentType: ServiceDefinition['type']
  allowableTypes: AllowedTypes
  stage: StageElementWrapper | undefined
  updateStage: (stage: StageElementConfig) => Promise<void>
  selectedConfig: ConfigFileType
  setSelectedConfig: (config: ConfigFileType) => void
  selectedServiceResponse: any
  isReadonlyServiceMode: boolean
  serviceCacheId: string
}

export type ConfigFileType = 'Harness' | 'Git' | 'Gitlab' | 'Github' | 'Bitbucket'

export interface ConfigFileStepTitle {
  label: string
  icon: IconName
}

export interface ConfigFileHarnessDataType {
  identifier: string
  fileType: string
  files: any[]
  secretFiles?: any[]
}

export interface ConfigFileFileStoreNode {
  path: string
  scope: string
}

export interface ConfigInitStepData {
  identifier: string
  store: ConfigFileType
  files: ConfigFileFileStoreNode[] | string[] | string
  fileType: string
  connectorRef?: string
}

export interface ConfigFileConnectorRefType {
  label: string
  value: string
  scope: Scope
  live: boolean
  connector: ConnectorConfigDTO
}

export interface ConfigFileLastStepPrevStepData {
  store: ConfigFileType
  connectorRef: ConfigFileConnectorRefType
}

export type GitConfigFileLastStepPrevStepData = ConfigInitStepData & ConfigFileLastStepPrevStepData

export type HarnessConfigFileLastStepPrevStepData = ConfigFileHarnessDataType &
  Omit<ConfigFileLastStepPrevStepData, 'connectorRef'>

export interface GitConfigFileCoreValuesPropType {
  stepName: string
  expressions: string[]
  allowableTypes: AllowedTypes
  handleSubmit: (data: ConfigFileWrapper) => void
  isReadonly?: boolean
  listOfConfigFiles: ConfigFileWrapper[]
  isEditState?: boolean
  context?: any
  selectedConfigFile: string
  editConfigFilePrevStepData?: GitConfigFileLastStepPrevStepData
  isEditMode: boolean
  configFileIndex?: number
}
