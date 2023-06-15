/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { convertVariableFormDataToDTO, getValueFromVariableAndValidationType } from '../VariablesUtils'
import {
  StringFixedFormAccount,
  StringFixedFormOrg,
  StringFixedFormProject,
  StringFixedPayloadAcc,
  StringFixedPayloadOrg,
  StringFixedPayloadProj
} from './mockConstants'

describe('Connector Utils', () => {
  test('getVaribaleTypeOptions Account String Fixed', () => {
    expect(convertVariableFormDataToDTO(StringFixedFormAccount)).toEqual(StringFixedPayloadAcc)
  })

  test('getVaribaleTypeOptions Project String Fixed', () => {
    expect(convertVariableFormDataToDTO(StringFixedFormProject)).toEqual(StringFixedPayloadProj)
  })

  test('getVaribaleTypeOptions Org String Fixed', () => {
    expect(convertVariableFormDataToDTO(StringFixedFormOrg)).toEqual(StringFixedPayloadOrg)
  })
  test('getValueFromVariableAndValidationType throw Error', () => {
    expect(() =>
      getValueFromVariableAndValidationType({
        name: 'name',
        identifier: 'identifier',
        type: 'Unsuppported Type',
        spec: { valueType: 'FIXED' }
      } as any)
    ).toThrow('Unsupported Variable type.')
  })

  test('getValueFromVariableAndValidationType throw Error', () => {
    expect(() =>
      getValueFromVariableAndValidationType({
        name: 'name',
        identifier: 'identifier',
        type: 'String',
        spec: { valueType: 'Unsopported' }
      } as any)
    ).toThrow('Unsupported validation type for String variable.')
  })
})
