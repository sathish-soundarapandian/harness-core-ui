/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { ALLOWED_VALUES_TYPE } from '@common/components/ConfigureOptions/constants'
import { VALIDATORS } from '../validators'

describe('VALIDATORS', () => {
  test('time validator', () => {
    const invalidSyntaxErr = 'Invalid syntax provided'
    const timeValidator = VALIDATORS[ALLOWED_VALUES_TYPE.TIME]
    expect(timeValidator).toBeDefined()
    try {
      timeValidator({ minimum: '10s' }).validateSync({ timeout: '1' })
    } catch (err) {
      expect(err.message).toBe(invalidSyntaxErr)
    }

    try {
      timeValidator({ minimum: '10s' }).validateSync({ timeout: '10s/2w' })
    } catch (err) {
      expect(err.message).toBe(invalidSyntaxErr)
    }

    try {
      timeValidator({ minimum: '10s' }).validateSync({ timeout: '20s' })
    } catch (err) {
      expect(err).not.toBeDefined()
    }
  })
})
