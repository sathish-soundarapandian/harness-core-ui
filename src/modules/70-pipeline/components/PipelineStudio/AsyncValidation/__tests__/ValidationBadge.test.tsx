/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, RenderResult, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as pipelineServices from 'services/pipeline-ng'
import mockImport from 'framework/utils/mockImport'
import { ValidationBadge } from '../ValidationBadge'
import * as pipelineContext from '../../PipelineContext/PipelineContext'
import {
  successValidationResult,
  errorValidationResult,
  failureValidationResult,
  inProgressValidationResult
} from './mock'

mockImport('@governance/EvaluationView', {
  EvaluationView: () => <p>Evaluation View</p>
})

const renderValidationBadge = (): RenderResult => {
  return render(
    <TestWrapper>
      <ValidationBadge />
    </TestWrapper>
  )
}

describe('ValidationBadge', () => {
  test('renders relevant data when status is "SUCCESS"', async () => {
    jest.spyOn(pipelineServices, 'useGetPipelineValidateResult').mockReturnValue({
      data: successValidationResult,
      loading: false,
      error: null,
      absolutePath: '',
      cancel: jest.fn(),
      refetch: jest.fn(),
      response: null
    })
    const validatePipeline = jest.fn(() => Promise.resolve({ data: { uuid: 'uuid' } }))
    jest.spyOn(pipelineServices, 'useValidatePipelineAsync').mockReturnValue({
      mutate: validatePipeline,
      loading: false,
      cancel: jest.fn(),
      error: null
    })

    renderValidationBadge()

    const validationBadge = await screen.findByTestId('validation-badge')
    expect(validationBadge).toBeInTheDocument()
    expect(screen.getByText('pipeline.validation.validated')).toBeInTheDocument()
    expect(screen.getByText('dummy date')).toBeInTheDocument()

    fireEvent.mouseOver(validationBadge)

    expect(await screen.findByText('pipeline.validation.validationSuccessful')).toBeInTheDocument()

    userEvent.click(validationBadge)

    expect(await screen.findByText('pipeline.validation.pipelineValidated')).toBeInTheDocument()
    expect(screen.getByText('Evaluation View')).toBeInTheDocument()

    const revalidateButton = screen.getByText('pipeline.validation.revalidate')
    userEvent.click(revalidateButton)

    expect(validatePipeline).toBeCalled()
    await waitFor(() => {
      expect(screen.queryByText('pipeline.validation.pipelineValidated')).not.toBeInTheDocument()
    })
  })

  test('renders relevant data when status is "ERROR"', async () => {
    jest.spyOn(pipelineServices, 'useGetPipelineValidateResult').mockReturnValue({
      data: null,
      loading: false,
      error: errorValidationResult,
      absolutePath: '',
      cancel: jest.fn(),
      refetch: jest.fn(),
      response: null
    })

    const { baseElement } = renderValidationBadge()
    const validationBadge = await screen.findByTestId('validation-badge')

    expect(validationBadge).toBeInTheDocument()
    expect(baseElement.querySelector('[data-icon="warning-sign"]')).toBeInTheDocument()
    expect(screen.queryByText('dummy date')).not.toBeInTheDocument()

    fireEvent.mouseOver(validationBadge)

    expect(await screen.findByText('pipeline.validation.nIssuesFound')).toBeInTheDocument()

    userEvent.click(validationBadge)

    expect(await screen.findByText('pipeline.validation.validationResultApiError')).toBeInTheDocument()
    expect(await screen.findByText('retry')).toBeInTheDocument()
  })

  test('renders relevant data when status is "FAILURE"', async () => {
    jest.spyOn(pipelineServices, 'useGetPipelineValidateResult').mockReturnValue({
      data: failureValidationResult,
      loading: false,
      error: null,
      absolutePath: '',
      cancel: jest.fn(),
      refetch: jest.fn(),
      response: null
    })
    const validatePipeline = jest.fn(() => Promise.reject({ data: { message: 'something went wrong' } }))
    jest.spyOn(pipelineServices, 'useValidatePipelineAsync').mockReturnValue({
      mutate: validatePipeline,
      loading: false,
      cancel: jest.fn(),
      error: null
    })

    const { baseElement } = renderValidationBadge()
    const validationBadge = await screen.findByTestId('validation-badge')

    expect(validationBadge).toBeInTheDocument()
    expect(baseElement.querySelector('[data-icon="warning-sign"]')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument() // error count
    expect(screen.getByText('dummy date')).toBeInTheDocument()

    userEvent.click(validationBadge)

    expect(await screen.findByText('common.policiesSets.evaluations')).toBeInTheDocument()
    expect(screen.getByText('Evaluation View')).toBeInTheDocument()

    const revalidateButton = screen.getByText('pipeline.validation.revalidate')
    userEvent.click(revalidateButton)

    expect(validatePipeline).toBeCalled()
    await waitFor(() => {
      expect(screen.getByText('something went wrong')).toBeInTheDocument()
    })
  })

  test('renders relevant data when loading', async () => {
    jest.spyOn(pipelineServices, 'useGetPipelineValidateResult').mockReturnValue({
      data: null,
      loading: true,
      error: null,
      absolutePath: '',
      cancel: jest.fn(),
      refetch: jest.fn(),
      response: null
    })

    const { baseElement } = renderValidationBadge()
    const validationBadge = await screen.findByTestId('validation-badge')

    expect(validationBadge).toBeInTheDocument()
    expect(baseElement.querySelector('[data-icon="steps-spinner"]')).toBeInTheDocument()
    expect(screen.queryByText('dummy date')).not.toBeInTheDocument()
  })

  test('should poll API if status is "IN_PROGRESS"', async () => {
    jest.spyOn(pipelineContext, 'usePipelineContext').mockReturnValue({
      state: {
        validationUuid: 'foo'
      }
    } as pipelineContext.PipelineContextInterface)
    jest.useFakeTimers()

    const refetch = jest.fn()
    const useGetPipelineValidateResult = jest.fn(() => ({
      data: inProgressValidationResult,
      loading: false,
      error: null,
      absolutePath: '',
      cancel: jest.fn(),
      refetch,
      response: null
    }))

    jest.spyOn(pipelineServices, 'useGetPipelineValidateResult').mockImplementation(useGetPipelineValidateResult)

    const { baseElement } = renderValidationBadge()

    expect(useGetPipelineValidateResult).toHaveBeenCalled()
    expect(baseElement.querySelector('[data-icon="steps-spinner"]')).toBeInTheDocument()

    jest.advanceTimersByTime(5_000)

    await waitFor(() => expect(refetch).toHaveBeenCalledTimes(1))
  })
})
