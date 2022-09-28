/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { mockDelegateSelectorsResponse, newTag } from './DelegateSelectorsMockData'
import { addTagIfNeeded, removeTagIfNeeded } from '../DelegateSelectors.utils'

describe('Test DelegateSelectors Utility Functions', () => {
  test('test remove tags', () => {
    const fn = removeTagIfNeeded
    expect(
      fn(mockDelegateSelectorsResponse.data.resource, mockDelegateSelectorsResponse.data.resource[0]).updatedCreatedTags
    ).toEqual(mockDelegateSelectorsResponse.data.resource.slice(1))
  })

  test('add new tag', () => {
    const fn = addTagIfNeeded
    expect(fn(mockDelegateSelectorsResponse.data.resource, [], newTag).updatedCreatedTags).toEqual([newTag])
  })

  test('should not allow addition of existing tags', () => {
    const fn = addTagIfNeeded
    expect(
      fn(mockDelegateSelectorsResponse.data.resource, [], mockDelegateSelectorsResponse.data.resource[0])
        .updatedCreatedTags
    ).toEqual([])
  })
})
