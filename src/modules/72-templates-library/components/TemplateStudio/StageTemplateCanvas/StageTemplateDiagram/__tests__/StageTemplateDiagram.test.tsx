/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import produce from 'immer'
import { TestWrapper } from '@common/utils/testUtils'
import {
  approvalStageTemplateMock,
  stageTemplateMock
} from '@templates-library/components/TemplateStudio/__tests__/stateMock'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import pipelineContextMock from '@pipeline/components/PipelineStudio/RightDrawer/__tests__/stateMock'
import {
  DefaultNewStageId,
  DefaultNewStageName
} from '@templates-library/components/TemplateStudio/StageTemplateCanvas/StageTemplateForm/StageTemplateForm'
import { StageType } from '@pipeline/utils/stageHelpers'
import { StageTemplateDiagram } from '../StageTemplateDiagram'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@wings-software/monaco-yaml/lib/esm/languageservice/yamlLanguageService', () => ({
  getLanguageService: jest.fn()
}))

const contextMock = produce(pipelineContextMock, draft => {
  draft.stagesMap = {
    Deployment: {
      name: 'Deploy',
      type: StageType.DEPLOY,
      icon: 'cd-main',
      iconColor: 'var(--pipeline-deploy-stage-color)',
      isApproval: false,
      openExecutionStrategy: true
    },
    Approval: {
      name: 'Approval',
      type: StageType.APPROVAL,
      icon: 'approval-stage-icon',
      iconColor: 'var(--pipeline-approval-stage-color)',
      isApproval: true,
      openExecutionStrategy: false
    }
  }
})

describe('<StageTemplateDiagram /> tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should render plus button when stage is not selected', async () => {
    const context = produce(contextMock, draft => {
      draft.getStageFromPipeline = _stageId => {
        return {}
      }
    })
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={context}>
          <StageTemplateDiagram />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    const node = container.querySelector('[data-nodeid="create-node"] .defaultNode') as HTMLElement
    expect(node).toBeDefined()
    let dynamicPopover = document.querySelector('[class*="dynamicPopover"]')
    expect(dynamicPopover).toBeNull()
    await act(async () => {
      fireEvent.click(node)
    })
    dynamicPopover = document.querySelector('[class*="dynamicPopover"]')
    expect(dynamicPopover).toBeDefined()
  })

  test('should render stage button when stage is selected', async () => {
    const context = produce(contextMock, draft => {
      draft.getStageFromPipeline = jest.fn().mockReturnValue({
        stage: {
          stage: {
            ...stageTemplateMock.spec,
            name: DefaultNewStageName,
            identifier: DefaultNewStageId
          }
        }
      })
    })

    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={context}>
          <StageTemplateDiagram />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test.only('should render stage button when approval  is selected', async () => {
    const context = produce(contextMock, draft => {
      draft.getStageFromPipeline = jest.fn().mockReturnValue({
        stage: {
          stage: {
            ...approvalStageTemplateMock.spec,
            name: DefaultNewStageName,
            identifier: DefaultNewStageId
          }
        }
      })
    })

    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={context}>
          <StageTemplateDiagram />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
