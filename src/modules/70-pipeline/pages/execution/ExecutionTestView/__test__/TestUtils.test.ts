/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getTimeSavedToDisplay } from '../TestsUtils'

describe('Test TestUtils methods', () => {
  test('Test getTimeSavedToDisplay method', () => {
    expect(getTimeSavedToDisplay(1372 * 60 * 60)).toBe('1h 22m')
    expect(getTimeSavedToDisplay(1000 * 60 * 60)).toBe('1h')
    expect(getTimeSavedToDisplay(1372 * 60)).toBe('1m 22s')
    expect(getTimeSavedToDisplay(1000 * 60)).toBe('1m')
    expect(getTimeSavedToDisplay(1372)).toBe('1s')
    expect(getTimeSavedToDisplay(1000)).toBe('1s')
    expect(getTimeSavedToDisplay(372)).toBe('372ms')
    expect(getTimeSavedToDisplay(0)).toBe('0')
    expect(getTimeSavedToDisplay(-1)).toBe('0')
  })
})
