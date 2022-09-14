/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { createElkHealthSourcePayload, buildElkHealthSourceInfo } from '../ElkHealthSource.utils'
import { setupSource, ElkPayload, data, params } from './ElkHealthSource.mock'

describe('Test Util functions', () => {
  test('Test CreateElkHealthSourcePayload', () => {
    expect(createElkHealthSourcePayload(setupSource)).toEqual(ElkPayload)
  })
  test('Test buildElkHealthSourceInfo', () => {
    expect(buildElkHealthSourceInfo(params, data)).toEqual(setupSource)
  })
})
