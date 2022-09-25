/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { replaceDefaultValues } from '../templateUtils'

describe('templateUtils', () => {
  test('replaceDefaultValues test', () => {
    const template = {
      var1: '<+input>',
      var2: { var3: { var4: '<+input>', var5: '<+input>.default(myDefaultValue)' } },
      var6: '<+input>.default(myDefaultValue).executionInput()'
    }

    expect(replaceDefaultValues(template)).toEqual({
      var1: '<+input>',
      var2: { var3: { var4: '<+input>', var5: 'myDefaultValue' } },
      var6: '<+input>.default(myDefaultValue).executionInput()'
    })
  })
})
