/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AllowedTypes, MultiSelectOption } from '@harness/uicore'
import type { FormikProps } from 'formik'
import type { GetDataError } from 'restful-react'
import type { InputSetData, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { Failure } from 'services/cd-ng'
import type { AllFailureStrategyConfig } from '../../AdvancedSteps/FailureStrategyPanel/utils'

export enum SYNC_RESOURCES {
  ALL = 'All',
  OUT_OF_SYNC = 'OutOfSync'
}

export enum POLICY_OPTIONS {
  FOREGROUND = 'foreground',
  BACKGROUND = 'background',
  ORPHAN = 'orphan'
}

export const policyOptions = [
  {
    label: 'Foreground',
    value: POLICY_OPTIONS.FOREGROUND
  },
  {
    label: 'Background',
    value: POLICY_OPTIONS.BACKGROUND
  },
  {
    label: 'Orphan',
    value: POLICY_OPTIONS.ORPHAN
  }
]

export interface applicationListItemInterface {
  applicationName: string
  agentId: string
}

export interface retryStrategyInterface {
  limit?: string | number
  baseBackoffDuration?: string
  increaseBackoffByFactor?: string | number
  maxBackoffDuration?: string
}

export interface syncOptionsInterface {
  skipSchemaValidation?: boolean | string
  autoCreateNamespace?: boolean | string
  pruneResourcesAtLast?: boolean | string
  applyOutOfSyncOnly?: boolean | string
  replaceResources?: boolean | string
  prunePropagationPolicy?: POLICY_OPTIONS
}

export interface SyncStepSpec {
  prune?: boolean | string
  dryRun?: boolean | string
  applyOnly?: boolean | string
  forceApply?: boolean | string
  applicationsList?: applicationListItemInterface[] | string | MultiSelectOption[]
  retryStrategy?: retryStrategyInterface
  retry?: boolean | string
  syncOptions?: syncOptionsInterface
}

export interface SyncStepData {
  identifier: string
  name?: string
  type: string
  timeout?: string
  failureStrategies?: AllFailureStrategyConfig[]
  spec?: SyncStepSpec
}

export interface SyncStepFormContentInterface {
  formik: FormikProps<SyncStepData>
  stepViewType: StepViewType
  allowableTypes: AllowedTypes
  projectsFetchError?: GetDataError<Failure | Error> | null
  projectMetadataFetchError?: GetDataError<Failure | Error> | null
  isNewStep?: boolean
  readonly?: boolean
}

export interface ApplicationItemInterface {
  item: MultiSelectOption
  disabled: boolean
  handleClick: () => void
}

export enum HealthStatus {
  Unknown = 'Unknown',
  Progressing = 'Progressing',
  Suspended = 'Suspended',
  Healthy = 'Healthy',
  Unhealthy = 'Unhealthy',
  Degraded = 'Degraded',
  Missing = 'Missing'
}

export enum SyncStatus {
  Unknown = 'Unknown',
  Synced = 'Synced',
  OutOfSync = 'OutOfSync'
}

export interface ApplicationFilters {
  page: number
  size: number
  search: string
  agents: string[]
  healthStatus: HealthStatus[]
  syncStatus: SyncStatus[]
  namespaces: string[]
  repo: string[]
}

export interface ApplicationFilterActions {
  search(term: string): void
}
export interface SyncStepDeploymentModeProps {
  stepViewType: StepViewType
  initialValues: SyncStepData
  allowableTypes: AllowedTypes
  onUpdate?: (data: SyncStepData) => void
  inputSetData?: InputSetData<SyncStepData>
  formik?: any
}

export interface SyncStepStepModeProps {
  stepViewType: StepViewType
  initialValues: SyncStepData
  allowableTypes: AllowedTypes
  onUpdate?: (data: SyncStepData) => void
  onChange?: (data: SyncStepData) => void
  isNewStep?: boolean
  readonly?: boolean
}
