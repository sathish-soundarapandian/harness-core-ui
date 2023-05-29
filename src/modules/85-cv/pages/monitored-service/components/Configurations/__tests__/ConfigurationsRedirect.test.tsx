/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { render, waitFor, act } from '@testing-library/react'
import { Container, Button } from '@harness/uicore'
import * as dbHook from '@cv/hooks/IndexedDBHook/IndexedDBHook'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvServices from 'services/cv'
import { yamlResponse } from '@cv/pages/monitored-service/CVMonitoredService/__test__/CVMonitoredService.mock'
import { MonitoredServiceContext } from '@cv/pages/monitored-service/MonitoredServiceContext'
import { ConfigurationsWithRef } from '../Configurations'
import { editModeData } from '../components/Service/__tests__/Service.mock'

jest.useFakeTimers({ advanceTimers: true })

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
          onClick={() =>
            props.serviceProps.onNewCreated({
              name: 'newService',
              identifier: 'newService'
            })
          }
        />
      </Container>
    )
  },
  HarnessEnvironmentAsFormField: function MockComponent(props: any) {
    return (
      <Container>
        <Button
          className="addEnv"
          onClick={() =>
            props.environmentProps.onNewCreated({
              name: 'newEnv',
              identifier: 'newEnv'
            })
          }
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

const mockHistoryPush = jest.fn()
// eslint-disable-next-line jest-no-mock
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => {
    const [projectIdentifier, setProjectIdentifier] = useState<string>('project1')

    useEffect(() => {
      setTimeout(() => {
        setProjectIdentifier('project2')
      }, 1000)
    }, [])

    return {
      orgIdentifier: 'orgIdentifier',
      projectIdentifier,
      accountId: 'accountId',
      identifier: 'identifier',
      module: 'cv'
    }
  },
  useHistory: jest.fn(() => ({
    push: mockHistoryPush
  }))
}))

const fetchMonitoredServiceYAML = jest.fn(() => Promise.resolve({ data: {} }))
const updateMonitoredService = jest.fn()

jest.mock('services/cv', () => ({
  useSaveMonitoredService: jest.fn().mockImplementation(() => ({
    loading: false,
    error: null,
    data: {},
    refetch: jest.fn()
  })),
  useUpdateMonitoredService: jest.fn().mockImplementation(() => ({
    loading: false,
    error: null,
    data: {},
    mutate: updateMonitoredService
  })),
  useGetMonitoredService: jest.fn().mockImplementation(() => ({
    loading: false,
    error: null,
    data: editModeData,
    refetch: jest.fn()
  })),
  useGetMonitoredServiceYamlTemplate: jest.fn().mockImplementation(() => ({
    loading: false,
    error: null,
    data: {},
    refetch: fetchMonitoredServiceYAML
  })),
  useGetNotificationRulesForMonitoredService: jest.fn().mockImplementation(() => ({
    data: {},
    loading: false,
    error: null,
    refetch: jest.fn()
  })),
  useSaveNotificationRuleData: jest.fn().mockImplementation(() => ({
    data: {},
    loading: false,
    error: null,
    refetch: jest.fn()
  })),
  useUpdateNotificationRuleData: jest.fn().mockImplementation(() => ({
    data: {},
    loading: false,
    error: null,
    refetch: jest.fn()
  })),
  useGetMonitoredServiceList: jest.fn().mockImplementation(() => ({
    data: {},
    loading: false,
    error: null,
    refetch: jest.fn()
  }))
}))

describe('Unit tests for Configuration', () => {
  test('should redirect to template list page when project is changed from template studio page', async () => {
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

    render(
      <TestWrapper path={`/projects/projectId`}>
        <MonitoredServiceContext.Provider value={{ isTemplate: true }}>
          <ConfigurationsWithRef
            updateTemplate={() => void 0}
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
    expect(mockHistoryPush).not.toHaveBeenCalled()

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() =>
      expect(mockHistoryPush).toBeCalledWith({
        pathname: '/account/accountId/cv/orgs/orgIdentifier/projects/project2/setup/resources/templates',
        search: '?templateType=MonitoredService'
      })
    )
  })
})
