/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { omit } from 'lodash-es'
import { act } from 'react-dom/test-utils'
import { findByText, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as cvServices from 'services/cv'
import routes from '@common/RouteDefinitions'
import { findDialogContainer, TestWrapper } from '@common/utils/testUtils'
import { userJourneyResponse } from '@cv/pages/slos/__tests__/CVSLOsListingPage.mock'
import CVCreateSLOV2 from '../CVCreateSLOV2'
import {
  calendarMonthly,
  calendarWeekly,
  calendarQuarterly,
  SLODetailsData,
  simpleSLOData,
  metricListResponse,
  healthSourceListResponse,
  monitoredServicelist,
  notificationMock,
  initialData,
  serviceLevelObjectiveV2,
  editFormData,
  ratioBasedSLO
} from './CVCreateSLOV2.mock'
import {
  createOptionalConfigPayload,
  getServiceLevelIndicatorsIdentifier,
  getServiceLevelIndicatorsIdentifierFromResponse,
  getSimpleSLOCustomValidation,
  getSLOTarget,
  getSLOV2InitialFormData
} from '../CVCreateSLOV2.utils'
import { SLOType } from '../CVCreateSLOV2.constants'
import { SLOV2FormMock } from '../components/CreateSimpleSloForm/__tests__/CreateSimpleSloForm.utils.mock'
import type { SLOV2Form } from '../CVCreateSLOV2.types'

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

jest.mock('@cv/hooks/IndexedDBHook/IndexedDBHook', () => ({
  useIndexedDBHook: jest.fn().mockReturnValue({
    isInitializingDB: false,
    dbInstance: {
      put: jest.fn(),
      get: jest.fn().mockReturnValue(undefined)
    }
  }),
  CVObjectStoreNames: {}
}))

jest.mock('@connectors/components/ConnectorReferenceField/FormConnectorReferenceField', () => ({
  FormConnectorReferenceField: function MockComp(props: any) {
    return (
      <div>
        <button className="updateValue" onClick={() => props.formik.setFieldValue('spec', { connectorRef: 'kube' })} />
      </div>
    )
  }
}))

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => {
    return { data: [], refetch: jest.fn(), error: null, loading: false }
  })
}))

jest.mock('services/cv', () => ({
  useGetSloMetrics: jest.fn().mockImplementation(() => ({ refetch: jest.fn(), data: metricListResponse })),
  useCreateDefaultMonitoredService: jest.fn().mockImplementation(() => ({
    error: null,
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      return {
        metaData: {},
        resource: {},
        responseMessages: []
      }
    })
  })),
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
    .mockImplementation(() => ({ data: {}, loading: false, error: null, refetch: jest.fn() })),
  useGetNotificationRuleData: jest.fn().mockImplementation(() => ({
    data: notificationMock, //{ data: { ...notificationMock.data } },
    loading: false,
    error: null,
    refetch: jest.fn()
  })),
  useGetAllMonitoredServicesWithTimeSeriesHealthSources: jest
    .fn()
    .mockImplementation(() => ({ loading: false, data: monitoredServicelist, error: null, refetch: jest.fn() })),
  useGetSliGraph: jest.fn().mockImplementation(() => ({ loading: false, data: {}, error: null })),
  useGetMonitoredService: jest
    .fn()
    .mockImplementation(() => ({ loading: false, error: null, data: healthSourceListResponse, refetch: jest.fn() }))
}))

jest.mock('@cv/pages/health-source/HealthSourceDrawer/component/defineHealthSource/useValidConnector', () => ({
  useValidConnector: jest.fn().mockReturnValue({
    isConnectorEnabled: true
  })
}))

