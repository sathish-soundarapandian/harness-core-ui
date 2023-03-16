import type { FIELD_ENUM } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import type { CommonCustomMetricFormikInterface } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import type { GetMultiTypeRecordInitialValueParams } from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/CustomMetricForm.types'

export const getMultiTypeRecordInitialValueMockValue: GetMultiTypeRecordInitialValueParams = {
  jsonSelectorFields: [
    {
      type: 'JsonSelector' as FIELD_ENUM.JSON_SELECTOR,
      label: 'Identifier service path',
      identifier: 'serviceInstanceField' as keyof CommonCustomMetricFormikInterface,
      defaultValue: '_sourcehost',
      isTemplateSupportEnabled: true
    }
  ],
  formValues: {
    serviceInstanceField: 'test'
  } as unknown as CommonCustomMetricFormikInterface
}

export const getMultiTypeRecordInitialValueNoFormValue: GetMultiTypeRecordInitialValueParams = {
  ...getMultiTypeRecordInitialValueMockValue,
  formValues: undefined as unknown as CommonCustomMetricFormikInterface
}

export const getMultiTypeRecordInitialValidValue: GetMultiTypeRecordInitialValueParams = {
  ...getMultiTypeRecordInitialValueMockValue,
  isTemplate: true
}

export const getMultiTypeRecordInitialTemplateMock: GetMultiTypeRecordInitialValueParams = {
  ...getMultiTypeRecordInitialValidValue,
  formValues: {
    serviceInstanceField: '<+input>'
  } as unknown as CommonCustomMetricFormikInterface
}

export const getMultiTypeRecordInitialExpressionMock: GetMultiTypeRecordInitialValueParams = {
  ...getMultiTypeRecordInitialValidValue,
  formValues: {
    serviceInstanceField: '<+expression>'
  } as unknown as CommonCustomMetricFormikInterface
}

export const getMultiTypeRecordInitialUndefinedMock: GetMultiTypeRecordInitialValueParams = {
  ...getMultiTypeRecordInitialValidValue,
  formValues: {} as unknown as CommonCustomMetricFormikInterface
}
