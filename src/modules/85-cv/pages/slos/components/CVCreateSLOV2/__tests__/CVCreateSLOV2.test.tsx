/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act } from 'react-dom/test-utils'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as cvServices from 'services/cv'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { userJourneyResponse } from '@cv/pages/slos/__tests__/CVSLOsListingPage.mock'
import CVCreateSLOV2 from '../CVCreateSLOV2'
import { SLODetailsData } from './CVCreateSLOV2.mock'

jest.mock('services/cv', () => ({
  useSaveSLOV2Data: jest.fn().mockImplementation(() => ({ data: {}, loading: false, error: null, refetch: jest.fn() })),
  useUpdateSLOV2Data: jest
    .fn()
    .mockImplementation(() => ({ data: {}, loading: false, error: null, refetch: jest.fn() })),
  useGetServiceLevelObjectiveV2: jest
    .fn()
    .mockImplementation(() => ({ data: {}, loading: false, error: null, refetch: jest.fn() })),
  useGetAllJourneys: jest
    .fn()
    .mockImplementation(() => ({ data: userJourneyResponse, loading: false, error: null, refetch: jest.fn() })),
  useSaveUserJourney: jest
    .fn()
    .mockImplementation(() => ({ data: {}, loading: false, error: null, refetch: jest.fn() })),
  useGetNotificationRulesForSLO: jest
    .fn()
    .mockImplementation(() => ({ data: {}, loading: false, error: null, refetch: jest.fn() })),
  useSaveNotificationRuleData: jest
    .fn()
    .mockImplementation(() => ({ data: {}, loading: false, error: null, refetch: jest.fn() })),
  useUpdateNotificationRuleData: jest
    .fn()
    .mockImplementation(() => ({ data: {}, loading: false, error: null, refetch: jest.fn() }))
}))

describe('CVCreateSloV2', () => {
  test('should render CVCreateSloV2 and show validations', async () => {
    const { container } = render(
      <TestWrapper>
        <CVCreateSLOV2 isComposite />
      </TestWrapper>
    )
    act(() => {
      userEvent.click(screen.getByText('next'))
    })
    await waitFor(() => expect(screen.getByText('cv.slos.validations.nameValidation')).toBeInTheDocument())
    await waitFor(() => expect(screen.getByText('cv.slos.validations.userJourneyRequired')).toBeInTheDocument())
    expect(
      container.querySelector('[data-testid="steptitle_Define_SLO_Identification"] [icon="error"]')
    ).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Set_SLO_Time_Window"] [icon="ring"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Add_SLOs"] [icon="ring"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Set_SLO_Target"] [icon="ring"]')).toBeInTheDocument()
    expect(container.querySelector('[data-testid="steptitle_Error_Budget_Policy"] [icon="ring"]')).toBeInTheDocument()

    // Save should validate all Steps
    act(() => {
      userEvent.click(screen.getByText('save'))
    })
    await waitFor(() => {
      expect(
        container.querySelector('[data-testid="steptitle_Set_SLO_Time_Window"] [icon="error"]')
      ).toBeInTheDocument()
      expect(container.querySelector('[data-testid="steptitle_Add_SLOs"] [icon="error"]')).toBeInTheDocument()
      expect(
        container.querySelector('[data-testid="steptitle_Set_SLO_Target"] [icon="tick-circle"]')
      ).toBeInTheDocument()
    })

    const sloName = container.querySelector('input[name ="name"]')
    await waitFor(() => expect(sloName).toBeInTheDocument())
    userEvent.type(sloName!, 'composite slo 1')
    // await waitFor(() => expect(screen.getByText('cv.slos.validations.nameValidation')).not.toBeInTheDocument())

    // Cancel should open modal
    act(() => {
      userEvent.click(screen.getByText('cancel'))
    })
    const modal = findDialogContainer()
    expect(modal).toBeTruthy()
    fireEvent.click(modal?.querySelector('button')!)
    fireEvent.click(modal?.querySelector('button')?.lastChild!)
  })

  test('Validate values populate while editing SLO', async () => {
    jest
      .spyOn(cvServices, 'useGetServiceLevelObjectiveV2')
      .mockImplementation(() => ({ data: SLODetailsData, loading: false, error: null, refetch: jest.fn() } as any))

    const { container, getByText } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'default', projectIdentifier: 'project1', identifier: 'new_slov2' }}>
        <CVCreateSLOV2 isComposite />
      </TestWrapper>
    )
    const sloName = container.querySelector('input[name ="name"]')
    await waitFor(() => expect(sloName).toHaveValue(SLODetailsData.resource.serviceLevelObjectiveV2.name))
    act(() => {
      userEvent.click(screen.getByText('next'))
    })
    await waitFor(() => expect(getByText(SLODetailsData.resource.serviceLevelObjectiveV2.name)).toBeInTheDocument())
    await waitFor(() =>
      expect(getByText(SLODetailsData.resource.serviceLevelObjectiveV2.userJourneyRefs.join(' '))).toBeInTheDocument()
    )
    await waitFor(() =>
      expect(container.querySelector('input[name="periodType"]')).toHaveValue(
        'cv.slos.sloTargetAndBudget.periodTypeOptions.rolling'
      )
    )
    await waitFor(() =>
      expect(container.querySelector('input[name="periodLength"]')).toHaveValue(
        SLODetailsData.resource.serviceLevelObjectiveV2.sloTarget.spec.periodLength.split('')[0]
      )
    )
    act(() => {
      userEvent.click(screen.getByText('next'))
    })
    await waitFor(() =>
      expect(getByText(SLODetailsData.resource.serviceLevelObjectiveV2.sloTarget.type)).toBeInTheDocument()
    )
    await waitFor(() =>
      expect(getByText(SLODetailsData.resource.serviceLevelObjectiveV2.sloTarget.spec.periodLength)).toBeInTheDocument()
    )
    act(() => {
      userEvent.click(screen.getByText('next'))
    })
    SLODetailsData.resource.serviceLevelObjectiveV2.spec.serviceLevelObjectivesDetails.forEach(async sloObjective => {
      await waitFor(() => expect(getByText(sloObjective.serviceLevelObjectiveRef)).toBeInTheDocument())
      await waitFor(() => expect(getByText(sloObjective.weightagePercentage.toString())).toBeInTheDocument())
    })
    //
    await waitFor(() =>
      expect(container.querySelector('input[name="SLOTargetPercentage"]')).toHaveValue(
        SLODetailsData.resource.serviceLevelObjectiveV2.sloTarget.sloTargetPercentage
      )
    )
    act(() => {
      userEvent.click(screen.getByText('next'))
    })
    await waitFor(() =>
      expect(
        getByText(SLODetailsData.resource.serviceLevelObjectiveV2.sloTarget.sloTargetPercentage.toString())
      ).toBeInTheDocument()
    )
  })
})
