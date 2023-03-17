/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { screen, render, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Container, Button } from '@harness/uicore'
import routes from '@common/RouteDefinitions'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { accountPathProps, projectPathProps, modulePathProps } from '@common/utils/routeUtils'
import * as dbHook from '@cv/hooks/IndexedDBHook/IndexedDBHook'
import Service, { ServiceWithRef } from '../Service'
import { editModeData, saveChangeSource } from './Service.mock'

const paramsEditMode = { ...accountPathProps, ...projectPathProps, ...modulePathProps, identifier: ':identifier' }
const testWrapperProps: TestWrapperProps = {
  path: routes.toCVAddMonitoringServicesEdit(paramsEditMode),
  pathParams: {
    module: 'cv',
    accountId: '1234_accountId',
    projectIdentifier: '1234_project',
    orgIdentifier: '1234_org',
    identifier: 'ms101'
  }
}

const onEdit = jest.fn()
const onDelete = jest.fn()

jest.mock('@cv/components/ContextMenuActions/ContextMenuActions', () => () => {
  return (
    <>
      <div className="context-menu-mock-edit" onClick={onEdit} />
      <div className="context-menu-mock-delete" onClick={onDelete} />
    </>
  )
})

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
const onSuccess = jest.fn()

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
    .mockImplementation(() => ({ data: {}, loading: false, error: null, refetch: jest.fn() }))
}))

describe('Verify ChangeSource', () => {
  test('should not make API call on saving changeSource if template', async () => {
    jest.spyOn(dbHook, 'useIndexedDBHook').mockReturnValue({
      dbInstance: {
        put: jest.fn(),
        get: jest.fn().mockReturnValue(undefined)
      } as any,
      isInitializingDB: false
    })
    const { getByText } = render(
      <TestWrapper {...testWrapperProps}>
        <ServiceWithRef
          isTemplate
          value={saveChangeSource}
          onSuccess={onSuccess}
          serviceTabformRef={{ current: {} }}
          onChangeMonitoredServiceType={jest.fn()}
        />
      </TestWrapper>
    )

    act(() => {
      userEvent.click(getByText('cv.changeSource.addChangeSource'))
    })

    await waitFor(() => expect(getByText('Harness CD Next Gen')).toBeInTheDocument())

    await act(() => {
      userEvent.click(screen.getByText('Harness CD Next Gen'))
    })

    await waitFor(() => expect(screen.getByText('cv.changeSource.defineChangeSource')).toBeInTheDocument())

    await act(() => {
      userEvent.click(screen.getByText('submit'))
    })

    await waitFor(() => expect(onSuccess).not.toHaveBeenCalled())
  })
  test('should make API call on saving changeSource', async () => {
    jest.spyOn(dbHook, 'useIndexedDBHook').mockReturnValue({
      dbInstance: {
        put: jest.fn(),
        get: jest.fn().mockReturnValue(undefined)
      } as any,
      isInitializingDB: false
    })
    const { getByText } = render(
      <TestWrapper {...testWrapperProps}>
        <Service
          value={saveChangeSource}
          onSuccess={onSuccess}
          serviceTabformRef={{ current: {} }}
          onChangeMonitoredServiceType={jest.fn()}
        />
      </TestWrapper>
    )

    act(() => {
      userEvent.click(getByText('cv.changeSource.addChangeSource'))
    })

    await waitFor(() => expect(getByText('Harness CD Next Gen')).toBeInTheDocument())

    await act(() => {
      userEvent.click(screen.getByText('Harness CD Next Gen'))
    })

    await waitFor(() => expect(screen.getByText('cv.changeSource.defineChangeSource')).toBeInTheDocument())

    await act(() => {
      userEvent.click(screen.getByText('submit'))
    })

    await waitFor(() => expect(onSuccess).toHaveBeenCalled())
  })
})
