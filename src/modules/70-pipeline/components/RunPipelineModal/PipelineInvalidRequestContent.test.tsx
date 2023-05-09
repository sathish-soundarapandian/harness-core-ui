/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { noop } from 'lodash-es'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import { PipelineInvalidRequestContent } from './PipelineInvalidRequestContent'

const piplelineInvalidRequestProps: any = {
  onClose: jest.fn(() => noop),
  getTemplateError: {
    data: {
      status: 'ERROR',
      code: 'INVALID_REQUEST',
      message:
        "Invalid request: All the stages asked to be executed either don't exist or they have been deleted from the pipeline"
    },
    message: 'Failed to fetch: 400 Bad Request',
    status: 400
  } as any
}

const pipelineRunFailedProps: any = {
  onClose: jest.fn(() => noop),
  getTemplateError: {
    data: {
      status: 'ERROR',
      code: 'HINT',
      message:
        'Please check the requested file path [.harness/testInpSet.yaml] / branch [dummy-master] / Github repo name [dummy-repo] if they exist or not.'
    },
    message: 'Failed to fetch: 400 Bad Request',
    status: 400
  } as any
}

describe('<PipelineInvalidRequestContent /> tests', () => {
  test('snapshot test and element assertion', async () => {
    const errorMessage = piplelineInvalidRequestProps.getTemplateError.data.message.split(':')
    const { container, getByText, getByTestId } = render(
      <TestWrapper>
        <PipelineInvalidRequestContent {...piplelineInvalidRequestProps} />
      </TestWrapper>
    )
    const closeButton = getByTestId('deletion-pipeline')
    expect(container).toMatchSnapshot()
    expect(closeButton).toBeTruthy()
    expect(document.querySelector('[icon="warning-sign"]')).toBeInTheDocument()
    expect(getByText(errorMessage[0])).toBeDefined()
    expect(getByText(errorMessage[1].trim())).toBeDefined()
    await act(async () => {
      fireEvent.click(closeButton)
      await waitFor(() => expect(piplelineInvalidRequestProps.onClose).toBeCalledTimes(1))
    })
  })

  test('show valid title message when inline pipeline run fails', async () => {
    const { container, findByText } = render(
      <TestWrapper>
        <PipelineInvalidRequestContent {...pipelineRunFailedProps} />
      </TestWrapper>
    )
    const errorMessageTitle = await findByText('pipeline.pipelineRunFailed')
    expect(container).toMatchSnapshot()
    expect(errorMessageTitle).toBeInTheDocument()
  })

  test('show valid title message when remote pipeline run fails', async () => {
    const { container, findByText } = render(
      <TestWrapper>
        <PipelineInvalidRequestContent {...pipelineRunFailedProps} branch="dummy-master" repoName="dummy-repo" />
      </TestWrapper>
    )
    const errorMessageTitle = await findByText('pipeline.pipelineRunFailedForRepoBranch')
    expect(container).toMatchSnapshot()
    expect(errorMessageTitle).toBeInTheDocument()
  })
})
