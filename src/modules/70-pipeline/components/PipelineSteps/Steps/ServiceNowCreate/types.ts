/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import type { FormikProps } from 'formik'
import type { UseGetReturn } from 'restful-react'
import type { MultiSelectOption, AllowedTypes, SelectOption } from '@harness/uicore'
import type { InputSetData, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type {
  Failure,
  ServiceNowFieldNG,
  StepElementConfig,
  ResponseListServiceNowFieldNG,
  ResponseListServiceNowTicketTypeDTO,
  ResponseListServiceNowTemplate,
  ServiceNowFieldValueNG,
  GetServiceNowTicketTypesQueryParams,
  GetServiceNowIssueCreateMetadataQueryParams,
  GetServiceNowTemplateMetadataQueryParams
} from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import type { ServiceNowTicketTypeSelectOption } from '@pipeline/components/PipelineSteps/Steps/ServiceNowApproval/types'

export interface ServiceNowCreateFieldType {
  name: string
  value: string | number | SelectOption | MultiSelectOption[]
}

export interface ServiceNowFieldNGWithValue extends ServiceNowFieldNG {
  value: string | number | SelectOption | MultiSelectOption[]
}
export enum FieldType {
  ConfigureFields = 'ConfigureFields',
  CreateFromTemplate = 'CreateFromTemplate'
}
export interface ServiceNowCreateData extends StepElementConfig {
  spec: {
    connectorRef: string | SelectOption
    ticketType: string | ServiceNowTicketTypeSelectOption
    fields: ServiceNowCreateFieldType[]
    selectedFields?: ServiceNowFieldNGWithValue[]
    delegateSelectors?: string[]
    fieldType?: FieldType
    description?: string
    shortDescription?: string
    templateFields?: ServiceNowFieldValueNG[]
    templateName?: string
    useServiceNowTemplate: boolean
    isTemplateSectionAvailable?: boolean
  }
}

export interface ServiceNowCreateVariableListModeProps {
  variablesData: ServiceNowCreateData
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
}

export interface ServiceNowCreateStepModeProps {
  stepViewType: StepViewType
  initialValues: ServiceNowCreateData
  onUpdate?: (data: ServiceNowCreateData) => void
  onChange?: (data: ServiceNowCreateData) => void
  allowableTypes: AllowedTypes
  isNewStep?: boolean
  readonly?: boolean
}

export interface ServiceNowCreateFormContentInterface {
  formik: FormikProps<ServiceNowCreateData>
  stepViewType: StepViewType
  allowableTypes: AllowedTypes
  isNewStep?: boolean
  readonly?: boolean
  serviceNowTicketTypesQuery: UseGetReturn<
    ResponseListServiceNowTicketTypeDTO,
    Failure | Error,
    GetServiceNowTicketTypesQueryParams,
    unknown
  >
  serviceNowIssueCreateMetadataQuery: UseGetReturn<
    ResponseListServiceNowFieldNG,
    Failure | Error,
    GetServiceNowIssueCreateMetadataQueryParams,
    unknown
  >
  serviceNowTemplateMetaDataQuery: UseGetReturn<
    ResponseListServiceNowTemplate,
    Failure | Error,
    GetServiceNowTemplateMetadataQueryParams,
    unknown
  >
}

export enum ServiceNowCreateFormFieldSelector {
  FIXED = 'FIXED',
  EXPRESSION = 'EXPRESSION'
}

export interface ServiceNowFieldSelectorProps {
  fields: ServiceNowFieldNG[]
  selectedFields: ServiceNowFieldNG[]
  addSelectedFields: (selectedFields: ServiceNowFieldNG[]) => void
  onCancel: () => void
}

export interface ServiceNowDynamicFieldsSelectorInterface {
  connectorRef: string
  selectedTicketTypeKey: string | ServiceNowTicketTypeSelectOption
  serviceNowType: string
  selectedFields?: ServiceNowFieldNG[]
  addSelectedFields: (fields: ServiceNowFieldNG[], selectedTicketTypeKey: string) => void
  provideFieldList: (fields: ServiceNowCreateFieldType[]) => void
  onCancel: () => void
  ticketTypeBasedFieldList: ServiceNowFieldNG[] | undefined
}

export interface ServiceNowCreateDeploymentModeProps {
  stepViewType: StepViewType
  initialValues: ServiceNowCreateData
  onUpdate?: (data: ServiceNowCreateData) => void
  allowableTypes: AllowedTypes
  inputSetData?: InputSetData<ServiceNowCreateData>
  formik?: any
}

export interface ServiceNowCreateDeploymentModeFormContentInterface extends ServiceNowCreateDeploymentModeProps {
  serviceNowTicketTypesQuery: UseGetReturn<
    ResponseListServiceNowTicketTypeDTO,
    Failure | Error,
    GetServiceNowTicketTypesQueryParams,
    unknown
  >
  serviceNowIssueCreateMetadataQuery: UseGetReturn<
    ResponseListServiceNowFieldNG,
    Failure | Error,
    GetServiceNowIssueCreateMetadataQueryParams,
    unknown
  >
}

export enum ServiceNowStaticFields {
  short_description = 'short_description',
  description = 'description'
}
