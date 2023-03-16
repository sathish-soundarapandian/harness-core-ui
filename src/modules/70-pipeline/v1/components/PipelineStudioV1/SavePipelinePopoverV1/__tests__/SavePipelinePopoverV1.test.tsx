/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, act, waitFor } from '@testing-library/react'
import * as pipelineNg from 'services/pipeline-ng'
import routes from '@common/RouteDefinitions'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { getDummyPipelineCanvasContextValue } from '@pipeline/components/PipelineStudio/PipelineCanvas/__tests__/PipelineCanvasTestHelper'
import { SavePipelinePopoverWithRefV1 } from '../SavePipelinePopoverV1'
import { PipelineContextV1 } from '../../PipelineContextV1/PipelineContextV1'

jest.mock('services/pipeline-ng', () => ({
  putPipelinePromise: jest.fn().mockImplementation(() => Promise.resolve({ status: 'SUCCESS' })),
  createPipelinePromise: jest.fn().mockImplementation(() => Promise.resolve({ status: 'SUCCESS' })),
  createPipelineV2Promise: jest.fn().mockImplementation(() => Promise.resolve({ status: 'SUCCESS' }))
}))

describe('Test SavePipelinePopoverV1 component', () => {
  const testWrapperProps: TestWrapperProps = {
    path: routes.toPipelineStudioV1({
      pipelineIdentifier: ':pipelineIdentifier',
      orgIdentifier: ':orgIdentifier',
      accountId: ':accountId',
      projectIdentifier: ':projectIdentifier'
    }),
    pathParams: {
      pipelineIdentifier: -1,
      orgIdentifier: 'TEST_ORG',
      accountId: 'TEST_ACCOUNT',
      projectIdentifier: 'TEST_PROJECT'
    }
  }
  test('Initial render is ok', () => {
    const contextValue = getDummyPipelineCanvasContextValue({ isLoading: false })
    const { getByText } = render(
      <TestWrapper {...testWrapperProps}>
        <PipelineContextV1.Provider value={contextValue}>
          <SavePipelinePopoverWithRefV1 toPipelineStudio={jest.fn()} />
        </PipelineContextV1.Provider>
      </TestWrapper>
    )
    expect(getByText('save')).toBeInTheDocument()
  })

  test.only('User clicks on "Save" button', async () => {
    const contextValue = getDummyPipelineCanvasContextValue({
      isLoading: false,
      isReadonly: false,
      isIntermittentLoading: false,
      isUpdated: true
    })
    const { getByText } = render(
      <TestWrapper {...testWrapperProps}>
        <PipelineContextV1.Provider value={contextValue}>
          <SavePipelinePopoverWithRefV1 toPipelineStudio={jest.fn()} />
        </PipelineContextV1.Provider>
      </TestWrapper>
    )

    await act(async () => {
      fireEvent.click(getByText('save'))
    })
    await waitFor(() => expect(pipelineNg.createPipelineV2Promise).toHaveBeenCalled())
  })
})
