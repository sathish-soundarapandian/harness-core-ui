/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AllowedTypes } from '@harness/uicore'
import type { AzureWebAppConfigBaseFactory } from '@cd/factory/AzureWebAppConfigFactory/AzureWebAppConfigFactory'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type {
  ApplicationSettingsConfiguration,
  AzureWebAppServiceSpec,
  ConnectionStringsConfiguration,
  ServiceDefinition
} from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'

export interface AzureWebAppServiceStep extends AzureWebAppServiceSpec {
  stageIndex?: number
  setupModeType?: string
  handleTabChange?: (tab: string) => void
  customStepProps?: Record<string, any>
  deploymentType?: ServiceDefinition['type']
  isReadonlyServiceMode?: boolean
}
export interface AzureWebAppServiceSpecFormProps {
  initialValues: AzureWebAppServiceStep
  onUpdate?: ((data: AzureWebAppServiceSpec) => void) | undefined
  stepViewType?: StepViewType
  template?: AzureWebAppServiceSpec
  allValues?: AzureWebAppServiceSpec
  readonly?: boolean
  factory?: AbstractStepFactory
  path?: string
  stageIdentifier: string
  formik?: any
  serviceIdentifier?: string
  allowableTypes: AllowedTypes
}

export enum AzureWebAppConfigType {
  applicationSettings = 'applicationSettings',
  connectionStrings = 'connectionStrings',
  startupCommand = 'startupCommand'
}

export interface ApplicationConfigProps {
  template: AzureWebAppServiceSpec
  path?: string
  stepViewType?: StepViewType
  azureWebAppConfigBaseFactory: AzureWebAppConfigBaseFactory
  initialValues: AzureWebAppServiceStep
  readonly: boolean
  stageIdentifier: string
  serviceIdentifier?: string
  formik?: any
  fromTrigger?: boolean
  allowableTypes: AllowedTypes
  azureWebAppConfig?: ApplicationSettingsConfiguration | ConnectionStringsConfiguration
  azureWebAppConfigPath?: string
  type?: AzureWebAppConfigType
  pathLabel?: string
}

export interface AzureWebAppServiceSpecVariablesFormProps {
  initialValues: AzureWebAppServiceSpec
  stepsFactory: AbstractStepFactory
  stageIdentifier: string
  serviceIdentifier?: string
  onUpdate?(data: AzureWebAppServiceSpec): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: AzureWebAppServiceSpec
  readonly?: boolean
  path?: string
  allowableTypes: AllowedTypes
}
