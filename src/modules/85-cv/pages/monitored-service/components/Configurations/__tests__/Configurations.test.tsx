/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor, act } from '@testing-library/react'
import { Container, Button } from '@wings-software/uicore'
import * as dbHook from '@cv/hooks/IndexedDBHook/IndexedDBHook'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import * as cvServices from 'services/cv'
import { yamlResponse } from '@cv/pages/monitored-service/CVMonitoredService/__test__/CVMonitoredService.mock'
import { MonitoredServiceContext } from '@cv/pages/monitored-service/MonitoredServiceContext'
import { accountPathProps, projectPathProps } from '@common/utils/routeUtils'
import { cvModuleParams } from '@cv/RouteDestinations'
import { editParams } from '@cv/utils/routeUtils'
import * as configUtils from '../Configurations.utils'
import Configurations, { ConfigurationsWithRef } from '../Configurations'
import { cachedData, editModeData } from '../components/Service/__tests__/Service.mock'

jest.mock('@cv/components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment', () => ({
  useGetHarnessServices: () => ({
    serviceOptions: [
      { label: 'service1', value: 'service1' },
      { label: 'AppDService101', value: 'AppDService101' }
    ]
  }),
  HarnessServiceAsFormField: function MockComponent(props: any) {
    return (
      <Container>
        <Button
          className="addService"
          onClick={() => props.serviceProps.onNewCreated({ name: 'newService', identifier: 'newService' })}
        />
      </Container>
    )
  },
  HarnessEnvironmentAsFormField: function MockComponent(props: any) {
    return (
      <Container>
        <Button
          className="addEnv"
          onClick={() => props.environmentProps.onNewCreated({ name: 'newEnv', identifier: 'newEnv' })}
        />
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

describe('Unit tests for Configuration', () => {
  test('Ensure that any infra change source is removed when switching type to application', async () => {
    jest.spyOn(dbHook, 'useIndexedDBHook').mockReturnValue({
      dbInstance: {
        put: jest.fn(),
        get: jest.fn().mockReturnValue(Promise.resolve({ currentData: cachedData }))
      } as any,
      isInitializingDB: false
    })
    const { container, getByText, queryByText } = render(
      <TestWrapper>
        <Configurations />
      </TestWrapper>
    )
    // name
    await waitFor(() => expect(container.querySelector('input[value="Application"]')).toBeTruthy())
    expect(getByText('CD 101')).not.toBeNull()
    act(() => {
      fireEvent.click(
        container.querySelector(`[class*="monitoredService"] .bp3-input-action [data-icon="chevron-down"]`)!
      )
    })
    await waitFor(() => expect(container.querySelector('[class*="menuItemLabel"]')).not.toBeNull())
    act(() => {
      fireEvent.click(getByText('Infrastructure'))
    })
    waitFor(() => expect(document.body.querySelector('[class*="ConfirmationDialog"]')).toBeDefined())
    waitFor(() => expect(document.body.querySelectorAll('[class*="ConfirmationDialog"] button')[0]).toBeDefined())
    act(() => {
      fireEvent.click(document.body.querySelectorAll('[class*="ConfirmationDialog"] button')[0])
    })
    await waitFor(() => expect(queryByText('CD 101')).not.toBeInTheDocument())
    await waitFor(() => expect(getByText('cv.healthSource.noData')).not.toBeNull())
    expect(document.title).toBe('cv.srmTitle | cv.monitoredServices.title | harness')
  })

  test('Ensure that error message is displayeed when api throws error', async () => {
    jest.spyOn(configUtils, 'onSubmit').mockImplementation(() => {
      throw new Error('mock error')
    })
    jest.spyOn(dbHook, 'useIndexedDBHook').mockReturnValue({
      dbInstance: {
        put: jest.fn(),
        get: jest.fn().mockReturnValue(Promise.resolve({ currentData: cachedData }))
      } as any,
      isInitializingDB: false
    })
    const { container, getByText } = render(
      <TestWrapper>
        <Configurations />
      </TestWrapper>
    )
    // name
    await waitFor(() => expect(container.querySelector('input[value="Application"]')).toBeTruthy())
    fireEvent.click(container.querySelector('button [data-icon*="send-data"]')!)

    await waitFor(() => expect(getByText('mock error')).not.toBeNull())
  })

  test('Ensure that error data should be rendered by default when there is no detailedMessage and message in the error response data', async () => {
    jest.spyOn(configUtils, 'onSubmit').mockImplementation(() => {
      throw new Error(
        JSON.stringify([{ field: 'metricDefinitions', message: 'same identifier is used by multiple entities' }])
      )
    })

    jest.spyOn(dbHook, 'useIndexedDBHook').mockReturnValue({
      dbInstance: {
        put: jest.fn(),
        get: jest.fn().mockReturnValue(Promise.resolve({ currentData: cachedData }))
      } as any,
      isInitializingDB: false
    })

    const { container, getByText } = render(
      <TestWrapper>
        <Configurations />
      </TestWrapper>
    )

    await waitFor(() => expect(container.querySelector('input[value="Application"]')).toBeTruthy())
    fireEvent.click(container.querySelector('button [data-icon*="send-data"]')!)

    await waitFor(() =>
      expect(
        getByText('[{"field":"metricDefinitions","message":"same identifier is used by multiple entities"}]')
      ).toBeInTheDocument()
    )
  })

  test('should fail saving monitored service', async () => {
    jest.spyOn(dbHook, 'useIndexedDBHook').mockReturnValue({
      dbInstance: {
        put: jest.fn(),
        get: jest.fn().mockReturnValue(Promise.resolve({ currentData: {} })),
        clear: jest.fn()
      } as any,
      isInitializingDB: false
    })

    const { getByText, queryByText } = render(
      <TestWrapper>
        <Configurations />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('save'))
    })
    await waitFor(() => expect(queryByText('unsavedChanges')).not.toBeInTheDocument())
  })

  test('should save monitored service', async () => {
    const testPath = routes.toCVAddMonitoringServicesEdit({
      ...accountPathProps,
      ...projectPathProps,
      ...editParams,
      ...cvModuleParams
    })

    const pathParams = {
      orgIdentifier: 'orgIdentifier',
      projectIdentifier: 'projectIdentifier',
      accountId: 'accountId',
      identifier: 'identifier',
      module: 'cv'
    }

    jest.spyOn(dbHook, 'useIndexedDBHook').mockReturnValue({
      dbInstance: {
        put: jest.fn(),
        get: jest.fn().mockReturnValue(Promise.resolve({ currentData: cachedData })),
        clear: jest.fn()
      } as any,
      isInitializingDB: false
    })

    const { getByText, queryByText } = render(
      <TestWrapper path={testPath} pathParams={pathParams}>
        <Configurations />
      </TestWrapper>
    )

    act(() => {
      fireEvent.click(getByText('save'))
    })
    await waitFor(() => expect(queryByText('unsavedChanges')).not.toBeInTheDocument())
  })
  test('should switch tabs and discard changes', async () => {
    const testPath = routes.toCVAddMonitoringServicesEdit({
      ...accountPathProps,
      ...projectPathProps,
      ...editParams,
      ...cvModuleParams
    })

    const pathParams = {
      orgIdentifier: 'orgIdentifier',
      projectIdentifier: 'projectIdentifier',
      accountId: 'accountId',
      identifier: 'identifier',
      module: 'cv'
    }

    jest.spyOn(dbHook, 'useIndexedDBHook').mockReturnValue({
      dbInstance: {
        put: jest.fn(),
        get: jest.fn().mockReturnValue(Promise.resolve({ currentData: cachedData })),
        clear: jest.fn()
      } as any,
      isInitializingDB: false
    })

    const { getByText, queryByText } = render(
      <TestWrapper path={testPath} pathParams={pathParams}>
        <Configurations />
      </TestWrapper>
    )
    act(() => {
      fireEvent.click(getByText('pipelines-studio.dependenciesGroupTitle'))
    })
    await waitFor(() => expect(getByText('cv.Dependency.serviceList')).toBeInTheDocument())
    act(() => {
      fireEvent.click(getByText('service'))
    })
    await waitFor(() => expect(getByText('cv.healthSource.defineYourSource')).toBeInTheDocument())
    await waitFor(() => expect(getByText('unsavedChanges')).toBeInTheDocument())
    act(() => {
      fireEvent.click(getByText('common.discard'))
    })
    await waitFor(() => expect(queryByText('unsavedChanges')).not.toBeInTheDocument())
  })

  test('should render default change source in MS Template', async () => {
    jest.spyOn(dbHook, 'useIndexedDBHook').mockReturnValue({
      dbInstance: {
        put: jest.fn(),
        get: jest.fn().mockReturnValue(Promise.resolve({ currentData: {} }))
      } as any,
      isInitializingDB: false
    })
    jest.spyOn(cvServices, 'useGetMonitoredServiceYamlTemplate').mockImplementation(
      () =>
        ({
          data: yamlResponse,
          refetch: jest.fn()
        } as any)
    )
    const updateTemplate = jest.fn()
    render(
      <TestWrapper>
        <MonitoredServiceContext.Provider value={{ isTemplate: true }}>
          <ConfigurationsWithRef
            updateTemplate={updateTemplate}
            templateValue={{
              identifier: '',
              orgIdentifier: 'orgIdentifier',
              projectIdentifier: 'projectIdentifier',
              name: 'tempalteMS',
              type: 'MonitoredService',
              versionLabel: ' -1',
              spec: {
                sources: { changeSources: [], healthSources: [] }
              }
            }}
          />
        </MonitoredServiceContext.Provider>
      </TestWrapper>
    )
    await waitFor(() => expect(updateTemplate).toHaveBeenCalled())
  })

  test('should fail useGetMonitoredService', () => {
    jest.spyOn(dbHook, 'useIndexedDBHook').mockReturnValue({
      dbInstance: {
        put: jest.fn(),
        get: jest.fn().mockReturnValue(Promise.resolve({ currentData: {} })),
        clear: jest.fn()
      } as any,
      isInitializingDB: false
    })
    const testPath = routes.toCVAddMonitoringServicesEdit({
      ...accountPathProps,
      ...projectPathProps,
      ...editParams,
      ...cvModuleParams
    })
    const pathParams = {
      orgIdentifier: 'orgIdentifier',
      projectIdentifier: 'projectIdentifier',
      accountId: 'accountId',
      identifier: 'identifier',
      module: 'cv'
    }
    jest
      .spyOn(cvServices, 'useGetMonitoredService')
      .mockImplementation(
        () => ({ loading: false, error: { message: 'api failed' }, data: null, refetch: jest.fn() } as any)
      )
    jest
      .spyOn(cvServices, 'useGetMonitoredServiceYamlTemplate')
      .mockImplementation(
        () => ({ loading: false, error: { message: 'api failed' }, data: null, refetch: jest.fn() } as any)
      )
    const editModeContainer = render(
      <TestWrapper path={testPath} pathParams={pathParams}>
        <Configurations />
      </TestWrapper>
    )
    expect(editModeContainer.getByText('api failed')).toBeInTheDocument()

    const createModeContainer = render(
      <TestWrapper>
        <Configurations />
      </TestWrapper>
    )
    expect(createModeContainer.getAllByText('api failed')[1]).toBeInTheDocument()
  })
})
