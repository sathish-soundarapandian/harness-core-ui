/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import { getMultiTypeFromValue, MultiTypeInputType, AllowedTypes as MultiTypeAllowedTypes } from '@harness/uicore'
import type { IconName } from '@harness/icons'
import { Connectors } from '@connectors/constants'
import type { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { StringKeys } from 'framework/strings'
import type { ConnectorInfoDTO } from 'services/cd-ng'

export const AllowedTypes: Array<ConnectorTypes> = ['Git', 'Github', 'GitLab', 'Bitbucket', 'Harness']
export type ConnectorTypes = 'Git' | 'Github' | 'GitLab' | 'Bitbucket' | 'Harness'

export const ConnectorIcons: Record<string, IconName> = {
  Git: 'service-github',
  Github: 'github',
  GitLab: 'service-gotlab',
  Bitbucket: 'bitbucket',
  Harness: 'harness'
}

export const ConnectorMap: Record<string, ConnectorInfoDTO['type']> = {
  Git: Connectors.GIT,
  Github: Connectors.GITHUB,
  GitLab: Connectors.GITLAB,
  Bitbucket: Connectors.BITBUCKET,
  Harness: Connectors.HARNESS
}

export const ConnectorLabelMap: Record<ConnectorTypes, StringKeys> = {
  Git: 'pipeline.manifestType.gitConnectorLabel',
  Github: 'common.repo_provider.githubLabel',
  GitLab: 'common.repo_provider.gitlabLabel',
  Bitbucket: 'pipeline.manifestType.bitBucketLabel',
  Harness: 'pipeline.manifestType.gitConnectorLabel'
}

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
  Subscription = 'SUBSCRIPTIOIN',
  ManagementGroup = 'MANAGEMENT_GROUP'
}

export const isRuntime = (value?: string): boolean => getMultiTypeFromValue(value) === MultiTypeInputType.RUNTIME

export interface AzureBlueprintData {
  type: string
  name: string
  identifier: string
  timeout: string
  spec: {
    provisionerIdentifier: string
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
            paths?: string
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
