/* eslint-disable jest/no-disabled-tests */
/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor, screen } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'

import { BambooArtifact } from '../BambooArtifact'
import { bambooProps, bambooSideCarProps, getInitialValues } from './helper'
import { mockArtifactPathsResponse, mockPlansResponse, mockBuildsResponse } from './mock'

jest.mock('services/cd-ng', () => ({
  useGetPlansKey: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ...mockPlansResponse
      })
    }),
    refetch: jest.fn(),
    error: null
  })),
  useGetArtifactPathsForBamboo: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ...mockArtifactPathsResponse
      })
    }),
    refetch: jest.fn(),
    error: null
  })),

  useGetBuildsForBamboo: jest.fn().mockImplementation(() => ({
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      return Promise.resolve({
        ...mockBuildsResponse
      })
    }),
    refetch: jest.fn(),
    error: null
  }))
}))

describe('bamboo submit flow', () => {
  test('should throw validation errors, when form is empty and clicked on submit', async () => {
    const { container } = render(
      <TestWrapper>
        <BambooArtifact initialValues={getInitialValues()} {...bambooProps} />
      </TestWrapper>
    )
    const submitBtn = container.querySelector('button[type="submit"]')!
    fireEvent.click(submitBtn)
    await waitFor(() => {
      expect(bambooProps.handleSubmit).not.toBeCalled()
      expect(screen.queryByText('common.validation.nameIsRequired')).toBeInTheDocument()
      expect(screen.queryByText('pipeline.bambooStep.validations.planName')).toBeInTheDocument()
    })
  })

  test('render and throw validations for sidecar', async () => {
    const { container } = render(
      <TestWrapper>
        <BambooArtifact initialValues={getInitialValues()} {...bambooSideCarProps} />
      </TestWrapper>
    )
    const submitBtn = container.querySelector('button[type="submit"]')!
    fireEvent.click(submitBtn)
    await waitFor(() => {
      expect(bambooProps.handleSubmit).not.toBeCalled()

      expect(screen.queryByText('common.validation.nameIsRequired')).toBeInTheDocument()
      expect(screen.queryByText('pipeline.bambooStep.validations.planName')).toBeInTheDocument()
    })
  })
})
