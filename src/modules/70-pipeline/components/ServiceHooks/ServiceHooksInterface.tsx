/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AllowedTypes } from '@harness/uicore'
import type { StageElementWrapper } from '@pipeline/utils/pipelineTypes'

import type { ServiceDefinition, ServiceHook, StageElementConfig } from 'services/cd-ng'

export interface ServiceHooksSelectionProps {
  isPropagating?: boolean
  deploymentType: ServiceDefinition['type']
  readonly?: boolean
  isReadonlyServiceMode: boolean
}

export interface ServiceHooksListViewProps {
  isReadonly: boolean
  isPropagating?: boolean
  deploymentType: ServiceDefinition['type']
  allowableTypes: AllowedTypes
  stage: StageElementWrapper | undefined
  updateStage: (stage: StageElementConfig) => Promise<void>
  selectedStoreType: ServiceHookStoreType
  setSelectedStoreType: (config: ServiceHookStoreType) => void
  selectedServiceResponse: any
  isReadonlyServiceMode: boolean
}

export type ServiceHookStoreTypeWithoutConnector = 'Harness' | 'Inline'

export type ServiceHookStoreType = ServiceHook['storeType']

export type ConfigStoreWithoutConnector = Exclude<ServiceHookStoreType, ServiceHookStoreTypeWithoutConnector>

export type ServiceHookInitStepData = ServiceHook & { hookType?: string }
