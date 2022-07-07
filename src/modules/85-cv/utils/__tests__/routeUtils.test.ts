/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { PipelineInfoConfig } from 'services/pipeline-ng'
import { isVerifyStepPresent } from '../routeUtils'
import { mockedTemplate } from './routeUtils.mock'

describe('Test for Route Utils', () => {
  test('Test if verify step is present in the pipeline or not', () => {
    expect(isVerifyStepPresent(mockedTemplate as PipelineInfoConfig)).toEqual(true)
  })
})
