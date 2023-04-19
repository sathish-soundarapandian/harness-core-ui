/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { IconName, Views } from '@harness/uicore'
import { get } from 'lodash-es'
import type { UseStringsReturn } from 'framework/strings'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import type { TemplateSummaryResponse } from 'services/template-ng'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import type { NGTemplateInfoConfigWithGitDetails } from 'framework/Templates/TemplateConfigModal/TemplateConfigModal'
import templateFactory from '@templates-library/components/Templates/TemplatesFactory'
import type { CommonPaginationQueryParams } from '@common/hooks/useDefaultPaginationProps'
import { useQueryParamsOptions, UseQueryParamsOptions } from '@common/hooks/useQueryParams'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import { COMMON_DEFAULT_PAGE_SIZE } from '@common/constants/Pagination'
import { SortMethod } from '@common/utils/sortUtils'

export enum Sort {
  DESC = 'DESC',
  ASC = 'ASC'
}

export enum TemplateListType {
  Stable = 'Stable',
  LastUpdated = 'LastUpdated',
  All = 'All'
}

export enum SortFields {
  LastUpdatedAt = 'lastUpdatedAt',
  RecentActivity = 'executionSummaryInfo.lastExecutionTs',
  AZ09 = 'AZ09',
  ZA90 = 'ZA90',
  Name = 'name'
}

export const getTypeForTemplate = (
  getString: UseStringsReturn['getString'],
  template?: NGTemplateInfoConfigWithGitDetails | TemplateSummaryResponse
): string | undefined => {
  const templateTye =
    (template as TemplateSummaryResponse)?.templateEntityType || (template as NGTemplateInfoConfigWithGitDetails)?.type
  const childType =
    (template as TemplateSummaryResponse)?.childType || get(template as NGTemplateInfoConfigWithGitDetails, 'spec.type')
  switch (templateTye) {
    case TemplateType.Step:
      return factory.getStepName(childType)
    case TemplateType.Stage:
      return stagesCollection.getStageAttributes(childType, getString)?.name
    default:
      return templateFactory.getTemplateLabel(templateTye)
  }
}

export const getIconForTemplate = (
  getString: UseStringsReturn['getString'],
  template?: NGTemplateInfoConfigWithGitDetails | TemplateSummaryResponse
): IconName | undefined => {
  const templateType =
    (template as TemplateSummaryResponse)?.templateEntityType || (template as NGTemplateInfoConfigWithGitDetails)?.type
  const childType =
    (template as TemplateSummaryResponse)?.childType || get(template as NGTemplateInfoConfigWithGitDetails, 'spec.type')
  switch (templateType) {
    case TemplateType.Step:
      return factory.getStepIcon(childType)
    case TemplateType.StepGroup:
    case TemplateType.Stage:
      return stagesCollection.getStageAttributes(childType, getString)?.icon
    default:
      return templateFactory.getTemplateIcon(templateType)
  }
}

export type TemplatesQueryParams = {
  templateType?: TemplateType
  repoName?: string
  searchTerm?: string
  sort?: SortMethod
  view?: Views
  filterIdentifier?: string
  filters?: string
} & CommonPaginationQueryParams
export type TemplatesQueryParamsWithDefaults = RequiredPick<TemplatesQueryParams, 'page' | 'size' | 'view' | 'sort'>

export const TEMPLATES_PAGE_SIZE = 20
export const TEMPLATES_PAGE_INDEX = 0
export const TEMPLATES_DEFAULT_SORT: SortMethod = SortMethod.LastUpdatedDesc

export const useTemplatesQueryParamOptions = (): UseQueryParamsOptions<TemplatesQueryParamsWithDefaults> => {
  const { PL_NEW_PAGE_SIZE } = useFeatureFlags()

  return useQueryParamsOptions({
    page: TEMPLATES_PAGE_INDEX,
    size: PL_NEW_PAGE_SIZE ? COMMON_DEFAULT_PAGE_SIZE : TEMPLATES_PAGE_SIZE,
    sort: TEMPLATES_DEFAULT_SORT,
    view: Views.GRID
  })
}
