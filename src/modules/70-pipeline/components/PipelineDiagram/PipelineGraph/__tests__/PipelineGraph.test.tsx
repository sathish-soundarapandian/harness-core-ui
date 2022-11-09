/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import * as StageHelpers from '@pipeline/utils/stageHelpers'
import PipelineGraphDataMock from './mocks/PipelineGraphDataMock'
import { getPipelineGraphData } from '../PipelineGraphUtils'

describe('PipelineGraphUtils', () => {
  test('getPipelineGraphData for a CI step with service dependencies', () => {
    const mockFn = jest.spyOn(StageHelpers, 'getDefaultBuildDependencies')
    getPipelineGraphData(PipelineGraphDataMock)
    expect(mockFn).toBeCalledWith(PipelineGraphDataMock['serviceDependencies'])
  })
})