describe('CVCreateSloV2', () => {
  beforeEach(() => {
    jest.setTimeout(30000)
  })

  test('CVCreateSLOV2 when isComposite is false', async () => {
    jest
      .spyOn(cvServices, 'useGetAllMonitoredServicesWithTimeSeriesHealthSources')
      .mockImplementation(() => ({ data: null, loading: true, error: null, refetch: jest.fn() } as any))
    const { container, getByText } = render(
      <TestWrapper
        path="/account/:accountId/cv/dashboard/orgs/:orgIdentifier/projects/:projectIdentifier/slos"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <CVCreateSLOV2 />
      </TestWrapper>
    )
    act(() => {
      userEvent.click(getByText('next'))
    })
    await waitFor(() => expect(screen.getAllByText('cv.slos.validations.nameValidation').length).toEqual(2))
    await waitFor(() => expect(screen.getAllByText('cv.slos.validations.userJourneyRequired').length).toEqual(2))
    await waitFor(() =>
      expect(screen.getAllByText('connectors.cdng.validations.monitoringServiceRequired').length).toEqual(2)
    )
    expect(
      container.querySelector('[data-testid="steptitle_Define_SLO_Identification"] [icon="warning-sign"]')
    ).toBeInTheDocument()
    expect(container).toMatchSnapshot()

    // Save should validate all Steps
    act(() => {
      userEvent.click(screen.getByText('save'))
    })
    act(() => {
      userEvent.click(container.querySelector('[data-testid="steptitle_Configure_Service_Level_Indicatiors"]')!)
    })
    act(() => {
      userEvent.click(container.querySelector('[data-testid="steptitle_Set_SLO"]')!)
    })
    act(() => {
      userEvent.click(container.querySelector('[data-testid="steptitle_Error_Budget_Policy"]')!)
    })
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
    await waitFor(() => expect(screen.getAllByText('cv.slos.validations.nameValidation').length).toEqual(2))
    await waitFor(() => expect(screen.getAllByText('cv.slos.validations.userJourneyRequired').length).toEqual(2))
    expect(
      container.querySelector('[data-testid="steptitle_Define_SLO_Identification"] [icon="warning-sign"]')
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
        container.querySelector('[data-testid="steptitle_Set_SLO_Time_Window"] [icon="warning-sign"]')
      ).toBeInTheDocument()
      expect(container.querySelector('[data-testid="steptitle_Add_SLOs"] [icon="warning-sign"]')).toBeInTheDocument()
      expect(
        container.querySelector('[data-testid="steptitle_Set_SLO_Target"] [icon="tick-circle"]')
      ).toBeInTheDocument()
    })

    const sloName = container.querySelector('input[name ="name"]')
    await waitFor(() => expect(sloName).toBeInTheDocument())
    act(() => {
      userEvent.type(sloName!, 'composite slo 1')
    })

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
      expect(
        getByText(`${SLODetailsData.resource.serviceLevelObjectiveV2.sloTarget.spec.periodLength}`)
      ).toBeInTheDocument()
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
        getByText(`${Number(SLODetailsData.resource.serviceLevelObjectiveV2.sloTarget.sloTargetPercentage)}%`)
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
    expect(screen.getByText('87%')).toBeInTheDocument()
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

    act(() => {
      userEvent.clear(sloName!)
      userEvent.type(sloName!, 'updated composite slo')
      userEvent.click(container.querySelector('[data-testid="steptitle_Set_SLO_Target"]')!)
    })

    fireEvent.change(container.querySelector('[name="SLOTargetPercentage"]')!, { target: { value: 99 } })

    act(() => {
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

    act(() => {
      const sloName = container.querySelector('input[name ="name"]')
      waitFor(() => expect(sloName).toBeInTheDocument())
      userEvent.clear(sloName!)
      userEvent.type(sloName!, 'updated composite slo')
    })
    act(() => {
      userEvent.click(container.querySelector('[data-testid="steptitle_Set_SLO_Target"]')!)
    })

    fireEvent.change(container.querySelector('[name="SLOTargetPercentage"]')!, { target: { value: 99 } })

    act(() => {
      userEvent.click(screen.getByText('cancel'))
    })

    waitFor(() => expect(document.querySelector('.bp3-dialog')).toBeInTheDocument())

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
    act(() => {
      userEvent.clear(sloName!)
      userEvent.type(sloName!, 'updated composite slo')
    })
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
    act(() => {
      userEvent.clear(sloName!)
      userEvent.type(sloName!, 'updated composite slo')
    })
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
    act(() => {
      userEvent.clear(sloName!)
      userEvent.type(sloName!, 'updated composite slo')
    })
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
    act(() => {
      userEvent.clear(sloName!)
      userEvent.type(sloName!, 'updated composite slo')
    })
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
    await waitFor(() => expect(screen.getByText('cv.CompositeSLO.compositeSloCreated')).toBeInTheDocument())
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
    expect(screen.getByText('45%')).toBeInTheDocument()
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

describe('Simple SLO V2', () => {
  test('Switch to Ratio basaed', async () => {
    jest
      .spyOn(cvServices, 'useGetServiceLevelObjectiveV2')
      .mockImplementation(() => ({ data: simpleSLOData, loading: false, error: null, refetch: jest.fn() } as any))
    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cv/dashboard/orgs/:orgIdentifier/projects/:projectIdentifier/slos"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <CVCreateSLOV2 isComposite={false} />
      </TestWrapper>
    )

    act(() => {
      userEvent.click(screen.getByText('next'))
    })

    act(() => {
      userEvent.click(container.querySelector('[value="Ratio"]')!)
    })

    act(() => {
      userEvent.click(container.querySelector('[name="goodRequestMetric"]')!)
    })
    await waitFor(() => expect(document.querySelectorAll('[class*="bp3-menu"] li')).toHaveLength(2))
    act(() => {
      userEvent.click(document.querySelectorAll('[class*="bp3-menu"] li')[0]!)
    })

    act(() => {
      userEvent.click(container.querySelector('[name="validRequestMetric"]')!)
    })
    await waitFor(() => expect(document.querySelectorAll('[class*="bp3-menu"] li')).toHaveLength(4))
    act(() => {
      userEvent.click(document.querySelectorAll('[class*="bp3-menu"] li')[0]!)
    })
  })
  test('Edit simple slo v2', async () => {
    jest
      .spyOn(cvServices, 'useGetServiceLevelObjectiveV2')
      .mockImplementation(() => ({ data: simpleSLOData, loading: false, error: null, refetch: jest.fn() } as any))
    const { container, getByText } = render(
      <TestWrapper
        path="/account/:accountId/cv/dashboard/orgs/:orgIdentifier/projects/:projectIdentifier/slos"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <CVCreateSLOV2 isComposite={false} />
      </TestWrapper>
    )

    expect(container.querySelector('input[ name="name"')).toHaveValue('SLO1')

    act(() => {
      userEvent.click(screen.getByText('next'))
    })
    expect(getByText('service_appd_env_appd')).toBeInTheDocument()
    expect(getByText('cv.slos.slis.HealthSource')).toBeInTheDocument()
    expect(getByText('cv.healthSource.newHealthSource')).toBeInTheDocument()
    expect(container.querySelector('input[value="Good"]')).toBeChecked()

    act(() => {
      userEvent.click(getByText('cv.slos.slis.type.latency'.toUpperCase()))
    })

    act(() => {
      userEvent.click(container.querySelector('[name="healthSourceRef"]')!)
    })
    await waitFor(() => expect(document.querySelectorAll('[class*="bp3-menu"] li')).toHaveLength(2))
    act(() => {
      userEvent.click(document.querySelectorAll('[class*="bp3-menu"] li')[0]!)
    })

    act(() => {
      userEvent.click(getByText('cv.healthSource.newHealthSource'))
    })
    const healthSourceDrawer: HTMLElement | null = document.querySelector('.health-source-right-drawer')
    expect(healthSourceDrawer).toBeTruthy()
    fireEvent.click(document.querySelector('[data-icon="cross"]')!)

    act(() => {
      userEvent.click(getByText('cv.newMetric'))
    })
    const metricDrawer: HTMLElement | null = document.querySelector('.health-source-right-drawer')
    expect(metricDrawer).toBeTruthy()
    fireEvent.click(document.querySelector('[data-icon="cross"]')!)

    act(() => {
      userEvent.click(container.querySelector('[data-testid="steptitle_Set_SLO"]')!)
    })
    act(() => {
      userEvent.click(container.querySelector('[data-testid="steptitle_Error_Budget_Policy"]')!)
    })
    act(() => {
      userEvent.click(getByText('cancel'))
    })
  })

  test('check failure of useGetAllMonitoredServicesWithTimeSeriesHealthSources', () => {
    jest
      .spyOn(cvServices, 'useGetAllMonitoredServicesWithTimeSeriesHealthSources')
      .mockImplementation(
        () => ({ data: null, loading: false, error: { data: { message: 'api error' } }, refetch: jest.fn() } as any)
      )
    render(
      <TestWrapper
        path="/account/:accountId/cv/dashboard/orgs/:orgIdentifier/projects/:projectIdentifier/slos"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <CVCreateSLOV2 isComposite={false} />
      </TestWrapper>
    )
    expect(screen.getAllByText('api error')).toHaveLength(2)
  })

  test('Cancel without adding any values', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <CVCreateSLOV2 />
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
  })

  test('should load ratio based with objective value 99.99', () => {
    jest
      .spyOn(cvServices, 'useGetServiceLevelObjectiveV2')
      .mockImplementation(() => ({ data: ratioBasedSLO, loading: false, error: null, refetch: jest.fn() } as any))

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cv/dashboard/orgs/:orgIdentifier/projects/:projectIdentifier/slos"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <CVCreateSLOV2 isComposite={false} />
      </TestWrapper>
    )

    act(() => {
      userEvent.click(screen.getByText('next'))
    })
    expect(container.querySelector('[name="objectiveValue"]')).toHaveValue(99.99)
    act(() => {
      userEvent.click(screen.getByText('next'))
    })
    expect(container.querySelectorAll('[class*="intent-danger"]').length).toEqual(0)
  })

  test('validate getSLOV2InitialFormData', () => {
    expect(getSLOV2InitialFormData(SLOType.SIMPLE, undefined, false)).toEqual(initialData)
    expect(getSLOV2InitialFormData(SLOType.SIMPLE, undefined, true)).toEqual(
      omit(initialData, ['serviceLevelIndicatorType'])
    )
    expect(getSLOV2InitialFormData(SLOType.SIMPLE, serviceLevelObjectiveV2 as any, false)).toEqual(editFormData)
  })

  test('validate getServiceLevelIndicatorsIdentifierFromResponse', () => {
    expect(getServiceLevelIndicatorsIdentifierFromResponse(null)).toEqual(undefined)
    expect(getServiceLevelIndicatorsIdentifierFromResponse(null, false)).toEqual(undefined)
    expect(getServiceLevelIndicatorsIdentifierFromResponse(null, true)).toEqual(undefined)
    expect(
      getServiceLevelIndicatorsIdentifierFromResponse(
        ratioBasedSLO as cvServices.RestResponseServiceLevelObjectiveV2Response,
        true
      )
    ).toEqual(undefined)
    expect(
      getServiceLevelIndicatorsIdentifierFromResponse(
        ratioBasedSLO as cvServices.RestResponseServiceLevelObjectiveV2Response,
        false
      )
    ).toEqual(ratioBasedSLO.resource.serviceLevelObjectiveV2.spec.serviceLevelIndicators[0].identifier)
  })

  test('validate getServiceLevelIndicatorsIdentifier', () => {
    expect(getServiceLevelIndicatorsIdentifier(SLOV2FormMock as SLOV2Form)).toEqual('Ratio_Based_Exceptions_per_Minute')
    expect(getServiceLevelIndicatorsIdentifier(SLOV2FormMock as SLOV2Form, 'prvSLIIdentifier')).toEqual(
      'prvSLIIdentifier'
    )
  })

  test('validate createOptionalConfigPayload', () => {
    const mockOptionalConfig = { considerAllConsecutiveMinutesFromStartAsBad: false, considerConsecutiveMinutes: 10 }
    expect(createOptionalConfigPayload(SLOV2FormMock as SLOV2Form)).toEqual({})
    expect(
      createOptionalConfigPayload({
        ...SLOV2FormMock,
        ...mockOptionalConfig
      } as SLOV2Form)
    ).toEqual(mockOptionalConfig)
    expect(
      createOptionalConfigPayload({
        ...SLOV2FormMock,
        ...mockOptionalConfig,
        considerAllConsecutiveMinutesFromStartAsBad: true
      } as SLOV2Form)
    ).toEqual({ ...mockOptionalConfig, considerAllConsecutiveMinutesFromStartAsBad: true })
    expect(
      createOptionalConfigPayload({
        ...SLOV2FormMock,
        considerAllConsecutiveMinutesFromStartAsBad: true,
        considerConsecutiveMinutes: undefined
      } as SLOV2Form)
    ).toEqual({})
    expect(
      createOptionalConfigPayload({
        ...SLOV2FormMock,
        considerAllConsecutiveMinutesFromStartAsBad: undefined,
        considerConsecutiveMinutes: 10
      } as SLOV2Form)
    ).toEqual({})
  })

  test('validate getSimpleSLOCustomValidation', () => {
    const mockOptionalConfig = { considerAllConsecutiveMinutesFromStartAsBad: false, considerConsecutiveMinutes: 10 }
    expect(getSimpleSLOCustomValidation(SLOV2FormMock as SLOV2Form, str => str)).toEqual(undefined)
    expect(getSimpleSLOCustomValidation({ ...SLOV2FormMock, ...mockOptionalConfig } as SLOV2Form, str => str)).toEqual(
      {}
    )
    expect(
      getSimpleSLOCustomValidation(
        {
          ...SLOV2FormMock,
          ...mockOptionalConfig,
          considerAllConsecutiveMinutesFromStartAsBad: undefined
        } as SLOV2Form,
        str => str
      )
    ).toEqual({ considerAllConsecutiveMinutesFromStartAsBad: 'cv.required' })
    expect(
      getSimpleSLOCustomValidation(
        {
          ...SLOV2FormMock,
          ...mockOptionalConfig,
          considerConsecutiveMinutes: undefined
        } as SLOV2Form,
        str => str
      )
    ).toEqual({ considerConsecutiveMinutes: 'cv.required' })
    expect(
      getSimpleSLOCustomValidation(
        {
          ...SLOV2FormMock,
          ...mockOptionalConfig,
          considerConsecutiveMinutes: 100
        } as SLOV2Form,
        str => str
      )
    ).toEqual({ considerConsecutiveMinutes: 'cv.slos.slis.optionalConfig.consecutiveMinsMax' })
    expect(
      getSimpleSLOCustomValidation(
        {
          ...SLOV2FormMock,
          ...mockOptionalConfig,
          considerConsecutiveMinutes: 0
        } as SLOV2Form,
        str => str
      )
    ).toEqual({ considerConsecutiveMinutes: 'cv.slos.slis.optionalConfig.consecutiveMinsMin' })
  })
})
