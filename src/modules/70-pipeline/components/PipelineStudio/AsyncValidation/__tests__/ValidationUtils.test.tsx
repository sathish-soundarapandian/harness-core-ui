/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getPolicySetsErrorCount } from '../ValidationUtils'
import { policyEvalFailureValidationResult, successValidationResult } from './mock'

describe('ValidationUtils', () => {
  test('getPolicySetsErrorCount should return correct count', () => {
    expect(getPolicySetsErrorCount()).toBe(0)
    expect(getPolicySetsErrorCount(successValidationResult.data?.policyEval)).toBe(0)
    expect(getPolicySetsErrorCount(policyEvalFailureValidationResult.data?.policyEval)).toBe(2)
  })
})
