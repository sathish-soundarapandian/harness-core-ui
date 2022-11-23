/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { MultiSelectOption, SelectOption } from '@harness/uicore'
import { omit } from 'lodash-es'
import type { PipelineFilterProperties, FilterDTO, NGTag } from 'services/pipeline-ng'

import type { FilterDataInterface, FilterInterface } from '@common/components/Filter/Constants'
import { StringUtils } from '@common/exports'
import { BUILD_TYPE, getCIModuleProperties } from './PipelineExecutionFilterRequestUtils'
import type { DeploymentTypeContext, BuildTypeContext } from './PipelineExecutionFilterRequestUtils'

const exclusionList = [
  'buildType',
  'repositoryName',
  'sourceBranch',
  'targetBranch',
  'tag',
  'branch',
  'services',
  'environments',
  'deploymentType',
  'infrastructureType'
]

export const getValidFilterArguments = (formData: Record<string, any>): PipelineFilterProperties => {
  const {
    buildType,
    repositoryName,
    sourceBranch,
    targetBranch,
    branch,
    tag,
    services,
    environments,
    deploymentType,
    infrastructureType,
    pipelineTags
  } = formData
  return Object.assign(omit(formData, ...exclusionList), {
    pipelineTags: Object.keys(pipelineTags || {})?.map((key: string) => {
      return { key, value: pipelineTags[key] } as NGTag
    }),
    moduleProperties: {
      ci: getCIModuleProperties(buildType as BUILD_TYPE, {
        repositoryName,
        sourceBranch,
        targetBranch,
        branch,
        tag
      }),
      cd: {
        deploymentTypes: deploymentType,
        infrastructureTypes: infrastructureType ? [infrastructureType] : undefined,
        serviceNames: services?.map((service: MultiSelectOption) => service?.value),
        environmentNames: environments?.map((env: MultiSelectOption) => env?.value)
      }
    }
  })
}

export type PipelineFormType = Omit<PipelineFilterProperties, 'pipelineTags'> & {
  pipelineTags?: Record<string, any>
} & BuildTypeContext &
  DeploymentTypeContext

export const createRequestBodyPayload = ({
  isUpdate,
  data,
  projectIdentifier,
  orgIdentifier
}: {
  isUpdate: boolean
  data: FilterDataInterface<PipelineFormType, FilterInterface>
  projectIdentifier: string
  orgIdentifier: string
}): FilterDTO => {
  const {
    metadata: { name: _name, filterVisibility, identifier },
    formValues
  } = data
  const {
    name: _pipelineName,
    pipelineTags: _pipelineTags,
    moduleProperties: _moduleProperties,
    description: _description
  } = getValidFilterArguments(formValues)
  return {
    name: _name,
    identifier: isUpdate ? identifier : StringUtils.getIdentifierFromName(_name),
    filterVisibility: filterVisibility,
    projectIdentifier,
    orgIdentifier,
    filterProperties: {
      filterType: 'PipelineSetup',
      pipelineTags: _pipelineTags || [],
      description: _description,
      name: _pipelineName,
      moduleProperties: _moduleProperties as PipelineFilterProperties['moduleProperties']
    } as PipelineFilterProperties
  }
}

export const getMultiSelectFormOptions = (values?: any[]): SelectOption[] | undefined => {
  return values?.map(item => {
    return { label: item.name ?? item, value: item.name ?? item }
  })
}
