import { MultiTypeInputType } from '@harness/uicore'
import type { LogFieldsMultiTypeState } from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/CustomMetricForm.types'
import { getCanShowSampleLogButton } from '../CommonCustomMetricFormContainer.utils'

describe('CommonCustomMetricFormContainer utils test', () => {
  test('getCanShowSampleLogButton should return true if it is a template and connector and query is fixed', () => {
    const result = getCanShowSampleLogButton({
      isTemplate: true,
      isConnectorRuntimeOrExpression: false,
      isQueryRuntimeOrExpression: false,
      multiTypeRecord: { serviceInstanceField: MultiTypeInputType.FIXED } as LogFieldsMultiTypeState
    })
    expect(result).toBe(true)
  })

  test('getCanShowSampleLogButton should return false if it is a template and connector and query is not fixed', () => {
    const result = getCanShowSampleLogButton({
      isTemplate: true,
      isConnectorRuntimeOrExpression: true,
      isQueryRuntimeOrExpression: false,
      multiTypeRecord: { serviceInstanceField: MultiTypeInputType.FIXED } as LogFieldsMultiTypeState
    })
    expect(result).toBe(false)
  })

  test('getCanShowSampleLogButton should return false if it is a template and connector and query is fixed and one of the log field is runtime', () => {
    const result = getCanShowSampleLogButton({
      isTemplate: true,
      isConnectorRuntimeOrExpression: false,
      isQueryRuntimeOrExpression: false,
      multiTypeRecord: { serviceInstanceField: MultiTypeInputType.RUNTIME } as LogFieldsMultiTypeState
    })
    expect(result).toBe(false)
  })

  test('getCanShowSampleLogButton should return false if it is a template and connector and query is fixed and one of the log field is expression', () => {
    const result = getCanShowSampleLogButton({
      isTemplate: true,
      isConnectorRuntimeOrExpression: false,
      isQueryRuntimeOrExpression: false,
      multiTypeRecord: { serviceInstanceField: MultiTypeInputType.EXPRESSION } as LogFieldsMultiTypeState
    })
    expect(result).toBe(false)
  })

  test('getCanShowSampleLogButton should return true if it is not a template', () => {
    const result = getCanShowSampleLogButton({
      isTemplate: false,
      isConnectorRuntimeOrExpression: false,
      isQueryRuntimeOrExpression: false,
      multiTypeRecord: null
    })
    expect(result).toBe(true)
  })
})
