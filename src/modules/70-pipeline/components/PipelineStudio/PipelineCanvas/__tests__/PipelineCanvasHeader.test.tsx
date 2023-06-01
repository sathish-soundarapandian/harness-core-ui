/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import * as pipelineRQService from 'services/pipeline-rq'
import { PipelineCanvasHeader } from '../PipelineCanvasHeader'
import { PipelineContext } from '../../PipelineContext/PipelineContext'
import { getDummyPipelineCanvasContextValue } from './PipelineCanvasTestHelper'

jest.mock('services/pipeline-rq', () => ({
  __esModule: true,
  ...jest.requireActual('services/pipeline-rq')
}))

describe('', () => {
  test('renders pipeline out of sync error strip', async () => {
    jest.spyOn(pipelineRQService, 'useValidateTemplateInputsQuery').mockImplementation(() => {
      return {
        data: {
          status: 'SUCCESS',
          data: {
            type: 'TemplateInputsErrorMetadataV2',
            validYaml: false,
            errorNodeSummary: {
              nodeInfo: {
                identifier: 'pip_name',
                name: 'pip name'
              },
              childrenErrorNodes: []
            }
          },
          correlationId: 'correlationId'
        },
        error: null,
        isFetching: false,
        refetch: jest.fn()
      } as any
    })

    const testWrapperProps: TestWrapperProps = {
      path: routes.toPipelineStudio({
        pipelineIdentifier: ':pipelineIdentifier',
        orgIdentifier: ':orgIdentifier',
        accountId: ':accountId',
        projectIdentifier: ':projectIdentifier'
      }),
      pathParams: {
        pipelineIdentifier: 'TEST_PIPELINE',
        orgIdentifier: 'TEST_ORG',
        accountId: 'TEST_ACCOUNT',
        projectIdentifier: 'TEST_PROJECT'
      }
    }
    const contextValue = getDummyPipelineCanvasContextValue({ isLoading: false })

    render(
      <TestWrapper {...testWrapperProps}>
        <PipelineContext.Provider value={contextValue}>
          <PipelineCanvasHeader
            disableVisualView={false}
            isGitSyncEnabled={false}
            isPipelineRemote={true}
            onGitBranchChange={jest.fn()}
            openRunPipelineModal={jest.fn()}
            setModalMode={jest.fn()}
            setYamlError={jest.fn()}
            showModal={jest.fn()}
            toPipelineStudio={jest.fn()}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    userEvent.click(screen.getByLabelText('pipeline menu actions'))
    userEvent.click(screen.getByText('pipeline.outOfSyncErrorStrip.reconcile'))

    expect(await screen.findByText('pipeline.outOfSyncErrorStrip.updatedTemplateInfo')).toBeInTheDocument()
  })
})
