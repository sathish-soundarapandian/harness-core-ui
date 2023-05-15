/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import routes from '@common/RouteDefinitions'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { HealthSourceList } from './HealthSourceTable.mock'
import HealthSourceTable from '../HealthSourceTable'
import { getIconBySourceType } from '../HealthSourceTable.utils'

const editModeProps: TestWrapperProps = {
  path: routes.toCVAddMonitoringServicesEdit({ ...accountPathProps, ...projectPathProps }),
  pathParams: {
    identifier: 'MonitoredService',
    accountId: '1234_accountId',
    projectIdentifier: '1234_project',
    orgIdentifier: '1234_org'
  }
}

const healthSourceTableProps = {
  value: HealthSourceList,
  monitoredServiceRef: { identifier: 'ms 101', name: 'ms_101' },
  serviceRef: 'service1',
  environmentRef: 'environment1',
  isEdit: false,
  type: 'AppDynamics',
  onSuccess: jest.fn(),
  onDelete: jest.fn(),
  onEdit: jest.fn(),
  addNew: jest.fn()
}

jest.mock('@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs', () => ({
  ...(jest.requireActual('@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs') as any),
  get SetupSourceTabsContext() {
    return React.createContext({
      tabsInfo: [],
      sourceData: { productName: 'apm' },
      onNext: jest.fn(),
      onPrevious: jest.fn()
    })
  }
}))

jest.mock('@cv/components/ContextMenuActions/ContextMenuActions', () => (props: any) => {
  return (
    <>
      <div className="context-menu-mock-edit" onClick={props.onEdit} />
      <div className="context-menu-mock-delete" onClick={healthSourceTableProps.onDelete} />
    </>
  )
})

describe('HealthSource table', () => {
  test('Verify HealthSource Table in CV', async () => {
    const { container } = render(
      <TestWrapper {...editModeProps}>
        <HealthSourceTable
          onEdit={jest.fn()}
          onAddNewHealthSource={jest.fn()}
          value={HealthSourceList}
          isRunTimeInput={false}
          shouldRenderAtVerifyStep={false}
          onSuccess={healthSourceTableProps.onSuccess}
        />
      </TestWrapper>
    )

    //render rows based on data
    await waitFor(() => expect(container.querySelectorAll('.TableV2--body [role="row"]').length).toEqual(2))

    fireEvent.click(container.querySelector('.context-menu-mock-delete')!)
    await waitFor(() => expect(healthSourceTableProps.onDelete).toHaveBeenCalled())

    fireEvent.click(container.querySelector('.context-menu-mock-edit')!)
    await waitFor(() => expect(container.querySelector('.health-source-right-drawer')).toBeDefined())

    expect(container).toMatchSnapshot()
  })

  test('Verify HealthSource Table in Verify step', async () => {
    const { container, getByText } = render(
      <TestWrapper {...editModeProps}>
        <HealthSourceTable
          onEdit={healthSourceTableProps.onEdit}
          onAddNewHealthSource={healthSourceTableProps.addNew}
          value={HealthSourceList}
          isRunTimeInput={false}
          shouldRenderAtVerifyStep
          onSuccess={healthSourceTableProps.onSuccess}
        />
      </TestWrapper>
    )

    //render rows based on data
    await waitFor(() => expect(container.querySelectorAll('.TableV2--body [role="row"]').length).toEqual(2))

    await userEvent.click(container.querySelector('span[icon="edit"]')!)
    await waitFor(() => expect(healthSourceTableProps.onEdit).toHaveBeenCalled())

    await userEvent.click(getByText('plusAdd'))
    await waitFor(() => expect(healthSourceTableProps.addNew).toHaveBeenCalled())

    expect(container).toMatchSnapshot()
  })

  test('Ensure getIconBySourceType returns correct value', async () => {
    expect(getIconBySourceType('KUBERNETES')).toEqual('service-kubernetes')
    expect(getIconBySourceType('APP_DYNAMICS')).toEqual('service-appdynamics')
    expect(getIconBySourceType('STACKDRIVER')).toEqual('service-stackdriver')
    expect(getIconBySourceType('NEW_RELIC')).toEqual('service-newrelic')
    expect(getIconBySourceType('HEALTH')).toEqual('health')
    expect(getIconBySourceType('CANARY')).toEqual('canary-outline')
    expect(getIconBySourceType('BLUE_GREEN')).toEqual('bluegreen')
    expect(getIconBySourceType('TEST')).toEqual('lab-test')
    expect(getIconBySourceType('PROMETHEUS')).toEqual('service-prometheus')
  })
})
