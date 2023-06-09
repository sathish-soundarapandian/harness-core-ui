/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { createFormDataFromObjectPayload } from '../Utils'

describe('Test Util methods', () => {
  test('Test createFormDataFromObjectPayload method', () => {
    expect(createFormDataFromObjectPayload({ key1: 'val1', key2: ['val2', 'val3'] })).toBe('key1=val1&key2=val2%2Cval3')
    expect(createFormDataFromObjectPayload({ key1: ['val1', 'val2'] })).toBe('key1=val1%2Cval2')
  })
})
