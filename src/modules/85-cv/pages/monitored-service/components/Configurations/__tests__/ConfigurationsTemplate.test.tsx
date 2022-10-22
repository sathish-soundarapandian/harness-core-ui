/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Container, FormInput, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import * as dbHook from '@cv/hooks/IndexedDBHook/IndexedDBHook'
import { TestWrapper } from '@common/utils/testUtils'
import { Scope } from '@common/interfaces/SecretsInterface'
import routes from '@common/RouteDefinitions'
import { MonitoredServiceProvider } from '@cv/pages/monitored-service/MonitoredServiceContext'
import { accountPathProps, orgPathProps } from '@common/utils/routeUtils'
import { ConfigurationsWithRef } from '../Configurations'
import { cachedData, editModeData } from '../components/Service/__tests__/Service.mock'

jest.mock('@cv/components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment', () => ({
  useGetHarnessServices: () => ({
    serviceOptions: [
      { label: 'service1', value: 'service1' },
      { label: 'AppDService101', value: 'AppDService101' }
    ]
  }),
  HarnessServiceAsFormField: function MockComponent() {
    return (
      <Container>
        <FormInput.Text name="serviceRef" />
      </Container>
    )
  },
  HarnessEnvironmentAsFormField: function MockComponent() {
    return (
      <Container>
        <FormInput.Text name="environmentRef" />
      </Container>
    )
  },
  useGetHarnessEnvironments: () => {
    return {
      environmentOptions: [
        { label: 'env1', value: 'env1' },
        { label: 'AppDTestEnv1', value: 'AppDTestEnv1' }
      ]
    }
  }
}))

const fetchMonitoredServiceYAML = jest.fn(() => Promise.resolve({ data: {} }))
const updateMonitoredService = jest.fn()

jest.mock('services/cv', () => ({
  useSaveMonitoredService: jest
    .fn()
    .mockImplementation(() => ({ loading: false, error: null, data: {}, refetch: jest.fn() })),
  useUpdateMonitoredService: jest
    .fn()
    .mockImplementation(() => ({ loading: false, error: null, data: {}, mutate: updateMonitoredService })),
  useGetMonitoredService: jest
    .fn()
    .mockImplementation(() => ({ loading: false, error: null, data: editModeData, refetch: jest.fn() })),
  useGetMonitoredServiceYamlTemplate: jest
    .fn()
    .mockImplementation(() => ({ loading: false, error: null, data: {}, refetch: fetchMonitoredServiceYAML })),
  useGetNotificationRulesForMonitoredService: jest
    .fn()
    .mockImplementation(() => ({ data: {}, loading: false, error: null, refetch: jest.fn() })),
  useSaveNotificationRuleData: jest
    .fn()
    .mockImplementation(() => ({ data: {}, loading: false, error: null, refetch: jest.fn() })),
  useUpdateNotificationRuleData: jest
    .fn()
    .mockImplementation(() => ({ data: {}, loading: false, error: null, refetch: jest.fn() })),
  useGetMonitoredServiceList: jest
    .fn()
    .mockImplementation(() => ({ data: {}, loading: false, error: null, refetch: jest.fn() }))
}))

describe('Unit tests for Configuration Template', async () => {
  test('Service and Environment to be RUNTIME for account level template', () => {
    jest.spyOn(dbHook, 'useIndexedDBHook').mockReturnValue({
      dbInstance: {
        put: jest.fn(),
        get: jest.fn().mockReturnValue(Promise.resolve({ currentData: cachedData }))
      } as any,
      isInitializingDB: false
    })
    const updateTemplate = jest.fn()
    const testPath = routes.toTemplateStudio({ ...accountPathProps })
    const pathParams = { accountId: 'accountId' }
    const { container } = render(
      <TestWrapper path={testPath} pathParams={pathParams}>
        <MonitoredServiceProvider isTemplate templateScope={Scope.ACCOUNT}>
          <ConfigurationsWithRef
            templateValue={{
              identifier: '',
              name: 'tempalteMS',
              type: 'MonitoredService',
              versionLabel: ' 1',
              spec: {
                sources: { changeSources: [], healthSources: [] }
              }
            }}
            updateTemplate={updateTemplate}
          />
        </MonitoredServiceProvider>
      </TestWrapper>
    )
    expect(container.querySelector('input[name="serviceRef"]')).toHaveValue(RUNTIME_INPUT_VALUE)
    expect(container.querySelector('input[name="environmentRef"]')).toHaveValue(RUNTIME_INPUT_VALUE)
  })

  test('Service and Environment to be RUNTIME for org level template', async () => {
    jest.spyOn(dbHook, 'useIndexedDBHook').mockReturnValue({
      dbInstance: {
        put: jest.fn(),
        get: jest.fn().mockReturnValue(Promise.resolve({ currentData: cachedData }))
      } as any,
      isInitializingDB: false
    })
    const updateTemplate = jest.fn()
    const testPath = routes.toTemplateStudio({ ...accountPathProps, ...orgPathProps })
    const pathParams = { accountId: 'accountId', orgIdentifier: 'orgIdentifier' }
    const { container } = render(
      <TestWrapper path={testPath} pathParams={pathParams}>
        <MonitoredServiceProvider isTemplate templateScope={Scope.ORG}>
          <ConfigurationsWithRef
            templateValue={{
              identifier: '',
              name: 'tempalteMS',
              type: 'MonitoredService',
              versionLabel: ' 1',
              spec: {
                sources: { changeSources: [], healthSources: [] }
              }
            }}
            updateTemplate={updateTemplate}
          />
        </MonitoredServiceProvider>
      </TestWrapper>
    )
    expect(container.querySelector('input[name="serviceRef"]')).toHaveValue(RUNTIME_INPUT_VALUE)
    expect(container.querySelector('input[name="environmentRef"]')).toHaveValue(RUNTIME_INPUT_VALUE)
  })
})
