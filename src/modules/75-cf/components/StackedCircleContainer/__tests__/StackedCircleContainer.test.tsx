/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { makeStackedCircleShortName } from '../StackedCircleContainer'

describe('makeStackedCircleShortName', () => {
  test('it should return the 1st character of the 1st and last name', async () => {
    expect(makeStackedCircleShortName('Hello World')).toBe('HW')
  })

  test('it should capitalise the characters', async () => {
    expect(makeStackedCircleShortName('hello world')).toBe('HW')
  })

  test('it should only return 2 characters', async () => {
    expect(makeStackedCircleShortName('Hello to the entire world')).toBe('HT')
  })

  test('it should return the first 2 characters of the 1st word if there is only 1 word', async () => {
    expect(makeStackedCircleShortName('Hello')).toBe('HE')
  })

  test('it should ignore extra spaces', async () => {
    expect(makeStackedCircleShortName(' Hello World')).toBe('HW')
    expect(makeStackedCircleShortName('Hello World ')).toBe('HW')
    expect(makeStackedCircleShortName('Hello  World')).toBe('HW')
    expect(makeStackedCircleShortName('Hello       ')).toBe('HE')
  })
})
