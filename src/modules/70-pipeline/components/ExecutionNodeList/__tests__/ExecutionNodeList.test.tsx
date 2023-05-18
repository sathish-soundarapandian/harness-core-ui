/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import mockImport from 'framework/utils/mockImport'
import { CollapsedNodeProvider } from '../CollapsedNodeStore'
import { ExecutionNodeList } from '../ExecutionNodeList'
import { executionContextMock } from './mock'

const renderExecutionNodeList = (): RenderResult => {
  return render(
    <TestWrapper>
      <CollapsedNodeProvider>
        <ExecutionNodeList />
      </CollapsedNodeProvider>
    </TestWrapper>
  )
}

describe('ExecutionNodeList', () => {
  test('renders step name, status icon and instance list tab based on selected node', async () => {
    mockImport('@pipeline/context/ExecutionContext', {
      useExecutionContext: () => executionContextMock
    })

    const { container } = renderExecutionNodeList()

    expect(screen.getByTestId('collapsed-step-name')).toBeInTheDocument()
    expect(container.querySelector('[data-icon]')).toBeInTheDocument()

    const instanceTab = screen.getByText('pipeline.execution.instanceList')

    expect(instanceTab).toBeInTheDocument()
    await userEvent.click(instanceTab)

    await waitFor(() => {
      expect(screen.getByText('pipeline.execution.instances')).toBeInTheDocument()
    })
  })

  test('should not render anything if node is not present in allNodeMap', () => {
    mockImport('@pipeline/context/ExecutionContext', {
      useExecutionContext: () => ({ ...executionContextMock, selectedCollapsedNodeId: 'foo' })
    })
    renderExecutionNodeList()
    expect(screen.queryByTestId('collapsed-step-name')).not.toBeInTheDocument()
  })
})
