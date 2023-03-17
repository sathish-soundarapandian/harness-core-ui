/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, render } from '@testing-library/react'
import { Button, Container } from '@harness/uicore'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as FeatureFlag from '@common/hooks/useFeatureFlag'
import ServiceEnvironmentInputSet from '../ServiceEnvironmentInputSet'

jest.mock(
  '@cv/pages/monitored-service/components/Configurations/components/Service/components/MonitoredServiceOverview/component/OrgAccountLevelServiceEnvField/OrgAccountLevelServiceEnvField',
  () => ({
    __esModule: true,
    default: (props: any) => (
      <Container data-testid="OrgAccountLevelServiceEnvField">
        <Button
          onClick={() => props?.serviceOnSelect({ label: 'newService', value: 'newService' })}
          title="On Service Select"
        />
        <Button
          onClick={() => props?.environmentOnSelect({ label: 'newEnv', value: 'newEnv' })}
          title="On Environment Select"
        />
      </Container>
    )
  })
)

const setServiceOptions = jest.fn()
const setEnvironmentOptions = jest.fn()
jest.mock('@cv/components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment', () => ({
  useGetHarnessServices: () => ({
    setServiceOptions,
    serviceOptions: [{ label: 'service1', value: 'service1' }]
  }),
  HarnessServiceAsFormField: function MockComponent(props: any) {
    return (
      <Container>
        <Button
          title="onSelectService"
          onClick={() => props.serviceProps.onSelect({ name: 'newService', identifier: 'newService' })}
        />
        <Button
          title="addService"
          onClick={() => props.serviceProps.onNewCreated({ name: 'newService', identifier: 'newService' })}
        />
      </Container>
    )
  },
  HarnessEnvironmentAsFormField: function MockComponent(props: any) {
    return (
      <Container>
        <Button
          title="addEnv"
          onClick={() => props.environmentProps.onNewCreated({ name: 'newEnv', identifier: 'newEnv' })}
        />
        <Button
          title="onSelectEnv"
          onClick={() => props.environmentProps.onSelect({ name: 'newEnv', identifier: 'newEnv' })}
        />
      </Container>
    )
  },
  useGetHarnessEnvironments: () => ({
    setEnvironmentOptions,
    environmentOptions: [{ label: 'env1', value: 'env1' }]
  })
}))

