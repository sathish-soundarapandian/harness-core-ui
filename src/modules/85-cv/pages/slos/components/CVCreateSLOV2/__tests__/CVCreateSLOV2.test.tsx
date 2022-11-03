/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act } from 'react-dom/test-utils'
import { findByText, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as cvServices from 'services/cv'
import routes from '@common/RouteDefinitions'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { userJourneyResponse } from '@cv/pages/slos/__tests__/CVSLOsListingPage.mock'
import CVCreateSLOV2 from '../CVCreateSLOV2'
import { calendarMonthly, calendarWeekly, calendarQuarterly, SLODetailsData } from './CVCreateSLOV2.mock'
import { getSLOTarget } from '../CVCreateSLOV2.utils'

jest.useFakeTimers()

const testPath = routes.toCVSLODetailsPage({
  identifier: ':identifier',
  accountId: ':accountId',
  orgIdentifier: ':orgIdentifier',
  projectIdentifier: ':projectIdentifier'
})
const testPathParams = {
  orgIdentifier: 'cvng',
  accountId: 'default',
  projectIdentifier: 'project1',
  identifier: 'new_slov2'
}

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
  test('CVCreateSLOV2 when isComposite is false', async () => {
    const { container } = render(
      <TestWrapper>
        <CVCreateSLOV2 isComposite={false} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('Cancel without adding any values', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <CVCreateSLOV2 isComposite />
      </TestWrapper>
    )
    act(() => {
      userEvent.click(getByText('save'))
    })
    expect(container.querySelector('[data-testid="steptitle_Error_Budget_Policy"]')).toBeInTheDocument()
    act(() => {
      userEvent.click(container.querySelector('[data-testid="steptitle_Error_Budget_Policy"]')!)
    })
    act(() => {
      userEvent.click(getByText('cancel'))
    })
    expect(container).toMatchSnapshot()
  })
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
    userEvent.type(sloName!, '* invalid')
    await waitFor(() => expect(screen.getByText('cv.slos.validations.specialCharacters')).toBeInTheDocument())
    userEvent.clear(sloName!)
    userEvent.type(sloName!, 'composite slo 1')

    // Cancel should open modal
    act(() => {
      userEvent.click(screen.getByText('cancel'))
    })
    const modal = findDialogContainer()
    expect(modal).toBeTruthy()
    fireEvent.click(await findByText(modal!, 'cancel'))

    act(() => {
      userEvent.click(screen.getByText('cancel'))
    })
    fireEvent.click(await findByText(modal!, 'common.ok'))
  })

  test('Validate values populate while editing Rolling type composite SLO', async () => {
    jest
      .spyOn(cvServices, 'useGetServiceLevelObjectiveV2')
      .mockImplementation(() => ({ data: SLODetailsData, loading: false, error: null, refetch: jest.fn() } as any))

    const { container, getByText } = render(
      <TestWrapper path={testPath} pathParams={testPathParams}>
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
    })
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

  test('Should render all tabs preview', async () => {
    jest
      .spyOn(cvServices, 'useGetServiceLevelObjectiveV2')
      .mockImplementation(() => ({ data: SLODetailsData, loading: false, error: null, refetch: jest.fn() } as any))

    render(
      <TestWrapper pathParams={{ orgIdentifier: 'default', projectIdentifier: 'project1', identifier: 'new_slov2' }}>
        <CVCreateSLOV2 isComposite />
      </TestWrapper>
    )

    act(() => {
      userEvent.click(screen.getByText('next'))
    })
    expect(screen.getByText('new slov2')).toBeInTheDocument()
    expect(screen.getByText('Second_Journey')).toBeInTheDocument()

    act(() => {
      userEvent.click(screen.getByText('next'))
    })
    expect(screen.getByText('Rolling')).toBeInTheDocument()
    act(() => {
      userEvent.click(screen.getByText('next'))
    })
    expect(screen.getByText('hHJYxnUFTCypZdmYr0Q0tQ')).toBeInTheDocument()
    expect(screen.getByText('7b-_GIZxRu6VjFqAqqdVDQ')).toBeInTheDocument()

    act(() => {
      userEvent.click(screen.getByText('next'))
    })
    expect(screen.getByText('87')).toBeInTheDocument()
  })

  test('Should render period update warning modals', async () => {
    jest
      .spyOn(cvServices, 'useGetServiceLevelObjectiveV2')
      .mockImplementation(() => ({ data: SLODetailsData, loading: false, error: null, refetch: jest.fn() } as any))

    const { container } = render(
      <TestWrapper pathParams={{ orgIdentifier: 'default', projectIdentifier: 'project1', identifier: 'new_slov2' }}>
        <CVCreateSLOV2 isComposite />
      </TestWrapper>
    )

    act(() => {
      userEvent.click(screen.getByText('next'))
    })

    act(() => {
      userEvent.click(screen.getByText('next'))
    })

    act(() => {
      userEvent.click(screen.getByText('back'))
    })

    const periodTypeDropDown = container.querySelectorAll('[icon="chevron-down"]')[0]
    act(() => {
      userEvent.click(periodTypeDropDown!)
    })

    await waitFor(() => {
      expect(document.querySelector('ul.bp3-menu')).toBeTruthy()
    })

    expect(document.querySelectorAll('ul.bp3-menu li')[1]?.textContent).toEqual(
      'cv.slos.sloTargetAndBudget.periodTypeOptions.calendar'
    )
    expect(document.querySelectorAll('ul.bp3-menu li')[0]?.textContent).toEqual(
      'cv.slos.sloTargetAndBudget.periodTypeOptions.rolling'
    )

    act(() => {
      userEvent.click(document.querySelectorAll('ul.bp3-menu li')[1]!)
    })

    expect(container.querySelector('[name="periodType"]')).toHaveValue(
      'cv.slos.sloTargetAndBudget.periodTypeOptions.calendar'
    )

    const modal = findDialogContainer()
    const cancelButton = await findByText(modal!, 'cancel')

    act(() => {
      userEvent.click(cancelButton)
    })

    expect(container.querySelector('[name="periodType"]')).toHaveValue(
      'cv.slos.sloTargetAndBudget.periodTypeOptions.rolling'
    )

    // click again
    act(() => {
      userEvent.click(periodTypeDropDown!)
    })

    await waitFor(() => {
      expect(document.querySelector('ul.bp3-menu')).toBeTruthy()
    })

    expect(document.querySelectorAll('ul.bp3-menu li')[1]?.textContent).toEqual(
      'cv.slos.sloTargetAndBudget.periodTypeOptions.calendar'
    )
    expect(document.querySelectorAll('ul.bp3-menu li')[0]?.textContent).toEqual(
      'cv.slos.sloTargetAndBudget.periodTypeOptions.rolling'
    )

    await act(() => {
      userEvent.click(document.querySelectorAll('ul.bp3-menu li')[1]!)
    })

    const okButton = await findByText(findDialogContainer()!, 'common.ok')

    await act(() => {
      userEvent.click(okButton)
    })

    expect(container.querySelector('[name="periodType"]')).toHaveValue(
      'cv.slos.sloTargetAndBudget.periodTypeOptions.calendar'
    )
  })

  test('Should update and save composite SLO by updating SLO Target', async () => {
    const updateSLO = jest.fn()
    updateSLO.mockReturnValueOnce({ data: SLODetailsData })
    jest
      .spyOn(cvServices, 'useGetServiceLevelObjectiveV2')
      .mockImplementation(() => ({ data: SLODetailsData, loading: false, error: null, refetch: jest.fn() } as any))
    jest.spyOn(cvServices, 'useUpdateSLOV2Data').mockReturnValue({ data: SLODetailsData, mutate: updateSLO } as any)

    const { container } = render(
      <TestWrapper path={testPath} pathParams={testPathParams}>
        <CVCreateSLOV2 isComposite />
      </TestWrapper>
    )

    const sloName = container.querySelector('input[name ="name"]')
    await waitFor(() => expect(sloName).toBeInTheDocument())
    userEvent.clear(sloName!)
    userEvent.type(sloName!, 'updated composite slo')

    act(() => {
      userEvent.click(container.querySelector('[data-testid="steptitle_Set_SLO_Target"]')!)
    })

    fireEvent.change(container.querySelector('[name="SLOTargetPercentage"]')!, { target: { value: 99 } })

    await act(() => {
      userEvent.click(screen.getByText('save'))
    })

    await waitFor(() => expect(document.querySelector('.bp3-dialog')).toBeInTheDocument())

    act(() => {
      userEvent.click(document.querySelector('.bp3-dialog button')!)
    })
  })

  test('Should be able to canel with unsaved changes', async () => {
    const updateSLO = jest.fn()
    updateSLO.mockReturnValueOnce({ data: SLODetailsData })
    jest
      .spyOn(cvServices, 'useGetServiceLevelObjectiveV2')
      .mockImplementation(() => ({ data: SLODetailsData, loading: false, error: null, refetch: jest.fn() } as any))
    jest.spyOn(cvServices, 'useUpdateSLOV2Data').mockReturnValue({ data: SLODetailsData, mutate: updateSLO } as any)

    const { container } = render(
      <TestWrapper path={testPath} pathParams={testPathParams}>
        <CVCreateSLOV2 isComposite />
      </TestWrapper>
    )

    const sloName = container.querySelector('input[name ="name"]')
    await waitFor(() => expect(sloName).toBeInTheDocument())
    userEvent.clear(sloName!)
    userEvent.type(sloName!, 'updated composite slo')

    act(() => {
      userEvent.click(container.querySelector('[data-testid="steptitle_Set_SLO_Target"]')!)
    })

    fireEvent.change(container.querySelector('[name="SLOTargetPercentage"]')!, { target: { value: 99 } })

    await act(() => {
      userEvent.click(screen.getByText('cancel'))
    })

    await waitFor(() => expect(document.querySelector('.bp3-dialog')).toBeInTheDocument())

    act(() => {
      userEvent.click(document.querySelector('.bp3-dialog button')!)
    })
  })

  test('Should update and save composite SLO by updating SLO name', async () => {
    const updateSLO = jest.fn()
    updateSLO.mockReturnValueOnce({ data: SLODetailsData })
    jest
      .spyOn(cvServices, 'useGetServiceLevelObjectiveV2')
      .mockImplementation(() => ({ data: SLODetailsData, loading: false, error: null, refetch: jest.fn() } as any))
    jest.spyOn(cvServices, 'useUpdateSLOV2Data').mockReturnValue({ data: SLODetailsData, mutate: updateSLO } as any)

    const { container } = render(
      <TestWrapper path={testPath} pathParams={testPathParams}>
        <CVCreateSLOV2 isComposite />
      </TestWrapper>
    )

    const sloName = container.querySelector('input[name ="name"]')
    await waitFor(() => expect(sloName).toBeInTheDocument())
    userEvent.clear(sloName!)
    userEvent.type(sloName!, 'updated composite slo')

    await act(() => {
      userEvent.click(screen.getByText('save'))
    })

    await waitFor(() => expect(screen.getByText('cv.slos.sloUpdated')).toBeInTheDocument())
  })

  test('Should save composite slo of calendar weekly type', async () => {
    const calendarTypeSLO = {
      ...SLODetailsData
    }
    calendarTypeSLO.resource.serviceLevelObjectiveV2.sloTarget = { ...calendarWeekly } as any
    const updateSLO = jest.fn()
    updateSLO.mockReturnValueOnce({ data: calendarTypeSLO })
    jest
      .spyOn(cvServices, 'useGetServiceLevelObjectiveV2')
      .mockImplementation(() => ({ data: calendarTypeSLO, loading: false, error: null, refetch: jest.fn() } as any))
    jest.spyOn(cvServices, 'useUpdateSLOV2Data').mockReturnValue({ data: calendarTypeSLO, mutate: updateSLO } as any)

    const { container } = render(
      <TestWrapper path={testPath} pathParams={testPathParams}>
        <CVCreateSLOV2 isComposite />
      </TestWrapper>
    )

    const sloName = container.querySelector('input[name ="name"]')
    await waitFor(() => expect(sloName).toBeInTheDocument())
    userEvent.clear(sloName!)
    userEvent.type(sloName!, 'updated composite slo')

    expect(container.querySelector('[data-testid="steptitle_Error_Budget_Policy"]')).toBeInTheDocument()
    act(() => {
      userEvent.click(container.querySelector('[data-testid="steptitle_Error_Budget_Policy"]')!)
    })

    await act(() => {
      userEvent.click(screen.getByText('save'))
    })
  })

  test('Should save composite slo of calendar monthly type', async () => {
    const calendarTypeSLO = {
      ...SLODetailsData
    }
    calendarTypeSLO.resource.serviceLevelObjectiveV2.sloTarget = { ...calendarMonthly } as any
    const updateSLO = jest.fn()
    updateSLO.mockReturnValueOnce({ data: calendarTypeSLO })
    jest
      .spyOn(cvServices, 'useGetServiceLevelObjectiveV2')
      .mockImplementation(() => ({ data: calendarTypeSLO, loading: false, error: null, refetch: jest.fn() } as any))
    jest.spyOn(cvServices, 'useUpdateSLOV2Data').mockReturnValue({ data: calendarTypeSLO, mutate: updateSLO } as any)

    const { container } = render(
      <TestWrapper path={testPath} pathParams={testPathParams}>
        <CVCreateSLOV2 isComposite />
      </TestWrapper>
    )

    const sloName = container.querySelector('input[name ="name"]')
    await waitFor(() => expect(sloName).toBeInTheDocument())
    userEvent.clear(sloName!)
    userEvent.type(sloName!, 'updated composite slo')

    expect(container.querySelector('[data-testid="steptitle_Error_Budget_Policy"]')).toBeInTheDocument()
    act(() => {
      userEvent.click(container.querySelector('[data-testid="steptitle_Error_Budget_Policy"]')!)
    })

    await act(() => {
      userEvent.click(screen.getByText('save'))
    })
  })

  test('Should save composite slo of calendar quarterly type', async () => {
    const calendarTypeSLO = {
      ...SLODetailsData
    }
    calendarTypeSLO.resource.serviceLevelObjectiveV2.sloTarget = { ...calendarQuarterly } as any
    const updateSLO = jest.fn()
    updateSLO.mockReturnValueOnce({ data: calendarTypeSLO })
    jest
      .spyOn(cvServices, 'useGetServiceLevelObjectiveV2')
      .mockImplementation(() => ({ data: calendarTypeSLO, loading: false, error: null, refetch: jest.fn() } as any))
    jest.spyOn(cvServices, 'useUpdateSLOV2Data').mockReturnValue({ data: calendarTypeSLO, mutate: updateSLO } as any)

    const { container } = render(
      <TestWrapper path={testPath} pathParams={testPathParams}>
        <CVCreateSLOV2 isComposite />
      </TestWrapper>
    )

    const sloName = container.querySelector('input[name ="name"]')
    await waitFor(() => expect(sloName).toBeInTheDocument())
    userEvent.clear(sloName!)
    userEvent.type(sloName!, 'updated composite slo')

    expect(container.querySelector('[data-testid="steptitle_Error_Budget_Policy"]')).toBeInTheDocument()
    act(() => {
      userEvent.click(container.querySelector('[data-testid="steptitle_Error_Budget_Policy"]')!)
    })

    await act(() => {
      userEvent.click(screen.getByText('save'))
    })
  })

  test('should save new composite slo', async () => {
    const createSLO = jest.fn()
    jest
      .spyOn(cvServices, 'useGetServiceLevelObjectiveV2')
      .mockImplementation(() => ({ data: SLODetailsData, loading: false, error: null, refetch: jest.fn() } as any))
    jest.spyOn(cvServices, 'useSaveSLOV2Data').mockReturnValue({ data: SLODetailsData, mutate: createSLO } as any)
    render(
      <TestWrapper>
        <CVCreateSLOV2 isComposite />
      </TestWrapper>
    )
    act(() => {
      userEvent.click(screen.getByText('next'))
    })
    await waitFor(() => expect(screen.getByText('new slov2')).toBeInTheDocument())
    act(() => {
      userEvent.click(screen.getByText('save'))
    })
    await waitFor(() => expect(screen.getByText('cv.slos.sloCreated')).toBeInTheDocument())
  })

  test('should be able to update SLO weights', async () => {
    const createSLO = jest.fn()
    jest
      .spyOn(cvServices, 'useGetServiceLevelObjectiveV2')
      .mockImplementation(() => ({ data: SLODetailsData, loading: false, error: null, refetch: jest.fn() } as any))
    jest.spyOn(cvServices, 'useSaveSLOV2Data').mockReturnValue({ data: SLODetailsData, mutate: createSLO } as any)
    const { container } = render(
      <TestWrapper path={testPath} pathParams={testPathParams}>
        <CVCreateSLOV2 isComposite />
      </TestWrapper>
    )
    act(() => {
      userEvent.click(container.querySelector('[data-testid="steptitle_Add_SLOs"]')!)
    })
    const firstWeight = container.querySelector('[name="weightagePercentage"]')
    act(() => {
      userEvent.clear(firstWeight!)
      userEvent.type(firstWeight!, '55')
    })
    act(() => {
      userEvent.click(screen.getByText('next'))
    })
    expect(screen.getByText('45')).toBeInTheDocument()
    act(() => {
      userEvent.clear(firstWeight!)
      userEvent.type(firstWeight!, '101')
    })
  })

  test('should open in loading state', async () => {
    jest
      .spyOn(cvServices, 'useGetServiceLevelObjectiveV2')
      .mockImplementation(() => ({ data: {}, loading: true, error: null, refetch: jest.fn() } as any))
    const { container } = render(
      <TestWrapper>
        <CVCreateSLOV2 isComposite />
      </TestWrapper>
    )
    expect(container.querySelector('[data-icon="steps-spinner"]')).toBeInTheDocument()
  })

  test('should open in error state', async () => {
    jest.spyOn(cvServices, 'useGetServiceLevelObjectiveV2').mockImplementation(
      () =>
        ({
          data: {},
          loading: false,
          error: {
            data: {
              responseMessages: ['error']
            }
          },
          refetch: jest.fn()
        } as any)
    )
    const { container } = render(
      <TestWrapper>
        <CVCreateSLOV2 isComposite />
      </TestWrapper>
    )
    expect(container.querySelector('[data-icon="error"]')).toBeInTheDocument()
  })

  test('should validate getSLOTarget with empty periodType', () => {
    expect(getSLOTarget({} as any)).toEqual({})
    expect(getSLOTarget({ periodType: 'Calender' } as any)).toEqual({})
  })
})
