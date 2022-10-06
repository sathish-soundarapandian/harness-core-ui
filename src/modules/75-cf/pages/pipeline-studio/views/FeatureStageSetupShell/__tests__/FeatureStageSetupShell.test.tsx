/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { PropsWithChildren } from 'react'
import { render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as PipelineContext from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import FeatureStageSetupShell from '../FeatureStageSetupShell'

jest.mock('../../StageOverview/StageOverview', () => ({
  __esModule: true,
  default: ({ children }: PropsWithChildren<unknown>) => (
    <span data-testid="stage-overview-panel">Stage Overview panel {children}</span>
  )
}))

jest.mock('../../RolloutStrategy/RolloutStrategy', () => ({
  RolloutStrategy: () => <span data-testid="rollout-strategy-panel">Rollout Strategy panel</span>
}))

const renderComponent = (): RenderResult =>
  render(
    <TestWrapper>
      <FeatureStageSetupShell />
    </TestWrapper>
  )

describe('FeatureStageSetupShell', () => {
  const scrollToMock = jest.fn()
  const updatePipelineMock = jest.fn()
  const getStageFromPipelineMock = jest.fn()

  beforeAll(() => {
    jest.spyOn(PipelineContext, 'usePipelineContext').mockReturnValue({
      updatePipelineView: jest.fn(),
      updatePipeline: updatePipelineMock,
      getStageFromPipeline: getStageFromPipelineMock,
      state: {
        pipeline: { name: 'Test Pipeline', identifier: 'test_identifier' },
        pipelineView: { isSplitViewOpen: false },
        selectionState: { selectedStageId: '' }
      }
    } as any)

    HTMLElement.prototype.scrollTo = scrollToMock
  })

  beforeEach(() => {
    jest.clearAllMocks()
    getStageFromPipelineMock.mockReturnValue({ stage: null })
  })

  test('it should display the Overview tab', async () => {
    renderComponent()

    userEvent.click(screen.getByRole('tab', { name: 'overview' }))

    await waitFor(() => expect(screen.getByTestId('stage-overview-panel')).toBeInTheDocument())
  })

  test('it should pass the Next button to the Overview tab to display', async () => {
    renderComponent()

    userEvent.click(screen.getByRole('tab', { name: 'overview' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'next chevron-right' })).toBeInTheDocument())
  })

  test('it should switch to the Rollout Strategy tab when the Next button is clicked', async () => {
    renderComponent()

    updatePipelineMock.mockClear()

    userEvent.click(screen.getByRole('tab', { name: 'overview' }))
    userEvent.click(await screen.findByRole('button', { name: 'next chevron-right' }))

    await waitFor(() => {
      expect(screen.getByTestId('rollout-strategy-panel')).toBeInTheDocument()
      expect(updatePipelineMock).toHaveBeenCalled()
    })
  })

  test('it should display the Rollout Strategy tab', async () => {
    renderComponent()

    userEvent.click(screen.getByRole('tab', { name: 'cf.pipeline.rolloutStrategy.title' }))

    await waitFor(() => expect(screen.getByTestId('rollout-strategy-panel')).toBeInTheDocument())
  })

  test('it should scroll to the top of the container when the tab is switched', async () => {
    renderComponent()
    scrollToMock.mockClear()

    userEvent.click(screen.getByRole('tab', { name: 'overview' }))
    await waitFor(() => expect(scrollToMock).toHaveBeenCalledTimes(1))

    userEvent.click(screen.getByRole('tab', { name: 'cf.pipeline.rolloutStrategy.title' }))
    await waitFor(() => expect(scrollToMock).toHaveBeenCalledTimes(2))

    userEvent.click(screen.getByRole('tab', { name: 'overview' }))
    await waitFor(() => expect(scrollToMock).toHaveBeenCalledTimes(3))
  })

  test('it should call updatePipeline when there is stage data, but not execution steps', async () => {
    getStageFromPipelineMock.mockReturnValue({ stage: {} })

    renderComponent()

    await waitFor(() => expect(updatePipelineMock).toHaveBeenCalled())
  })

  test('it should not call updatePipeline when there is stage data that includes execution steps', async () => {
    getStageFromPipelineMock.mockReturnValue({ stage: { stage: { spec: { execution: { steps: [] } } } } })

    renderComponent()

    await waitFor(() => expect(updatePipelineMock).not.toHaveBeenCalled())
  })
})
