/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
//xxx
import { createSplunkHealthSourcePayload, buildSplunkHealthSourceInfo } from '../ElkHealthSource.utils'
import { setupSource, splunkPayload, data, params } from './ElkHealthSource.mock'

describe('Test Util functions', () => {
  test('Test CreateSplunkHealthSourcePayload', () => {
    expect(createSplunkHealthSourcePayload(setupSource)).toEqual(splunkPayload)
  })
  test('Test buildSplunkHealthSourceInfo', () => {
    expect(buildSplunkHealthSourceInfo(params, data)).toEqual(setupSource)
  })
})
