/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AllowedTypes } from '@wings-software/uicore'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { ServiceDefinition, ServiceSpec, ConfigFileWrapper, ConfigFile } from 'services/cd-ng'
import type { ConfigFileSourceBaseFactory } from '@cd/factory/ConfigFileSourceFactory/ConfigFileSourceBaseFactory'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'

export interface SshWinRmDirectServiceStep extends ServiceSpec {
  stageIndex?: number
  setupModeType?: string
  handleTabChange?: (tab: string) => void
  customStepProps?: Record<string, any>
  deploymentType?: ServiceDefinition['type']
  isReadonlyServiceMode?: boolean
}

export interface SshWinRmConfigFilesProps {
  template: ServiceSpec
  path?: string
  stepViewType?: StepViewType
  configFileSourceBaseFactory: ConfigFileSourceBaseFactory
  configFiles?: ConfigFileWrapper[]
  initialValues: SshWinRmDirectServiceStep
  readonly: boolean
  stageIdentifier: string
  formik?: any
  fromTrigger?: boolean
  allowableTypes: AllowedTypes
  configFile?: ConfigFile
  configFilePath?: string
}
export interface SshWinRmServiceInputFormProps {
  initialValues: SshWinRmDirectServiceStep
  onUpdate?: ((data: ServiceSpec) => void) | undefined
  stepViewType?: StepViewType
  template?: ServiceSpec
  allValues?: ServiceSpec
  readonly?: boolean
  factory?: AbstractStepFactory
  path?: string
  stageIdentifier: string
  formik?: any
  allowableTypes: AllowedTypes
}