describe('ServiceEnvironmentInputSet', () => {
  const onChangeMock = jest.fn()

  test('should render correctly with no service or environment values provided', () => {
    const { container } = render(
      <TestWrapper>
        <ServiceEnvironmentInputSet onChange={onChangeMock} isReadOnlyInputSet={false} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('should render correctly with a service and environment value provided', () => {
    const { container, getByText } = render(
      <TestWrapper>
        <ServiceEnvironmentInputSet
          serviceValue={'service-1'}
          environmentValue={'environment-1'}
          onChange={onChangeMock}
          isReadOnlyInputSet={false}
        />
      </TestWrapper>
    )
    expect(getByText('cv.monitoredServices.serviceAndEnvironment')).toBeInTheDocument()
    expect(container.querySelector('[title="addService"]')).toBeInTheDocument()
    expect(container.querySelector('[title="addEnv"]')).toBeInTheDocument()
    act(() => {
      userEvent.click(container.querySelector('[title="addEnv"]')!)
    })
    act(() => {
      userEvent.click(container.querySelector('[title="onSelectEnv"]')!)
    })
  })

  test('should render correctly with an environment value provided', () => {
    const { getByText, container, rerender } = render(
      <TestWrapper>
        <ServiceEnvironmentInputSet
          serviceValue={''}
          environmentValue={'env-1'}
          onChange={onChangeMock}
          isReadOnlyInputSet={false}
        />
      </TestWrapper>
    )
    expect(getByText('cv.monitoredServices.serviceAndEnvironment')).toBeInTheDocument()
    expect(container.querySelector('[title="addEnv"]')).toBeInTheDocument()

    rerender(
      <TestWrapper>
        <ServiceEnvironmentInputSet serviceValue={'svc-1'} onChange={onChangeMock} isReadOnlyInputSet={false} />
      </TestWrapper>
    )
    rerender(
      <TestWrapper>
        <ServiceEnvironmentInputSet environmentValue={'svc-1'} onChange={onChangeMock} isReadOnlyInputSet={false} />
      </TestWrapper>
    )
  })

  test('should render correctly with an service value provided', () => {
    const { getByText, container } = render(
      <TestWrapper>
        <ServiceEnvironmentInputSet serviceValue={'svc1'} onChange={onChangeMock} isReadOnlyInputSet={false} />
      </TestWrapper>
    )
    expect(getByText('cv.monitoredServices.serviceAndEnvironment')).toBeInTheDocument()
    expect(container.querySelector('[title="addService"]')).toBeInTheDocument()
    act(() => {
      userEvent.click(container.querySelector('[title="addService"]')!)
    })
    act(() => {
      userEvent.click(container.querySelector('[title="onSelectService"]')!)
    })
  })

  test('should render correctly with an environment value provided without mocks', () => {
    const { getByText, container } = render(
      <TestWrapper>
        <ServiceEnvironmentInputSet
          serviceValue={''}
          environmentValue={{ label: 'Environment 1', value: 'env-1' }}
          onChange={onChangeMock}
          isReadOnlyInputSet={false}
        />
      </TestWrapper>
    )
    expect(getByText('cv.monitoredServices.serviceAndEnvironment')).toBeInTheDocument()
    expect(container.querySelector('[title="addEnv"]')).toBeInTheDocument()
  })

  test('should render correctly with an environment value provided when ff is enabled', () => {
    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      CDS_OrgAccountLevelServiceEnvEnvGroup: true
    })
    const { getByText, rerender } = render(
      <TestWrapper>
        <ServiceEnvironmentInputSet
          serviceValue={''}
          environmentValue={'env-1'}
          onChange={onChangeMock}
          isReadOnlyInputSet={false}
        />
      </TestWrapper>
    )
    expect(getByText('cv.monitoredServices.serviceAndEnvironment')).toBeInTheDocument()

    rerender(
      <TestWrapper>
        <ServiceEnvironmentInputSet serviceValue={'svc-1'} onChange={onChangeMock} isReadOnlyInputSet={false} />
      </TestWrapper>
    )
    rerender(
      <TestWrapper>
        <ServiceEnvironmentInputSet environmentValue={'svc-1'} onChange={onChangeMock} isReadOnlyInputSet={false} />
      </TestWrapper>
    )
  })

  test('should render when ff CDS_OrgAccountLevelServiceEnvEnvGroup is true', async () => {
    const onInputSetChangeMock = jest.fn()
    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      CDS_OrgAccountLevelServiceEnvEnvGroup: true
    })
    const { container, getByTestId } = render(
      <TestWrapper>
        <ServiceEnvironmentInputSet
          serviceValue={'service-1'}
          environmentValue={'env-1'}
          onChange={onInputSetChangeMock}
          isReadOnlyInputSet={false}
        />
      </TestWrapper>
    )
    expect(container.querySelector('[title="On Service Select"]')).toBeInTheDocument()
    expect(container.querySelector('[title="On Environment Select"]')).toBeInTheDocument()
    act(() => {
      userEvent.click(container.querySelector('[title="On Service Select"]')!)
    })
    expect(onInputSetChangeMock).toHaveBeenCalledWith('serviceRef', 'newService')
    act(() => {
      userEvent.click(container.querySelector('[title="On Environment Select"]')!)
    })
    expect(onInputSetChangeMock).toHaveBeenNthCalledWith(2, 'environmentRef', 'newEnv')

    expect(getByTestId('OrgAccountLevelServiceEnvField')).toBeInTheDocument()
  })
})
