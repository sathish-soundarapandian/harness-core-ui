/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import {
  PipelineContext,
  PipelineContextInterface
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { CacheResponseMetadata } from 'services/pipeline-ng'
import { PipelineCachedCopy, PipelineCachedCopyHandle } from '../PipelineCachedCopy'
import { getDummyPipelineCanvasContextValue } from '../../__tests__/PipelineCanvasTestHelper'

jest.mock('services/pipeline-ng', () => ({
  createPipelinePromise: jest.fn().mockResolvedValue({ status: 'Success' })
}))

const contextValue = getDummyPipelineCanvasContextValue({
  isLoading: false,
  isReadonly: false
})
const cacheResponseContextValue: PipelineContextInterface = {
  ...contextValue,
  state: {
    ...contextValue.state,
    cacheResponse: {
      cacheState: 'VALID_CACHE',
      lastUpdatedAt: 1660213211337,
      ttlLeft: 5000
    }
  }
}

describe('Test Pipeline gitx cache Copy', () => {
  const commonProps = {
    reloadContent: 'pipeline',
    reloadFromCache: jest.fn(),
    cacheResponse: cacheResponseContextValue.state.cacheResponse as CacheResponseMetadata
  }
  test('should render correctly', () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={cacheResponseContextValue}>
          <PipelineCachedCopy {...commonProps} />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should display valid cache icon', async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={cacheResponseContextValue}>
          <PipelineCachedCopy {...commonProps} />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const validcache = container.querySelector(`[data-icon="success-tick"]`)
    expect(validcache).toBeDefined()
  })

  test('should show last updated data on hover', async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={cacheResponseContextValue}>
          <PipelineCachedCopy {...commonProps} />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const validcache = container.querySelector(`[data-icon="success-tick"]`)!
    fireEvent.mouseOver(validcache)
    expect(await screen.findByText('pipeline.pipelineCachedCopy.cachedCopyText')).toBeInTheDocument()
  })

  test('reload the data from cache', async () => {
    const reloadFromCache = jest.fn()
    const ref = React.createRef<PipelineCachedCopyHandle>()

    render(
      <TestWrapper>
        <PipelineContext.Provider value={cacheResponseContextValue}>
          <PipelineCachedCopy
            ref={ref}
            reloadContent="pipeline"
            reloadFromCache={reloadFromCache}
            cacheResponse={cacheResponseContextValue.state.cacheResponse as CacheResponseMetadata}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    ref.current?.showConfirmationModal()

    await waitFor(() => screen.getByText('pipeline.pipelineCachedCopy.reloadPipeline'))
    const confirmReload = screen.getByRole('button', {
      name: /confirm/i
    })
    const cancelButton = screen.getByRole('button', {
      name: /cancel/i
    })
    expect(confirmReload).toBeDefined()
    expect(cancelButton).toBeDefined()

    fireEvent.click(confirmReload)
    await waitFor(() => expect(reloadFromCache).toHaveBeenCalled())
  })
})
