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
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { userJourneyResponse } from '@cv/pages/slos/__tests__/CVSLOsListingPage.mock'
import CVCreateSLOV2 from '../CVCreateSLOV2'

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
    expect(container).toMatchSnapshot()
  })
})
