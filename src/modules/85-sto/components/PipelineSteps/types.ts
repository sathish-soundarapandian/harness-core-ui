/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { Types } from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import type { StringsMap } from 'stringTypes'
import type { Types as ValidationFieldTypes } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import type {
  MultiTypeMapType,
  MultiTypeSelectOption,
  Resources
} from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
export interface Field {
  name: string
  type: Types
}

export type InputSetViewValidateFieldsConfig = {
  name: string
  type: ValidationFieldTypes
  label?: keyof StringsMap
  isRequired?: boolean
}

type TargetType = 'repository' | 'container' | 'instance'

type Target = {
  type: TargetType
  name: string
  variant: string
  workspace?: string
}

export type ScanMode = 'orchestration' | 'extraction' | 'ingestion'

type Ingestion = {
  file: string
}

type Image = {
  type: 'local_image' | 'docker_v2' | 'jfrog_artifactory' | 'aws_ecr'
  name: string
  domain: string
  access_id: string
  access_token: string
  region: string
}

type Auth = {
  access_token: string
  domain: string
  ssl: boolean
}

type Tool = {
  include?: string
  exclude?: string
  context?: string
  port?: number
  java?: {
    libraries?: string
    binaries?: string
  }
}

type Instance = {
  domain?: string
  protocol?: string
  port?: number
  path?: string
}

type LogLevel = 'info' | 'debug' | 'warning' | 'error'
type LogSerializer = 'simple' | 'basic' | 'bunyan' | 'simple_onprem' | 'onprem'
type FailOnSeverity = 'none' | 'low' | 'medium' | 'high' | 'critical'

type AdvancedSettings = {
  log?: {
    level?: LogLevel
    serializer?: LogSerializer
  }
  args?: {
    cli?: string
    // passthrough?: string //TODO for future implementation
  }
  fail_on_severity?: FailOnSeverity
  include_raw?: boolean // TODO verify that this is optional
}

export interface SecurityStepSpec {
  mode: ScanMode
  config: string
  target: Target
  auth?: Auth
  image?: Image
  tool?: Tool
  ingestion?: Ingestion
  advanced?: AdvancedSettings // TODO verify that this is optional
  instance?: Instance
  privileged?: boolean
  imagePullPolicy?: MultiTypeSelectOption
  resources?: Resources
  runAsUser?: string
  settings?: MultiTypeMapType
}
export interface SecurityStepData<T> {
  type: string
  identifier: string
  name?: string
  description?: string
  timeout?: string
  spec: T
}
