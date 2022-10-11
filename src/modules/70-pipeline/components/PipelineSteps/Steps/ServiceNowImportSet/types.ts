import type { AllowedTypes, SelectOption } from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import type { UseGetReturn } from 'restful-react'
import type { InputSetData, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type {
  StepElementConfig,
  FieldValues,
  ResponseListServiceNowStagingTable,
  GetServiceNowStagingTablesQueryParams,
  Failure
} from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'

interface ServiceNowImportDataSpec {
  jsonBody?: string
  fields?: FieldValues
}

export interface ServiceNowImportSetData extends StepElementConfig {
  spec: {
    connectorRef: string | SelectOption
    stagingTableName: string | ServiceNowStagingTableSelectOption
    importData: {
      type?: string
      spec: ServiceNowImportDataSpec
    }
  }
}

export interface ServiceNowStagingTableSelectOption extends SelectOption {
  key: string
}

export interface ServiceNowImportSetStepModeProps {
  stepViewType: StepViewType
  initialValues: ServiceNowImportSetData
  allowableTypes: AllowedTypes
  onUpdate?: (data: ServiceNowImportSetData) => void
  onChange?: (data: ServiceNowImportSetData) => void
  isNewStep?: boolean
  readonly?: boolean
}

export interface ServiceNowImportSetFormContentInterface {
  formik: FormikProps<ServiceNowImportSetData>
  stepViewType: StepViewType
  allowableTypes: AllowedTypes
  getServiceNowStagingTablesQuery: UseGetReturn<
    ResponseListServiceNowStagingTable,
    Failure | Error,
    GetServiceNowStagingTablesQueryParams,
    unknown
  >
  isNewStep?: boolean
  readonly?: boolean
}

export interface ServiceNowImportSetDeploymentModeProps {
  stepViewType: StepViewType
  initialValues: ServiceNowImportSetData
  allowableTypes: AllowedTypes
  inputSetData?: InputSetData<ServiceNowImportSetData>
}

export interface ServiceNowImportSetVariableListModeProps {
  variablesData: ServiceNowImportSetData
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
}
