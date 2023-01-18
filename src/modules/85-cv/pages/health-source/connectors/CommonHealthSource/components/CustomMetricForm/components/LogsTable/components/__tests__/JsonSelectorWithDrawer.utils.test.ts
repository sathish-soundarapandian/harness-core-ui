import { getMultiTypeRecordInitialValue } from '../JsonSelectorWithDrawer.utils'
import {
  getMultiTypeRecordInitialExpressionMock,
  getMultiTypeRecordInitialTemplateMock,
  getMultiTypeRecordInitialUndefinedMock,
  getMultiTypeRecordInitialValidValue,
  getMultiTypeRecordInitialValueMockValue,
  getMultiTypeRecordInitialValueNoFormValue
} from './JsonSelectorWithDrawerUtils.mock'

describe('JsonSelectorWithDrawer utils', () => {
  test('getMultiTypeRecordInitialValue should return null, if mandatory values are not passed', () => {
    const result = getMultiTypeRecordInitialValue(getMultiTypeRecordInitialValueMockValue)

    expect(result).toBeNull()

    const result2 = getMultiTypeRecordInitialValue(getMultiTypeRecordInitialValueNoFormValue)

    expect(result2).toBeNull()
  })
  test('getMultiTypeRecordInitialValue should return correct value, if all values are present', () => {
    const result = getMultiTypeRecordInitialValue(getMultiTypeRecordInitialValidValue)

    expect(result).toEqual({ serviceInstance: 'FIXED' })
  })

  test('getMultiTypeRecordInitialValue should return template value, if all the value is template', () => {
    const result = getMultiTypeRecordInitialValue(getMultiTypeRecordInitialTemplateMock)

    expect(result).toEqual({ serviceInstance: 'RUNTIME' })
  })

  test('getMultiTypeRecordInitialValue should return expression value, if all the value is expression', () => {
    const result = getMultiTypeRecordInitialValue(getMultiTypeRecordInitialExpressionMock)

    expect(result).toEqual({ serviceInstance: 'EXPRESSION' })
  })

  test('getMultiTypeRecordInitialValue should return fixed value, if all the value is undefined', () => {
    const result = getMultiTypeRecordInitialValue(getMultiTypeRecordInitialUndefinedMock)

    expect(result).toEqual({ serviceInstance: 'FIXED' })
  })
})
