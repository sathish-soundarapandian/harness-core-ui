/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import mockImport from 'framework/utils/mockImport'
import ResilienceView, { MemoizedResilienceViewContent, ResilienceViewContentProps } from '../ResilienceView'
import { mockEmptyPipelineContext, mockPipelineContextWithChaosStep } from './mocks/mockData'

// eslint-disable-next-line react/display-name
jest.mock('microfrontends/ChildAppMounter', () => (props: ResilienceViewContentProps) => {
  props.onStageSelectionChange('stageID2')
  props.onViewInChaosModuleClick('expID', 'expRunID', 'faultName')
  return <div data-testid="error-tracking-child-mounter">mounted</div>
})

describe('<ResilienceView /> tests', () => {
  test('Should not crash when chaos notifyIDs are not yet created/empty', () => {
    mockImport('@pipeline/context/ExecutionContext', {
      useExecutionContext: () => {
        return mockEmptyPipelineContext
      }
    })

    const { container } = render(
      <TestWrapper>
        <ResilienceView />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Should render ResilienceView when pipeline has chaos step', () => {
    mockImport('@pipeline/context/ExecutionContext', {
      useExecutionContext: () => {
        return mockPipelineContextWithChaosStep
      }
    })

    const { container } = render(
      <TestWrapper>
        <ResilienceView />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

describe('<MemoizedResilienceViewContent /> tests', () => {
  test('Should re-render MemoizedResilienceViewContent when notifyIDs change', () => {
    const mockOnStageSelectionChange = jest.fn()
    const mockOnViewInChaosModuleClick = jest.fn()

    const { container } = render(
      <TestWrapper>
        <MemoizedResilienceViewContent
          notifyIDs={['notifyID1', 'notifyID2']}
          stageSelectOptions={[
            { label: 'stage', value: 'stageID' },
            { label: 'stage2', value: 'stageID2' }
          ]}
          selectedStageId={'stageID'}
          selectedStageName={'stage'}
          onStageSelectionChange={mockOnStageSelectionChange}
          onViewInChaosModuleClick={mockOnViewInChaosModuleClick}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
    expect(mockOnStageSelectionChange).toHaveBeenCalledTimes(1)
    expect(mockOnViewInChaosModuleClick).toHaveBeenCalledTimes(1)

    render(
      <TestWrapper>
        <MemoizedResilienceViewContent
          notifyIDs={['notifyID3', 'notifyID4']}
          stageSelectOptions={[
            { label: 'stage', value: 'stageID' },
            { label: 'stage2', value: 'stageID2' }
          ]}
          selectedStageId={'stageID'}
          selectedStageName={'stage'}
          onStageSelectionChange={mockOnStageSelectionChange}
          onViewInChaosModuleClick={mockOnViewInChaosModuleClick}
        />
      </TestWrapper>,
      { container }
    )

    expect(container).toMatchSnapshot()
  })
})
