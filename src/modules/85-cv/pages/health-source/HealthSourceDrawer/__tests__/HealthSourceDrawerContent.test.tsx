/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import routes from '@common/RouteDefinitions'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import HealthSourceDrawerContent from '../HealthSourceDrawerContent'

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

jest.mock('@cv/pages/health-source/HealthSourceDrawer/component/defineHealthSource/useValidConnector', () => ({
  useValidConnector: jest.fn().mockReturnValue({
    isConnectorEnabled: true
  })
}))

const testWrapperProps: TestWrapperProps = {
  path: routes.toCVAddMonitoringServicesSetup({ ...accountPathProps, ...projectPathProps }),
  pathParams: {
    accountId: '1234_accountId',
    projectIdentifier: '1234_project',
    orgIdentifier: '1234_org'
  }
}
describe('HealthSource table', () => {
  test('should matchsnapshot', () => {
    const props = {
      serviceRef: 'service1',
      environmentRef: 'environment1',
      monitoredServiceRef: { identifier: 'ms 101', name: 'ms_101' },
      setModalOpen: () => false,
      onSuccess: () => {
        return 'sucess'
      },
      modalOpen: true,
      createHeader: () => <h2>Header content</h2>,
      onClose: () => false,
      isEdit: false,
      rowData: null,
      tableData: [],
      changeSources: [],
      metricDetails: null
    }
    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <HealthSourceDrawerContent {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('Should Render all the componetns in edit mode for cloud metrics', () => {
    const props = {
      serviceRef: 'todolist',
      environmentRef: 'todolistprod',
      createHeader: () => <h2>Header content</h2>,
      onClose: () => false,
      setModalOpen: () => false,
      onSuccess: () => {
        return 'sucess'
      },
      monitoredServiceRef: {
        name: 'todolist_todolistprod',
        identifier: 'todolist_todolistprod',
        description: '',
        tags: {}
      },
      modalOpen: true,
      isEdit: true,
      rowData: {
        type: 'Stackdriver' as any,
        identifier: 'dvds',
        name: 'dvds',
        spec: {
          feature: 'Cloud Metrics',
          product: {
            label: 'Cloud Metrics',
            value: 'Cloud Metrics'
          }
        }
      },
      tableData: [
        {
          name: 'splunk',
          identifier: 'splunk',
          type: 'Splunk' as any,
          spec: {
            connectorRef: 'splunk',
            feature: 'Splunk Cloud Logs'
          }
        },
        {
          type: 'Stackdriver' as any,
          identifier: 'dvds',
          name: 'dvds',
          spec: {
            feature: 'Cloud Metrics',

            product: {
              label: 'Cloud Metrics',
              value: 'Cloud Metrics'
            }
          }
        }
      ],
      changeSources: [],
      metricDetails: null
    }
    const { container, getByRole, getAllByText } = render(
      <TestWrapper {...testWrapperProps}>
        <HealthSourceDrawerContent {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    const elements = getByRole('tablist')

    expect(elements.getElementsByClassName('bp3-tab').length).toBe(3)

    expect(getAllByText('cv.healthSource.defineHealthSource')[0].getAttribute('aria-disabled')).toBe('false')
    expect(getAllByText('configuration')[0].getAttribute('aria-disabled')).toBe('true')
    expect(getAllByText('cv.healthSource.connectors.gco.selectDashboardTab')[0].getAttribute('aria-disabled')).toBe(
      'false'
    )
  })

  test('Should Render all the componetns in edit mode for logs', () => {
    const props = {
      serviceRef: 'serviceappd',
      createHeader: () => <h2>Header content</h2>,
      onClose: () => false,
      setModalOpen: () => false,
      onSuccess: () => {
        return 'sucess'
      },
      environmentRef: 'prodappd',
      monitoredServiceRef: {
        name: 'Appd',
        identifier: 'Appd',
        description: '',
        tags: {}
      },
      modalOpen: true,
      isEdit: true,
      rowData: {
        type: 'StackdriverLog' as any,
        identifier: 'dfadadsa',
        name: 'dfadadsa',
        spec: {
          feature: 'Cloud Logs',
          queries: [
            {
              name: 'GCO Logs Query ',
              query: '{}'
            }
          ]
        }
      },
      tableData: [
        {
          name: 'appd_prod',
          identifier: 'appd_prod',
          type: 'AppDynamics',
          spec: {
            feature: 'Application Monitoring',
            applicationName: 'cv-app',
            tierName: 'python-tier'
          }
        },
        {
          name: 'appd-test',
          identifier: 'appdtest',
          type: 'AppDynamics' as any,
          spec: {
            feature: 'Application Monitoring',
            applicationName: 'cv-app',
            tierName: 'docker-tier'
          }
        },
        {
          type: 'StackdriverLog' as any,
          identifier: 'dfadadsa',
          name: 'dfadadsa',
          spec: {
            feature: 'Cloud Logs',
            queries: [
              {
                name: 'GCO Logs Query ',
                query: '{}'
              }
            ]
          }
        }
      ],
      changeSources: [],
      metricDetails: null
    }
    const { container, getByRole, getAllByText } = render(
      <TestWrapper {...testWrapperProps}>
        <HealthSourceDrawerContent {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    const elements = getByRole('tablist')

    expect(elements.getElementsByClassName('bp3-tab').length).toBe(2)

    expect(getAllByText('cv.healthSource.defineHealthSource')[0].getAttribute('aria-disabled')).toBe('false')
    expect(getAllByText('configuration')[0].getAttribute('aria-disabled')).toBe('false')
  })
})
