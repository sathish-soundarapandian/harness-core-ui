import type { TemplateFilterProperties, GetTemplateListQueryParams } from 'services/template-ng'

export type TemplateListPageQueryParams = Omit<
  GetTemplateListQueryParams,
  'accountIdentifier' | 'orgIdentifier' | 'projectIdentifier' | 'templateListType'
> & { filters?: TemplateFilterProperties }

export type ProcessedTemplateListPageQueryParams = RequiredPick<TemplateListPageQueryParams, 'page' | 'size' | 'sort'>
