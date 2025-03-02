/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo, get, isEmpty, isEqual, set, unset, map, omit } from 'lodash-es'
import produce from 'immer'
import type { GetDataError } from 'restful-react'
import React from 'react'
import { parse } from '@common/utils/YamlHelperMethods'
import type {
  PipelineInfoConfig,
  StageElementConfig,
  StepElementConfig,
  TemplateLinkConfig,
  TemplateStepNode,
  Failure,
  Error
} from 'services/pipeline-ng'
import {
  getTemplatePromise,
  GetTemplateQueryParams,
  ResponseTemplateResponse,
  TemplateSummaryResponse,
  getTemplateListPromise,
  GetTemplateListQueryParams,
  ResponsePageTemplateSummaryResponse,
  TemplateResponse
} from 'services/template-ng'
import {
  getIdentifierFromValue,
  getScopeFromDTO,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { StageType } from '@pipeline/utils/stageHelpers'
import type { StepOrStepGroupOrTemplateStepData } from '@pipeline/components/PipelineStudio/StepCommands/StepCommandTypes'
import { generateRandomString } from '@pipeline/components/PipelineStudio/ExecutionGraph/ExecutionGraphUtil'
import { Category } from '@common/constants/TrackingConstants'
import type { ServiceDefinition } from 'services/cd-ng'
import { ErrorHandler } from '@common/components/ErrorHandler/ErrorHandler'
import { getGitQueryParamsWithParentScope } from '@common/utils/gitSyncUtils'
import type { StoreMetadata } from '@common/constants/GitSyncTypes'
import type { TemplateIcons } from './types'

export const TEMPLATE_INPUT_PATH = 'template.templateInputs'
export interface TemplateServiceDataType {
  [key: string]: ServiceDefinition['type']
}

export const getTemplateNameWithLabel = (template?: TemplateSummaryResponse): string => {
  return `${template?.name} (${defaultTo(template?.versionLabel, 'Stable')})`
}

export const getScopeBasedTemplateRef = (template: TemplateSummaryResponse): string => {
  const templateIdentifier = defaultTo(template.identifier, '')
  const scope = getScopeFromDTO(template)
  return scope === Scope.PROJECT ? templateIdentifier : `${scope}.${templateIdentifier}`
}

export const getStageType = (stage?: StageElementConfig, templateTypes?: { [key: string]: string }): StageType => {
  return stage?.template
    ? templateTypes
      ? (get(templateTypes, stage.template.templateRef) as StageType)
      : ((stage.template.templateInputs as StageElementConfig)?.type as StageType)
    : (stage?.type as StageType)
}

export const getStepType = (step?: StepElementConfig | TemplateStepNode): StepType => {
  return (step as TemplateStepNode)?.template
    ? (((step as TemplateStepNode).template.templateInputs as StepElementConfig)?.type as StepType)
    : ((step as StepElementConfig)?.type as StepType)
}

export const setTemplateInputs = (
  data: TemplateStepNode | StageElementConfig | PipelineInfoConfig,
  templateInputs: TemplateLinkConfig['templateInputs']
): void => {
  if (isEmpty(templateInputs)) {
    unset(data, TEMPLATE_INPUT_PATH)
  } else {
    set(data, TEMPLATE_INPUT_PATH, templateInputs)
  }
}

export const createTemplate = <T extends PipelineInfoConfig | StageElementConfig | StepOrStepGroupOrTemplateStepData>(
  data?: T,
  template?: TemplateSummaryResponse
): T => {
  return produce({} as T, draft => {
    draft.name = defaultTo(data?.name, '')
    draft.identifier = defaultTo(data?.identifier, '')
    if (template) {
      set(draft, 'template.templateRef', getScopeBasedTemplateRef(template))
      if (template.versionLabel) {
        set(draft, 'template.versionLabel', template.versionLabel)
      }
      set(draft, 'template.templateInputs', get(data, 'template.templateInputs'))
    }
  })
}

export const getTemplateRefVersionLabelObject = (template: TemplateSummaryResponse): TemplateLinkConfig => {
  return {
    templateRef: defaultTo(getScopeBasedTemplateRef(template), ''),
    versionLabel: defaultTo(template.versionLabel, '')
  }
}

export const createStepNodeFromTemplate = (template: TemplateSummaryResponse, isCopied = false): StepElementConfig => {
  return (isCopied
    ? produce(defaultTo(parse<any>(defaultTo(template?.yaml, ''))?.template.spec, {}) as StepElementConfig, draft => {
        draft.name = defaultTo(template?.name, '')
        draft.identifier = generateRandomString(defaultTo(template?.name, ''))
      })
    : produce({} as TemplateStepNode, draft => {
        draft.name = defaultTo(template?.name, '')
        draft.identifier = generateRandomString(defaultTo(template?.name, ''))
        set(draft, 'template.templateRef', getScopeBasedTemplateRef(template))
        if (template.versionLabel) {
          set(draft, 'template.versionLabel', template.versionLabel)
        }
      })) as unknown as StepElementConfig
}

export const getScopedTemplatesFromTemplateRefs = (templateRefs: string[]): Record<string, string[]> => {
  return templateRefs.reduce((a: { [key: string]: string[] }, b) => {
    const identifier = getIdentifierFromValue(b)
    const scope = getScopeFromValue(b)
    if (a[scope]) {
      a[scope].push(identifier)
    } else {
      a[scope] = [identifier]
    }
    return a
  }, {})
}

const getPromisesForTemplateList = (
  params: GetTemplateListQueryParams,
  templateRefs: string[]
): Promise<ResponsePageTemplateSummaryResponse>[] => {
  const scopedTemplates = getScopedTemplatesFromTemplateRefs(templateRefs)

  const promises: Promise<ResponsePageTemplateSummaryResponse>[] = []
  Object.keys(scopedTemplates).forEach(scope => {
    promises.push(
      getTemplateListPromise({
        body: {
          filterType: 'Template',
          templateIdentifiers: scopedTemplates[scope]
        },
        queryParams: {
          ...params,
          projectIdentifier: scope === Scope.PROJECT ? params.projectIdentifier : undefined,
          orgIdentifier: scope === Scope.PROJECT || scope === Scope.ORG ? params.orgIdentifier : undefined,
          repoIdentifier: params.repoIdentifier,
          branch: params.branch,
          getDefaultFromOtherRepo: true
        }
      })
    )
  })

  return promises
}

const getPromisesForTemplateGet = (
  params: GetTemplateQueryParams,
  templateRefs: string[],
  storeMetadata?: StoreMetadata,
  loadFromCache?: boolean
): Promise<ResponseTemplateResponse>[] => {
  const promises: Promise<ResponseTemplateResponse>[] = []
  templateRefs.forEach(templateRef => {
    const templateIdentifier = getIdentifierFromValue(templateRef)
    const scope = getScopeFromValue(templateRef)
    promises.push(
      getTemplatePromise({
        templateIdentifier,
        queryParams: {
          ...params,
          projectIdentifier: scope === Scope.PROJECT ? params.projectIdentifier : undefined,
          orgIdentifier: scope === Scope.PROJECT || scope === Scope.ORG ? params.orgIdentifier : undefined,
          ...getGitQueryParamsWithParentScope({
            storeMetadata,
            params: {
              accountId: params.accountIdentifier,
              orgIdentifier: defaultTo(params.orgIdentifier, ''),
              projectIdentifier: defaultTo(params.projectIdentifier, '')
            },
            repoIdentifier: params.repoIdentifier,
            branch: params.branch
          })
        },
        requestOptions: {
          headers: {
            ...(loadFromCache ? { 'Load-From-Cache': 'true' } : {})
          }
        }
      })
    )
  })

  return promises
}

export const getResolvedCustomDeploymentDetailsByRef = (
  params: GetTemplateListQueryParams,
  templateRefs: string[]
): Promise<{ resolvedCustomDeploymentDetailsByRef: { [key: string]: Record<string, string | string[]> } }> => {
  const promises = getPromisesForTemplateList(params, templateRefs)
  return Promise.all(promises)
    .then(responses => {
      const resolvedCustomDeploymentDetailsByRef = {}
      responses.forEach(response => {
        response.data?.content?.forEach(item => {
          const templateData = parse<any>(item.yaml || '').template
          const scopeBasedTemplateRef = getScopeBasedTemplateRef(item)
          set(resolvedCustomDeploymentDetailsByRef, scopeBasedTemplateRef, {
            name: item.name,
            linkedTemplateRefs: map(templateData?.spec?.execution?.stepTemplateRefs, (stepTemplateRef: string) =>
              getIdentifierFromValue(stepTemplateRef)
            )
          })
        })
      })
      return { resolvedCustomDeploymentDetailsByRef }
    })
    .catch(_ => {
      return { resolvedCustomDeploymentDetailsByRef: {} }
    })
}

export const getTemplateTypesByRef = (
  params: GetTemplateListQueryParams | GetTemplateQueryParams,
  templateRefs: string[],
  storeMetadata?: StoreMetadata,
  supportingTemplatesGitx?: boolean,
  loadFromCache?: boolean
): Promise<{
  templateTypes: { [key: string]: string }
  templateServiceData: TemplateServiceDataType
  templateIcons: TemplateIcons
}> => {
  return supportingTemplatesGitx
    ? getTemplateTypesByRefV2(params, templateRefs, storeMetadata, loadFromCache)
    : getTemplateTypesByRefV1(params as GetTemplateListQueryParams, templateRefs)
}

const setTemplateProperties = (
  templateTypes: Record<string, unknown>,
  templateServiceData: Record<string, unknown>,
  templateIcons: TemplateIcons,
  template: TemplateSummaryResponse | TemplateResponse
): void => {
  const templateData = parse<any>(template.yaml || '').template
  const scopeBasedTemplateRef = getScopeBasedTemplateRef(template)
  set(templateTypes, scopeBasedTemplateRef, defaultTo(templateData.spec.type, templateData?.type))
  set(templateIcons, scopeBasedTemplateRef, template.icon || templateData.icon)

  const serviceData = defaultTo(
    templateData.spec.spec?.serviceConfig?.serviceDefinition?.type,
    templateData.spec.spec?.deploymentType
  )
  if (templateData.type === Category.STAGE && serviceData) {
    set(templateServiceData, scopeBasedTemplateRef, serviceData)
  }
}

export const getTemplateTypesByRefV1 = (
  params: GetTemplateListQueryParams,
  templateRefs: string[]
): Promise<{
  templateTypes: { [key: string]: string }
  templateServiceData: TemplateServiceDataType
  templateIcons: TemplateIcons
}> => {
  const promises = getPromisesForTemplateList(params, templateRefs)
  return Promise.all(promises)
    .then(responses => {
      const templateServiceData = {}
      const templateTypes = {}
      const templateIcons = {}
      responses.forEach(response => {
        response.data?.content?.forEach(item => {
          setTemplateProperties(templateTypes, templateServiceData, templateIcons, item)
        })
      })
      return { templateTypes, templateServiceData, templateIcons }
    })
    .catch(_ => {
      return { templateTypes: {}, templateServiceData: {}, templateIcons: {} }
    })
}

export const getTemplateTypesByRefV2 = (
  params: GetTemplateQueryParams,
  templateRefs: string[],
  storeMetadata?: StoreMetadata,
  loadFromCache?: boolean
): Promise<{
  templateTypes: { [key: string]: string }
  templateServiceData: TemplateServiceDataType
  templateIcons: TemplateIcons
}> => {
  const promises = getPromisesForTemplateGet(
    omit(params, 'templateListType'),
    templateRefs,
    storeMetadata,
    loadFromCache
  )
  return Promise.all(promises)
    .then(responses => {
      const templateServiceData = {}
      const templateTypes = {}
      const templateIcons = {}
      responses.forEach(response => {
        if (response?.data) {
          setTemplateProperties(templateTypes, templateServiceData, templateIcons, response.data)
        }
      })
      return { templateTypes, templateServiceData, templateIcons }
    })
    .catch(_ => {
      return { templateTypes: {}, templateServiceData: {}, templateIcons: {} }
    })
}

export const getResolvedTemplateDetailsByRef = (
  params: GetTemplateListQueryParams,
  templateRefs: string[]
): Promise<{
  templateDetailsByRef: { [key: string]: TemplateSummaryResponse }
}> => {
  const promises = getPromisesForTemplateList(params, templateRefs)
  return Promise.all(promises)
    .then(responses => {
      const templateDetailsByRef = {}
      responses.forEach(response => {
        response.data?.content?.forEach(item => {
          const scopeBasedTemplateRef = getScopeBasedTemplateRef(item)
          set(templateDetailsByRef, scopeBasedTemplateRef, item)
        })
      })
      return { templateDetailsByRef }
    })
    .catch(_ => {
      return { templateDetailsByRef: {} }
    })
}

export const areTemplatesSame = (template1?: TemplateSummaryResponse, template2?: TemplateSummaryResponse): boolean => {
  return (
    isEqual(template1?.name, template2?.name) &&
    isEqual(template1?.identifier, template2?.identifier) &&
    isEqual(template1?.projectIdentifier, template2?.projectIdentifier) &&
    isEqual(template1?.orgIdentifier, template2?.orgIdentifier)
  )
}

export const areTemplatesEqual = (
  template1?: TemplateSummaryResponse,
  template2?: TemplateSummaryResponse
): boolean => {
  return areTemplatesSame(template1, template2) && isEqual(template1?.versionLabel, template2?.versionLabel)
}

export const getTemplateErrorMessage = (
  error: GetDataError<Failure | Error> | null,
  className?: string
): string | JSX.Element | undefined => {
  return isEmpty((error?.data as Error)?.responseMessages) ? (
    defaultTo((error?.data as Error)?.message, error?.message)
  ) : (
    <ErrorHandler responseMessages={(error?.data as Error).responseMessages!} className={className} />
  )
}
