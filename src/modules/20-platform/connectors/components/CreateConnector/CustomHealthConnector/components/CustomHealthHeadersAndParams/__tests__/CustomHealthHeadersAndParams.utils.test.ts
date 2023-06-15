/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { ValueType } from '@secrets/components/TextReference/TextReference'
import * as secretField from '@secrets/utils/SecretField'
import {
  transformSpecDataToStepData,
  transformStepHeadersAndParamsForPayload,
  validateHeadersAndParams
} from '../CustomHealthHeadersAndParams.utils'
import { SpecHeaders, SpecParams, StepHeaders, StepParams } from './CustomHealthHeadersAndParams.mocks'

describe('Unit tests for CustomHealthHeadersAndParams.utils', () => {
  test('Ensure transformStepHeadersAndParamsForPayload works', async () => {
    expect(transformStepHeadersAndParamsForPayload(StepHeaders, StepParams)).toEqual({
      headers: SpecHeaders,
      params: SpecParams
    })
  })

  test('Ensure validation works correctly', async () => {
    expect(
      validateHeadersAndParams(
        {
          baseURL: '',
          headers: [],
          params: []
        },
        jest.fn(input => input)
      )
    ).toEqual({ baseURL: 'connectors.customHealth.baseURL' })

    expect(
      validateHeadersAndParams(
        {
          baseURL: '',
          headers: [
            { key: '', value: { textField: 'sdfdsf', fieldType: ValueType.TEXT } },
            { key: 'sdfsdf', value: { textField: 'sdfdsf', fieldType: ValueType.TEXT } },
            { key: 'sdsfd', value: null as any }
          ],
          params: [
            {
              key: '',
              value: {
                secretField: { referenceString: 'sdf.sdfsd' },
                fieldType: ValueType.ENCRYPTED
              }
            },
            { key: '', value: null as any },
            { key: 'sdsfd', value: { secretField: { referenceString: 'sdfsf.sdfs' }, fieldType: ValueType.ENCRYPTED } }
          ]
        },
        jest.fn(input => input)
      )
    ).toEqual({
      baseURL: 'connectors.customHealth.baseURL',
      'headers[0].key': 'connectors.customHealth.keyRequired',
      'params[0].key': 'connectors.customHealth.keyRequired'
    })
  })

  test('Ensure transformSpecDataToStepData works', async () => {
    const secretObj = {
      identifier: '1234_iden',
      name: 'some_name',
      referenceString: '12313_sdfsf',
      accountIdentifier: 'accountId_2134'
    }
    jest.spyOn(secretField, 'setSecretField').mockReturnValue(Promise.resolve(secretObj))

    const result = await transformSpecDataToStepData(
      {
        spec: {
          params: SpecParams,
          headers: SpecHeaders,
          baseURL: 'https://abcd.com'
        }
      },
      {
        accountIdentifier: '1234_accountId'
      }
    )
    expect(result).toEqual({
      baseURL: 'https://abcd.com',
      headers: [
        {
          key: 'header1',
          value: {
            fieldType: 'TEXT',
            textField: 'solo'
          }
        },
        {
          key: 'header2',
          value: {
            fieldType: 'ENCRYPTED',
            secretField: secretObj
          }
        }
      ],
      params: [
        {
          key: 'param1',
          value: {
            fieldType: 'ENCRYPTED',
            secretField: secretObj
          }
        },
        {
          key: 'param2',
          value: {
            fieldType: 'ENCRYPTED',
            secretField: secretObj
          }
        }
      ]
    })
  })
})
