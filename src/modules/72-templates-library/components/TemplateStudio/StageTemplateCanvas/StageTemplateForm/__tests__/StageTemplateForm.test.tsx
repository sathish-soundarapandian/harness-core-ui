/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { set } from 'lodash-es'
import produce from 'immer'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, templatePathProps } from '@common/utils/routeUtils'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import pipelineContextMock from '@pipeline/components/PipelineStudio/RightDrawer/__tests__/stateMock'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import { getTemplateContextMock } from '@templates-library/components/TemplateStudio/__tests__/stateMock'
import { TemplateType } from '@templates-library/utils/templatesUtils'
import { StageTemplateForm } from '../StageTemplateForm'

const pipelineContext = produce(pipelineContextMock, draft => {
  set(draft, 'contextType', 'Template')
})
const templateContext = produce(getTemplateContextMock(TemplateType.Step), draft => {
  set(draft, 'state.templateView.isDrawerOpened', true)
})

describe('<StageTemplateForm /> tests', () => {
  beforeEach(() => jest.clearAllMocks())

  test('should call renderPipelineStage with correct arguments', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toTemplateStudio({ ...accountPathProps, ...templatePathProps, ...pipelineModuleParams })}
        pathParams={{
          templateIdentifier: 'new_stage_name',
          accountId: 'accountId',
          orgIdentifier: 'default',
          projectIdentifier: 'Yogesh_Test',
          module: 'cd',
          templateType: 'Stage'
        }}
      >
        <PipelineContext.Provider value={pipelineContext}>
          <StageTemplateForm />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
    expect(pipelineContext.renderPipelineStage).toBeCalledWith({
      stageType: 'CI',
      minimal: false,
      contextType: 'Template'
    })
  })
  test('should not call renderPipelineStage when template drawer is open', async () => {
    render(
      <TestWrapper
        path={routes.toTemplateStudio({ ...accountPathProps, ...templatePathProps, ...pipelineModuleParams })}
        pathParams={{
          templateIdentifier: 'new_stage_name',
          accountId: 'accountId',
          orgIdentifier: 'default',
          projectIdentifier: 'Yogesh_Test',
          module: 'cd',
          templateType: 'Stage'
        }}
      >
        <PipelineContext.Provider value={pipelineContext}>
          <TemplateContext.Provider value={templateContext}>
            <StageTemplateForm />
          </TemplateContext.Provider>
        </PipelineContext.Provider>
      </TestWrapper>
    )
    expect(pipelineContext.renderPipelineStage).not.toBeCalled()
  })
})
