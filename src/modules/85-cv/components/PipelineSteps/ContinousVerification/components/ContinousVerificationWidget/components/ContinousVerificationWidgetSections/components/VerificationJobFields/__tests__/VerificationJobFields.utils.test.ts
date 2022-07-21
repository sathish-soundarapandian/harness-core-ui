/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AllowedTypesWithRunTime } from '@wings-software/uicore'
import { getMultiTypeInputProps } from '../VerificationJobFields.utils'

describe('Test for VerificationJobFields Utils', () => {
  test('Test if getMultiTypeInputProps method gives correct results', () => {
    expect(
      getMultiTypeInputProps(['infrastructure', 'pipeline'], [
        'FIXED',
        'RUNTIME',
        'EXPRESSION'
      ] as AllowedTypesWithRunTime[])
    ).toEqual({
      expressions: ['infrastructure', 'pipeline'],
      allowableTypes: ['FIXED', 'RUNTIME', 'EXPRESSION']
    })
  })
})
