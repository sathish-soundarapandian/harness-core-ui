/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AllowedTypes } from '@wings-software/uicore'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { ServiceDefinition, ServiceSpec } from 'services/cd-ng'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'

export interface CustomDeploymentServiceStep extends ServiceSpec {
  stageIndex?: number
  setupModeType?: string
  handleTabChange?: (tab: string) => void
  customStepProps?: Record<string, any>
  deploymentType?: ServiceDefinition['type']
  isReadonlyServiceMode?: boolean
}

export interface CustomDeploymentServiceInputFormProps {
  initialValues: CustomDeploymentServiceStep
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
