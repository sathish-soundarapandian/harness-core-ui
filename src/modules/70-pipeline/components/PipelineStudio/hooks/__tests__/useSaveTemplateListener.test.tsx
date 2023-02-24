/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, render, waitFor } from '@testing-library/react'
import { fireEvent, within } from '@testing-library/dom'
import produce from 'immer'
import { set } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import { useSaveTemplateListener } from '@pipeline/components/PipelineStudio/hooks/useSaveTemplateListener'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import pipelineContextMock from '@pipeline/components/PipelineStudio/RightDrawer/__tests__/stateMock'
// eslint-disable-next-line no-restricted-imports
import { pipelineTemplate, stageTemplateVersion1, stepTemplate } from '@templates-library/TemplatesTestHelper'
import type { StageElementConfig } from 'services/cd-ng'

function WrappedComponent(): JSX.Element {
  useSaveTemplateListener()
  return <></>
}

describe('useSaveTemplateListener tests', () => {
  test('should call updateStep when step template is used', async () => {
    const contextMock = produce(pipelineContextMock, draft => {
      set(draft, 'state.pipelineView.drawerData.data.stepConfig.node.identifier', 'step1')
    })
    const { baseElement } = render(
      <TestWrapper>
        <PipelineContext.Provider value={contextMock}>
          <WrappedComponent />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    await act(async () => {
      window.dispatchEvent(new CustomEvent('TEMPLATE_SAVED', { detail: stepTemplate.data }))
    })

    const confirmButton = await within(baseElement).findByText('yes')
    expect(confirmButton).toBeInTheDocument()
    fireEvent.click(confirmButton)

    const updatedStage = produce(contextMock.state.pipeline.stages?.[0].stage as StageElementConfig, draft => {
      set(draft, 'spec.execution.steps[0].step', {
        identifier: 'step1',
        name: 'step1',
        template: { templateRef: 'Test_Http_Template', versionLabel: 'v1' }
      })
    })
    await waitFor(() => expect(contextMock.updateStage).toBeCalledWith(updatedStage))
  })

  test('should call updateStage when stage template is used', async () => {
    const { baseElement } = render(
      <TestWrapper>
        <PipelineContext.Provider value={pipelineContextMock}>
          <WrappedComponent />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    await act(async () => {
      window.dispatchEvent(new CustomEvent('TEMPLATE_SAVED', { detail: stageTemplateVersion1.data }))
    })

    const confirmButton = await within(baseElement).findByText('yes')
    expect(confirmButton).toBeInTheDocument()
    fireEvent.click(confirmButton)

    await waitFor(() =>
      expect(pipelineContextMock.updateStage).toBeCalledWith({
        identifier: 's1',
        name: 's1',
        template: { templateRef: 'Test_Stage_Template', versionLabel: 'Version1' }
      })
    )
  })

  test('should call updatePipeline when pipeline template is used', async () => {
    const { baseElement } = render(
      <TestWrapper>
        <PipelineContext.Provider value={pipelineContextMock}>
          <WrappedComponent />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    await act(async () => {
      window.dispatchEvent(new CustomEvent('TEMPLATE_SAVED', { detail: pipelineTemplate.data }))
    })

    const confirmButton = await within(baseElement).findByText('yes')
    expect(confirmButton).toBeInTheDocument()
    fireEvent.click(confirmButton)

    await waitFor(() =>
      expect(pipelineContextMock.updatePipeline).toBeCalledWith({
        description: undefined,
        identifier: 'stage1',
        name: 'stage1',
        orgIdentifier: 'CV',
        projectIdentifier: 'Milos2',
        tags: {},
        template: { templateRef: 'Test_Pipeline_Template', versionLabel: 'v1' }
      })
    )
  })
})
