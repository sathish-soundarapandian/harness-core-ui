/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import PipelineResourceRenderer from '../PipelineResourceRenderer'
import mockData from './pipelineMockData.json'

jest.mock('services/pipeline-ng', () => ({
  useGetPipelineList: jest.fn().mockImplementation(() => {
    return { mutate: jest.fn(() => Promise.resolve(mockData)), cancel: jest.fn(), loading: false }
  })
}))
describe('PipelineResource Renderer View', () => {
  test('render pipeline resouce view', async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineResourceRenderer
          identifiers={[]}
          resourceScope={{ accountIdentifier: '' }}
          onResourceSelectionChange={jest.fn()}
          resourceType={ResourceType.ACCOUNT}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
