/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { getPolicySetValidationSchema } from '../utils'

describe('getPolicySetValidationSchema utils test', () => {
  test('getPolicySetValidationSchema works correctly', async () => {
    const minimumErrorMessage = 'At least 1 Policy Set required'
    const invalidErrorMessage = 'Invalid Payload'
    const fn = getPolicySetValidationSchema
    // no config is passed
    // rejects
    await expect(fn({ minimumErrorMessage, invalidErrorMessage }).validate([])).rejects.toThrow(minimumErrorMessage)
    await expect(fn({ minimumErrorMessage, invalidErrorMessage }).validate([''])).rejects.toThrow(minimumErrorMessage)
    await expect(fn({ minimumErrorMessage, invalidErrorMessage }).validate('dummy')).rejects.toThrow(
      invalidErrorMessage
    )
    // passes for array of string and expressions
    await expect(fn({ minimumErrorMessage, invalidErrorMessage }).validate(['test1', 'test2'])).resolves.toStrictEqual([
      'test1',
      'test2'
    ])
    await expect(
      fn({ minimumErrorMessage, invalidErrorMessage }).validate(['<+expr.test1>', '<+expr.test2>'])
    ).resolves.toStrictEqual(['<+expr.test1>', '<+expr.test2>'])
    // passes for runtime value
    await expect(fn({ minimumErrorMessage, invalidErrorMessage }).validate(RUNTIME_INPUT_VALUE)).resolves.toStrictEqual(
      RUNTIME_INPUT_VALUE
    )
  })
})
