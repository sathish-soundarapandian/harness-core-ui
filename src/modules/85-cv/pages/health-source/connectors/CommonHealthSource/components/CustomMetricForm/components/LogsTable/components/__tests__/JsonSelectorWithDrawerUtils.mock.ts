import type { FIELD_ENUM } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import type { CommonCustomMetricFormikInterface } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import type { GetMultiTypeRecordInitialValueParams } from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/CustomMetricForm.types'

export const getMultiTypeRecordInitialValueMockValue: GetMultiTypeRecordInitialValueParams = {
  filteredFieldsMapping: [
    {
      type: 'JsonSelector' as FIELD_ENUM.JSON_SELECTOR,
      label: 'Identifier service path',
      identifier: 'serviceInstance' as keyof CommonCustomMetricFormikInterface,
      defaultValue: '_sourcehost'
    }
  ],
  formValues: {
    serviceInstance: 'test'
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
    serviceInstance: '<+input>'
  } as unknown as CommonCustomMetricFormikInterface
}

export const getMultiTypeRecordInitialExpressionMock: GetMultiTypeRecordInitialValueParams = {
  ...getMultiTypeRecordInitialValidValue,
  formValues: {
    serviceInstance: '<+expression>'
  } as unknown as CommonCustomMetricFormikInterface
}

export const getMultiTypeRecordInitialUndefinedMock: GetMultiTypeRecordInitialValueParams = {
  ...getMultiTypeRecordInitialValidValue,
  formValues: {} as unknown as CommonCustomMetricFormikInterface
}
