/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, queryByText, render, waitFor } from '@testing-library/react'
import produce from 'immer'
import { set } from 'lodash-es'
import { findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import { TemplatePipelineSpecifications } from '@pipeline/components/PipelineStudio/PipelineTemplateBuilder/TemplatePipelineSpecifications/TemplatePipelineSpecifications'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import pipelineContextMock from '@pipeline/components/PipelineStudio/RightDrawer/__tests__/stateMock'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import * as templateService from 'services/template-ng'
import { parse } from '@common/utils/YamlHelperMethods'
import type { ResponseString } from 'services/template-ng'

export const pipelineTemplateInputYaml: ResponseString = {
  status: 'SUCCESS',
  data:
    'stages:\n' +
    '- stage:\n' +
    '    identifier: "Stage_1"\n' +
    '    type: "Approval"\n' +
    '    spec:\n' +
    '      execution:\n' +
    '        steps:\n' +
    '        - step:\n' +
    '            identifier: "Step_1"\n' +
    '            type: "ShellScript"\n' +
    '            spec:\n' +
    '              source:\n' +
    '                type: "Inline"\n' +
    '                spec:\n' +
    '                  script: "<+input>"\n' +
    '            timeout: "<+input>"\n' +
    'delegateSelectors: "<+input>"\n'
}

const useGetTemplateInputSetYamlMock = jest.spyOn(templateService, 'useGetTemplateInputSetYaml').mockImplementation(
  () =>
    ({
      data: pipelineTemplateInputYaml,
      refetch: jest.fn(),
      error: null,
      loading: false
    } as any)
)

jest.spyOn(templateService, 'getsMergedTemplateInputYamlPromise').mockImplementation(
  () =>
    ({
      status: 'SUCCESS',
      data: {
        mergedTemplateInputs: pipelineTemplateInputYaml
      }
    } as any)
)

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => {
    return {
      data: {
        status: 'SUCCESS',
        data: {
          mergedPipelineYaml:
            'pipeline:\n' +
            '  name: "Test Pipeline"\n' +
            '  identifier: "Test_Pipeline"\n' +
            '  stages:\n' +
            '  - stage:\n' +
            '      identifier: "Stage_1"\n' +
            '      type: "Approval"\n' +
            '      name: "Stage 1"\n' +
            '      description: ""\n' +
            '      spec:\n' +
            '        execution:\n' +
            '          steps:\n' +
            '          - step:\n' +
            '              identifier: "Step_1"\n' +
            '              type: "ShellScript"\n' +
            '              name: "Step 1"\n' +
            '              spec:\n' +
            '                shell: "Bash"\n' +
            '                onDelegate: true\n' +
            '                source:\n' +
            '                  type: "Inline"\n' +
            '                  spec:\n' +
            '                    script: "<+input>"\n' +
            '                environmentVariables: []\n' +
            '                outputVariables: []\n' +
            '              timeout: "<+input>"\n' +
            '      tags: {}\n' +
            '  delegateSelectors: "<+input>"\n' +
            '  tags: {}\n' +
            '  projectIdentifier: "Yogesh_Without_GitSync"\n' +
            '  orgIdentifier: "default"\n'
        }
      },
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  })
}))

const contextMock = produce(pipelineContextMock, draft => {
  set(draft, 'state.pipeline', {
    name: 'Test Pipeline',
    identifier: 'Test_Pipeline',
    template: {
      templateRef: 'Test_Pipeline_Template',
      versionLabel: 'v1'
    },
    tags: {},
    projectIdentifier: 'Yogesh_Without_GitSync',
    orgIdentifier: 'default'
  })
})

function WrappedComponent() {
  return (
    <PipelineContext.Provider value={contextMock}>
      <TestWrapper
        path={routes.toPipelineStudio({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
        pathParams={{
          pipelineIdentifier: 'Test_Pipeline',
          accountId: 'accountId',
          projectIdentifier: 'Yogesh_Without_GitSync',
          orgIdentifier: 'default',
          module: 'cd'
        }}
      >
        <TemplatePipelineSpecifications />
      </TestWrapper>
    </PipelineContext.Provider>
  )
}

describe('<TemplatePipelineSpecifications/> tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should call updatePipeline correctly when input values is changed', async () => {
    const { container } = render(<WrappedComponent />)

    const timeoutInputBefore = container.querySelector(
      '[name="template.templateInputs.stages[0].stage.spec.execution.steps[0].step.timeout"]'
    ) as HTMLElement
    expect(timeoutInputBefore).toHaveAttribute('disabled')

    const settingsIcon = container.querySelector('.bp3-popover-wrapper.MultiTypeInput--wrapper button') as HTMLElement
    await act(async () => {
      fireEvent.click(settingsIcon)
    })

    const popOver = findPopoverContainer() as HTMLElement
    const fixedValueButton = queryByText(popOver, 'Fixed value') as HTMLElement
    await act(async () => {
      fireEvent.click(fixedValueButton)
    })

    const timeoutInputAfter = container.querySelector(
      '[name="template.templateInputs.stages[0].stage.spec.execution.steps[0].step.timeout"]'
    ) as HTMLElement
    expect(timeoutInputAfter).not.toHaveAttribute('disabled')
    await act(async () => {
      fireEvent.change(timeoutInputAfter, { target: { value: '10s' } })
    })

    await waitFor(() => {
      expect(contextMock.updatePipeline).toBeCalledWith(
        produce(contextMock.state.pipeline, draft => {
          set(draft, 'template.templateInputs', parse(pipelineTemplateInputYaml.data || ''))
          set(draft, 'template.templateInputs.stages[0].stage.spec.execution.steps[0].step.timeout', '10s')
        })
      )
    })
  })

  test('should not render inputs when no template inputs', async () => {
    useGetTemplateInputSetYamlMock.mockImplementation(
      () =>
        ({
          data: {
            status: 'SUCCESS'
          },
          refetch: jest.fn(),
          error: null,
          loading: false
        } as any)
    )

    const { container } = render(<WrappedComponent />)
    const inputsContainer = container.querySelector('.inputsContainer')
    expect(inputsContainer).toBeNull()
  })

  test('snapshot test with error', async () => {
    const refetch = jest.fn()
    useGetTemplateInputSetYamlMock.mockImplementation(
      () =>
        ({
          refetch,
          error: {
            message: 'Failed to fetch: 400 Bad Request',
            data: {
              status: 'ERROR',
              code: 'TEMPLATE_EXCEPTION',
              message: 'Template to fetch template inputs does not exist.',
              correlationId: '31cc76e3-2914-4b9c-8b33-6faf1873ee65',
              detailedMessage: null,
              responseMessages: [
                {
                  code: 'TEMPLATE_EXCEPTION',
                  level: 'ERROR',
                  message: 'Template to fetch template inputs does not exist.',
                  exception: null,
                  failureTypes: []
                }
              ],
              metadata: null
            },
            status: 400
          },
          loading: false
        } as any)
    )

    const { getByRole } = render(<WrappedComponent />)
    const retryBtn = getByRole('button', { name: 'Retry' })
    await act(async () => {
      fireEvent.click(retryBtn)
    })
    expect(refetch).toBeCalled()
  })
})
