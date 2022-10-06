/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act } from 'react-test-renderer'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as dbHook from '@cv/hooks/IndexedDBHook/IndexedDBHook'
import HealthSourceTableContainer from '../HealthSourceTableContainer'
import { formFormik, healthSourceList, serviceFormik } from './HealthSourceTableContainer.mock'

jest.mock('services/cd-ng', () => ({
  ...(jest.requireActual('services/cd-ng') as any),
  useGetConnectorList: () => {
    return {
      data: {},
      refetch: jest.fn()
    }
  },
  useGetConnector: () => {
    return {
      data: {},
      refetch: jest.fn()
    }
  }
}))
describe('Validate', () => {
  test('should render HealthSourceTableContainer with no data', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <HealthSourceTableContainer
          healthSourceListFromAPI={[healthSourceList]}
          serviceFormFormik={formFormik as any}
          onSave={jest.fn()}
        />
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('cv.healthSource.noData')).toBeInTheDocument())

    act(() => {
      fireEvent.click(getByText('cv.healthSource.addHealthSource'))
    })

    // drawer opens with correct header
    await waitFor(() => expect(getByText('cv.healthSource.backtoMonitoredService')).toBeInTheDocument())

    await waitFor(() => {
      const header = document.body.querySelector('.bp3-drawer-header .bp3-heading .ng-tooltip-native')
      return expect(header?.textContent).toEqual('cv.healthSource.addHealthSource')
    })

    expect(container).toMatchSnapshot()
  })
  test('should render HealthSourceTableContainer with data', async () => {
    jest.spyOn(dbHook, 'useIndexedDBHook').mockReturnValue({
      dbInstance: {
        put: jest.fn(),
        get: jest.fn().mockReturnValue(undefined)
      } as any,
      isInitializingDB: false
    })
    const { container, getByText } = render(
      <TestWrapper>
        <HealthSourceTableContainer
          healthSourceListFromAPI={[healthSourceList]}
          serviceFormFormik={{ values: serviceFormik } as any}
          onSave={jest.fn()}
        />
      </TestWrapper>
    )
    expect(container.querySelectorAll('.TableV2--body div[role="row"]').length).toEqual(1)

    // drawer opens with correct header
    await waitFor(() => expect(getByText('cv.healthSource.addHealthSource')).toBeInTheDocument())

    act(() => {
      fireEvent.click(container.querySelector('.TableV2--body div[role="row"]')!)
    })
    // drawer opens with correct header
    await waitFor(() => expect(getByText('cv.healthSource.backtoMonitoredService')).toBeInTheDocument())
    await waitFor(() => expect(getByText('cv.healthSource.editHealthSource')).toBeInTheDocument())

    expect(container).toMatchSnapshot()
  })

  test('should close drawer', async () => {
    jest.spyOn(dbHook, 'useIndexedDBHook').mockReturnValue({
      dbInstance: {
        put: jest.fn(),
        get: jest.fn().mockReturnValue(undefined)
      } as any,
      isInitializingDB: false
    })
    const { container, getByText } = render(
      <TestWrapper>
        <HealthSourceTableContainer
          healthSourceListFromAPI={[healthSourceList]}
          serviceFormFormik={{ values: serviceFormik } as any}
          onSave={jest.fn()}
        />
      </TestWrapper>
    )
    expect(container.querySelectorAll('.TableV2--body div[role="row"]').length).toEqual(1)

    // drawer opens with correct header
    await waitFor(() => expect(getByText('cv.healthSource.addHealthSource')).toBeInTheDocument())

    act(() => {
      fireEvent.click(container.querySelector('.TableV2--body div[role="row"]')!)
    })
    // drawer opens with correct header
    await waitFor(() => expect(getByText('cv.healthSource.backtoMonitoredService')).toBeInTheDocument())
    const drawerOpen = document.body.querySelector('.health-source-right-drawer')
    await waitFor(() => expect(drawerOpen).toBeTruthy())

    act(() => {
      fireEvent.click(getByText('cv.healthSource.backtoMonitoredService'))
    })

    const drawerClosed = document.body.querySelector('.health-source-right-drawer')
    await waitFor(() => expect(drawerClosed).not.toBeTruthy())

    expect(container).toMatchSnapshot()
  })
})
