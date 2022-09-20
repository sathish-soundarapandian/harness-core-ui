/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import produce from 'immer'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import pipelineContextMock from '@pipeline/components/PipelineStudio/RightDrawer/__tests__/stateMock'
import { TestWrapper } from '@common/utils/testUtils'
import { TemplateStageSpecifications } from '@templates-library/components/TemplateStageSpecifications/TemplateStageSpecifications'
import type { TemplateBarProps } from '@pipeline/components/PipelineStudio/TemplateBar/TemplateBar'
import {
  stageMockTemplateVersion1InputYaml,
  stageMockTemplateVersion2InputYaml,
  stageTemplateVersion1,
  stageTemplateVersion2
} from '@templates-library/TemplatesTestHelper'
import { useGetTemplate, useGetTemplateInputSetYaml } from 'services/template-ng'

window.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: () => null,
  unobserve: () => null
}))

jest.mock('services/template-ng')

jest.mock('framework/strings', () => ({
  ...(jest.requireActual('framework/strings') as any),
  useStrings: jest.fn().mockReturnValue({
    getString: jest.fn().mockImplementation(val => val)
  })
}))

jest.mock('@pipeline/components/PipelineStudio/TemplateBar/TemplateBar', () => ({
  ...(jest.requireActual('@pipeline/components/PipelineStudio/TemplateBar/TemplateBar') as any),
  // eslint-disable-next-line react/display-name
  TemplateBar: (_props: TemplateBarProps) => {
    return <div className="template-bar"></div>
  }
}))

jest.mock('services/template-ng', () => ({
  ...(jest.requireActual('services/template-ng') as any),
  useGetTemplateInputSetYaml: jest.fn().mockImplementation(() => ({
    data: stageMockTemplateVersion1InputYaml,
    refetch: jest.fn(),
    error: null,
    loading: false
  })),
  useGetTemplate: jest
    .fn()
    .mockImplementation(() => ({ data: stageTemplateVersion1, refetch: jest.fn(), error: null, loading: false })),
  getsMergedTemplateInputYamlPromise: jest.fn().mockImplementation(() => ({
    status: 'SUCCESS',
    data: {
      mergedTemplateInputs: stageMockTemplateVersion1InputYaml
    }
  }))
}))

jest.mock('services/cd-ng', () => ({
  useGetServiceAccessList: jest.fn().mockImplementation(() => ({
    loading: false,
    data: {
      status: 'SUCCESS',
      data: []
    },
    refetch: jest.fn()
  }))
}))

describe('<TemplateStageSpecifications /> tests', () => {
  test('snapshot test with template inputs', async () => {
    const contextMock = produce(pipelineContextMock, draft => {
      draft.getStageFromPipeline = jest.fn().mockReturnValue({
        stage: {
          stage: {
            name: 'Stage 1',
            identifier: 'Stage_1',
            template: {
              templateRef: 'Test_Stage_Template',
              versionLabel: 'Version1',
              templateInputs: {
                type: 'Deployment',
                spec: {
                  serviceConfig: {
                    serviceRef: '<+input>'
                  },
                  infrastructure: {
                    infrastructureDefinition: {
                      type: 'KubernetesDirect',
                      spec: {
                        namespace: '<+input>'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      })
    })
    const { container } = render(
      <PipelineContext.Provider value={contextMock}>
        <TestWrapper
          path={routes.toPipelineStudio({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
          pathParams={{
            pipelineIdentifier: 'stage1',
            accountId: 'accountId',
            projectIdentifier: 'Milos2',
            orgIdentifier: 'CV',
            module: 'cd'
          }}
        >
          <TemplateStageSpecifications />
        </TestWrapper>
      </PipelineContext.Provider>
    )
    expect(container).toMatchSnapshot()
    const inputsContainer = container.getElementsByClassName('inputsContainer')[0]
    expect(inputsContainer).not.toBeEmptyDOMElement()
    const nameInput = container.querySelector('[name="name"]') as HTMLElement
    await act(async () => {
      fireEvent.change(nameInput, { target: { value: 'Stage 2' } })
    })
    await waitFor(() => {
      expect(contextMock.updateStage).toBeCalled()
    })
  })

  test('snapshot test with no template inputs', async () => {
    ;(useGetTemplateInputSetYaml as jest.Mock).mockImplementation(() => ({
      data: stageMockTemplateVersion2InputYaml,
      refetch: jest.fn(),
      error: null,
      loading: false
    }))
    ;(useGetTemplate as jest.Mock).mockImplementation(() => ({
      data: stageTemplateVersion2,
      refetch: jest.fn(),
      error: null,
      loading: false
    }))

    const contextMock = produce(pipelineContextMock, draft => {
      draft.getStageFromPipeline = jest.fn().mockReturnValue({
        stage: {
          stage: {
            name: 'Stage 1',
            identifier: 'Stage_1',
            template: { templateRef: 'Test_Stage_Template', versionLabel: 'Version2' }
          }
        }
      })
    })

    const { container } = render(
      <PipelineContext.Provider value={contextMock}>
        <TestWrapper
          path={routes.toPipelineStudio({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
          pathParams={{
            pipelineIdentifier: 'stage1',
            accountId: 'accountId',
            projectIdentifier: 'Milos2',
            orgIdentifier: 'CV',
            module: 'cd'
          }}
        >
          <TemplateStageSpecifications />
        </TestWrapper>
      </PipelineContext.Provider>
    )
    expect(container).toMatchSnapshot()
    const inputsContainer = container.getElementsByClassName('inputsContainer')[0]
    expect(inputsContainer).toBeEmptyDOMElement()
  })

  test('snapshot test with error', async () => {
    const refetch1 = jest.fn()
    ;(useGetTemplateInputSetYaml as jest.Mock).mockImplementation(() => ({
      refetch: refetch1,
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
    }))
    const refetch2 = jest.fn()
    ;(useGetTemplate as jest.Mock).mockImplementation(() => ({
      data: stageTemplateVersion2,
      refetch: refetch2,
      error: null,
      loading: false
    }))

    const contextMock = produce(pipelineContextMock, draft => {
      draft.getStageFromPipeline = jest.fn().mockReturnValue({
        stage: {
          stage: {
            name: 'Stage 1',
            identifier: 'Stage_1',
            template: { templateRef: 'Test_Stage_Template', versionLabel: 'Version2' }
          }
        }
      })
    })

    const { container, getByRole } = render(
      <PipelineContext.Provider value={contextMock}>
        <TestWrapper
          path={routes.toPipelineStudio({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })}
          pathParams={{
            pipelineIdentifier: 'stage1',
            accountId: 'accountId',
            projectIdentifier: 'Milos2',
            orgIdentifier: 'CV',
            module: 'cd'
          }}
        >
          <TemplateStageSpecifications />
        </TestWrapper>
      </PipelineContext.Provider>
    )
    expect(container).toMatchSnapshot()
    const retryBtn = getByRole('button', { name: 'Retry' })
    await act(async () => {
      fireEvent.click(retryBtn)
    })
    expect(refetch1).toBeCalled()
    expect(refetch2).toBeCalled()
  })
})
