/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  getMultiTypeFromValue,
  MultiTypeInputType,
  AllowedTypes as MultiTypeAllowedTypes,
  SelectOption
} from '@harness/uicore'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { StringKeys } from 'framework/strings'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'

export enum GitFetchTypes {
  Branch = 'Branch',
  Commit = 'Commit'
}

export const gitFetchTypeList = [
  { label: 'Latest from Branch', value: GitFetchTypes.Branch },
  { label: 'Specific Commit Id / Git Tag', value: GitFetchTypes.Commit }
]

export interface StartupScriptDataType {
  branch: string | undefined
  commitId: string | undefined
  gitFetchType: 'Branch' | 'Commit'
  paths: string | string[] | undefined
  repoName?: string | undefined
}

export enum ScopeTypes {
  ResourceGroup = 'ResourceGroup',
  Subscription = 'Subscription',
  ManagementGroup = 'ManagementGroup',
  Tenant = 'Tenant'
}

export const ScopeTypeLabels = (scope: ScopeTypes): StringKeys => {
  switch (scope) {
    case ScopeTypes.ResourceGroup:
      return 'common.resourceGroupLabel'
    case ScopeTypes.Subscription:
      return 'common.plans.subscription'
    case ScopeTypes.ManagementGroup:
      return 'cd.azureArm.managementGroup'
    case ScopeTypes.Tenant:
      return 'cd.azureArm.tenant'
  }
}

export interface ResourceGroup {
  subscription: string
  resourceGroup: string
  mode: string
}

export interface Subscription {
  subscription: string
  location: string
}

export interface ManagementGroup {
  managementGroupId: string
  location: string
}

export interface Tenant {
  location: string
}

export enum fileTypes {
  ENCRYPTED = 'encrypted',
  FILE_STORE = 'fileStore'
}

export interface HarnessFileStore {
  fileType: fileTypes
  file: string | undefined
}

export const isFixed = (value?: string): boolean => getMultiTypeFromValue(value) === MultiTypeInputType.FIXED

export interface AzureArmData {
  type: string
  name: string
  identifier: string
  timeout: string
  spec: {
    provisionerIdentifier: string
    configuration: {
      connectorRef: string
      scope: {
        type: string
        spec: ResourceGroup | Subscription | Tenant | ManagementGroup
      }
      template: {
        store: {
          type: string
          spec: {
            gitFetchType?: string
            connectorRef?: string
            branch?: string
            repoName?: string
            files?: string
            secretFiles?: string
            paths?: [string] | string
          }
        }
      }
      parameters?: {
        store: {
          type: string
          spec: {
            gitFetchType?: string
            connectorRef?: string
            branch?: string
            repoName?: string
            files?: string
            secretFiles?: string
            paths?: [string] | string
          }
        }
      }
    }
  }
}

export interface AzureArmProps {
  initialValues: AzureArmData
  onUpdate?: (data: AzureArmData) => void
  onChange?: (data: AzureArmData) => void
  allowableTypes: MultiTypeAllowedTypes
  stepViewType?: StepViewType
  configTypes?: SelectOption[]
  isNewStep?: boolean
  inputSetData?: {
    template?: AzureArmData
    path?: string
  }
  readonly?: boolean
  path?: string
  stepType?: string
  allValues?: AzureArmData
  isParam?: boolean
  azureRef?: any
}

export interface AzureArmStepInfo {
  spec: any
  name: string
  identifier: string
  timeout: string
  type: string
}

export interface AzureArmVariableStepProps {
  initialValues: AzureArmData
  originalData?: AzureArmData
  stageIdentifier?: string
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData?: AzureArmData
  stepType?: string
  onUpdate?(data: AzureArmData): void
}
