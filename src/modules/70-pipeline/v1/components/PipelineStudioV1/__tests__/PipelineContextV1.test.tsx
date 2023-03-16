/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { waitFor } from '@testing-library/react'
import * as pipelineNg from 'services/pipeline-ng'
import { findAllByKey, savePipeline } from '../PipelineContextV1/PipelineContextV1'

jest.mock('services/pipeline-ng', () => ({
  putPipelinePromise: jest.fn().mockImplementation(() => Promise.resolve({ status: 'SUCCESS' })),
  createPipelinePromise: jest.fn().mockImplementation(() => Promise.resolve({ status: 'SUCCESS' })),
  putPipelineV2Promise: jest.fn().mockImplementation(() => Promise.resolve({ status: 'SUCCESS' })),
  createPipelineV2Promise: jest.fn().mockImplementation(() => Promise.resolve({ status: 'SUCCESS' }))
}))

describe('Test PipelineContextV1', () => {
  test('Test findAllByKey method', () => {
    expect(findAllByKey('name', { identifier: 'pipeline_id', name: 'pipeline name' }).length).toBe(1)
    expect(findAllByKey('stage', { identifier: 'pipeline_id', name: 'pipeline name' }).length).toBe(0)
  })

  test('Test savePipeline method for pipeline create', async () => {
    savePipeline(
      { accountIdentifier: 'accountId', orgIdentifier: 'orgId', projectIdentifier: 'projectId' },
      { identifier: 'pipeline_id', name: 'Sample Pipeline' },
      false
    )
    await waitFor(() => expect(pipelineNg.createPipelineV2Promise).toHaveBeenCalled())
    await waitFor(() =>
      expect(pipelineNg.createPipelineV2Promise).toHaveBeenCalledWith({
        body: 'identifier: pipeline_id\nname: Sample Pipeline\n',
        queryParams: {
          accountIdentifier: 'accountId',
          orgIdentifier: 'orgId',
          projectIdentifier: 'projectId'
        },
        requestOptions: { headers: { 'Content-Type': 'application/yaml' } }
      })
    )
  })

  test('Test savePipeline method for pipeline update', async () => {
    savePipeline(
      { accountIdentifier: 'accountId', orgIdentifier: 'orgId', projectIdentifier: 'projectId' },
      { identifier: 'pipeline_id', name: 'Sample Pipeline' },
      true
    )
    await waitFor(() => expect(pipelineNg.putPipelineV2Promise).toHaveBeenCalled())
    await waitFor(() =>
      expect(pipelineNg.putPipelineV2Promise).toHaveBeenCalledWith({
        pipelineIdentifier: 'pipeline_id',
        queryParams: {
          accountIdentifier: 'accountId',
          orgIdentifier: 'orgId',
          projectIdentifier: 'projectId'
        },
        body: 'identifier: pipeline_id\nname: Sample Pipeline\n',
        requestOptions: { headers: { 'Content-Type': 'application/yaml' } }
      })
    )
  })
})
