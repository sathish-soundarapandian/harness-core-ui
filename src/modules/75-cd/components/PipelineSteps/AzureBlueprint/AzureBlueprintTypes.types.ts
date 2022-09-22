/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import type { AllowedTypes as MultiTypeAllowedTypes } from '@harness/uicore'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'

export enum GitFetchTypes {
  Branch = 'Branch',
  Commit = 'Commit'
}

export const gitFetchTypeList = [
  { label: 'Latest from Branch', value: GitFetchTypes.Branch },
  { label: 'Specific Commit Id / Git Tag', value: GitFetchTypes.Commit }
]

export enum fileTypes {
  ENCRYPTED = 'encrypted',
  FILE_STORE = 'fileStore'
}

export interface HarnessFileStore {
  fileType: fileTypes
  file: string | undefined
}

export enum ScopeTypes {
  Subscription = 'Subscription',
  ManagementGroup = 'ManagementGroup'
}
export interface AzureBlueprintData {
  type: string
  name: string
  identifier: string
  timeout: string
  spec: {
    configuration: {
      connectorRef: string
      scope: string
      assignmentName: string
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
            folderPath?: string
          }
        }
      }
    }
  }
  store?: string
}

export interface AzureBlueprintProps {
  initialValues: AzureBlueprintData
  onUpdate?: (data: AzureBlueprintData) => void
  onChange?: (data: AzureBlueprintData) => void
  allowableTypes: MultiTypeAllowedTypes
  stepViewType?: StepViewType
  configTypes?: SelectOption[]
  isNewStep?: boolean
  inputSetData?: {
    template?: AzureBlueprintData
    path?: string
  }
  readonly?: boolean
  path?: string
  stepType?: string
  allValues?: AzureBlueprintData
}

export interface AzureBlueprintStepInfo {
  spec: any
  name: string
  identifier: string
  timeout: string
  type: string
}
