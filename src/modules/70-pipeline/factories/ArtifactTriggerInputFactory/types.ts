/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AllowedTypes } from '@harness/uicore'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { ArtifactListConfig, PrimaryArtifact, ServiceSpec, SidecarArtifact } from 'services/cd-ng'

export interface K8SDirectServiceStep extends ServiceSpec {
  stageIndex?: number
  setupModeType?: string
  handleTabChange?: (tab: string) => void
  customStepProps?: Record<string, any>
}

export interface KubernetesServiceInputFormProps {
  initialValues: K8SDirectServiceStep
  onUpdate?: ((data: ServiceSpec) => void) | undefined
  stepViewType?: StepViewType
  template?: ServiceSpec
  allValues?: ServiceSpec
  readonly?: boolean
  factory?: AbstractStepFactory
  path?: string
  stageIdentifier: string
  formik?: any
  fromTrigger?: boolean
  allowableTypes: AllowedTypes
}

export interface KubernetesArtifactsProps {
  type?: string
  template?: ServiceSpec
  stepViewType?: StepViewType
  artifactSourceBaseFactory: any
  stageIdentifier: string
  artifacts?: ArtifactListConfig
  formik?: any
  path?: string
  initialValues: K8SDirectServiceStep
  readonly: boolean
  allowableTypes: AllowedTypes
  fromTrigger?: boolean
  artifact?: PrimaryArtifact | SidecarArtifact
  isSidecar?: boolean
  artifactPath?: string
}

export enum TriggerType {
  Webhook = 'Webhook',
  Scheduled = 'Scheduled'
}

export enum TriggerFormType {
  Artifact = 'Artifact',
  Manifest = 'Manifest'
}

export interface FormDetailsRegister {
  component: React.ComponentType<any>
  baseFactory?: any
}
