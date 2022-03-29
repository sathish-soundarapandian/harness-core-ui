/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getStringKeyFromObjectValues, PreferenceScope } from '../PreferenceStoreContext'

describe('PreferenceStoreContext tests', () => {
  test('if getStringKeyFromObjectValues works correctly', () => {
    let key = getStringKeyFromObjectValues(PreferenceScope.USER, { userId: 'abc@gmail.com' }, 'MY_SAVED_ENTITY')
    expect(key).toBe('abc@gmail.com/MY_SAVED_ENTITY')

    key = getStringKeyFromObjectValues(PreferenceScope.ACCOUNT, { accountId: 'abcXYZ' }, 'MY_SAVED_ENTITY')
    expect(key).toBe('abcXYZ/MY_SAVED_ENTITY')

    key = getStringKeyFromObjectValues(
      PreferenceScope.ORG,
      { accountId: 'abcXYZ', orgIdentifier: 'theOrgId' },
      'MY_SAVED_ENTITY'
    )
    expect(key).toBe('abcXYZ/theOrgId/MY_SAVED_ENTITY')

    key = getStringKeyFromObjectValues(
      PreferenceScope.PROJECT,
      { accountId: 'abcXYZ', orgIdentifier: 'theOrgId', projectIdentifier: 'my_project' },
      'MY_SAVED_ENTITY'
    )
    expect(key).toBe('abcXYZ/theOrgId/my_project/MY_SAVED_ENTITY')
  })
})
