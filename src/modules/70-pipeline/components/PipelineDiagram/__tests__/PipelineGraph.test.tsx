/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { PageSpinner } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { DiagramFactory } from '../DiagramFactory'
import nodeGraphData from './nodeGraphData.json'
import type { PipelineGraphState } from '../types'

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
const intersectionObserverMock = () => ({
  observe: () => null,
  unobserve: () => null
})

window.IntersectionObserver = jest.fn().mockImplementation(intersectionObserverMock)

describe('Stage diagram test', () => {
  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('Should render diagramnodes', () => {
    const diagram = new DiagramFactory('graph')
    const PipelineStudio = diagram.render()
    const { container } = render(
      <TestWrapper>
        <PipelineStudio data={nodeGraphData as PipelineGraphState[]} loaderComponent={PageSpinner} />
      </TestWrapper>
    )
    const testNode = container.querySelector(`[data-node-id="${nodeGraphData[0].id}"]`)
    expect(testNode).toBeDefined()
    // find nodename
    const nodeLabel = testNode?.querySelector(`[data-node-name="${nodeGraphData[0].name}"]`)
    expect(nodeLabel).toBeDefined()
    expect(container).toMatchSnapshot()
  })
})
