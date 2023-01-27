/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { waitFor, fireEvent } from '@testing-library/dom'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ExecutionStatusEnum } from '@pipeline/utils/statusHelpers'
import * as cvService from 'services/cv'
import { RiskValues, getRiskColorValue } from '@cv/utils/CommonUtils'
import { ExecutionVerificationSummary } from '../ExecutionVerificationSummary'
import { SampleResponse } from './ExecutionVerificationSummary.mock'

describe('Unit tests for VerifyExection', () => {
  beforeEach(() => {
    Element.prototype.getBoundingClientRect = jest.fn(() => {
      return {
        width: 500,
        height: 1000,
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
      } as any
    })
  })
  afterEach(() => {
    jest.clearAllMocks()
  })
  afterAll(() => {
    jest.resetAllMocks()
  })
  test('Ensure content is rendered correctly based on api response', async () => {
    jest.spyOn(cvService, 'useGetVerificationOverviewForVerifyStepExecutionId').mockReturnValue({
      data: SampleResponse
    } as any)
    const { container, getByText } = render(
      <TestWrapper>
        <ExecutionVerificationSummary step={{}} />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('pipeline.verification.metricsInViolation')).not.toBeNull())

    const nodeHealths = container.querySelectorAll('[class~="nodeHealth"]')
    expect(nodeHealths.length).toBe(2)
    let redCount = 0,
      greenCount = 0,
      greyCount = 0,
      yellowCount = 0

    nodeHealths.forEach(item => {
      const colorVal = item.getAttribute('data-node-health-color')
      if (colorVal?.includes(getRiskColorValue(RiskValues.UNHEALTHY))) {
        redCount++
      } else if (colorVal?.includes(getRiskColorValue(RiskValues.HEALTHY))) {
        greenCount++
      } else if (colorVal?.includes(getRiskColorValue(RiskValues.NO_ANALYSIS))) {
        greyCount++
      } else if (colorVal?.includes(getRiskColorValue(RiskValues.OBSERVE))) {
        yellowCount++
      }
    })

    expect(greyCount).toBe(1)
    expect(redCount).toBe(0)
    expect(greenCount).toBe(1)
    expect(yellowCount).toBe(0)
  })

  test('Ensure that loading indicator is displayed when api is loading', async () => {
    const refetchFn = jest.fn()
    jest.spyOn(cvService, 'useGetVerificationOverviewForVerifyStepExecutionId').mockReturnValue({
      loading: true,
      refetch: refetchFn as unknown
    } as any)
    const { container } = render(
      <TestWrapper>
        <ExecutionVerificationSummary step={{ progressData: { activityId: '1234_id' as any } }} />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="loading"]')).not.toBeNull())
  })

  test('Ensure that error is displayed when api errors out', async () => {
    const refetchFn = jest.fn()
    jest.spyOn(cvService, 'useGetVerificationOverviewForVerifyStepExecutionId').mockReturnValue({
      error: { data: { message: 'mockError' } },
      refetch: refetchFn as unknown
    } as any)
    const { container, getByText } = render(
      <TestWrapper>
        <ExecutionVerificationSummary step={{ progressData: { activityId: 'asadasd_' as any } }} />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('mockError')).not.toBeNull())
    fireEvent.click(container.querySelector('button')!)
    await waitFor(() => expect(refetchFn).toHaveBeenCalledTimes(2))
  })

  test('Ensure that when activity id is not there empty statee is rendered', async () => {
    const refetchFn = jest.fn()
    jest.spyOn(cvService, 'useGetVerificationOverviewForVerifyStepExecutionId').mockReturnValue({
      refetch: refetchFn as unknown
    } as any)
    const { container } = render(
      <TestWrapper>
        <ExecutionVerificationSummary step={{}} />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="bp3-progress-meter"]')))
  })

  test('Ensure that when there is a failure message in the step, it is displayed', async () => {
    const refetchFn = jest.fn()
    jest.spyOn(cvService, 'useGetVerificationOverviewForVerifyStepExecutionId').mockReturnValue({
      refetch: refetchFn as unknown
    } as any)
    const { rerender, container, getByText } = render(
      <TestWrapper>
        <ExecutionVerificationSummary step={{ failureInfo: { message: 'mockError' } }} />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('mockError')))

    // ensure that message is not displayed
    rerender(
      <TestWrapper>
        <ExecutionVerificationSummary step={{}} />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="failureMessage"]')).toBeNull())
  })

  test('Ensure that manual intervention is displayed when the status is waiting', async () => {
    const refetchFn = jest.fn()
    jest.spyOn(cvService, 'useGetVerificationOverviewForVerifyStepExecutionId').mockReturnValue({
      refetch: refetchFn as unknown
    } as any)
    const { container } = render(
      <TestWrapper>
        <ExecutionVerificationSummary step={{ status: ExecutionStatusEnum.InterventionWaiting }} />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('[class*="manualInterventionTab"]')).not.toBeNull())
  })
})
