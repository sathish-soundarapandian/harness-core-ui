/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import userEvent from '@testing-library/user-event'
import { act, render } from '@testing-library/react'
import { Container, Button } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import * as ServiceModal from '@cd/components/PipelineSteps/DeployServiceStep/NewEditServiceModal'
import * as MultiTypeServiceField from '@pipeline/components/FormMultiTypeServiceFeild/FormMultiTypeServiceFeild'
import * as MultiTypeEnvironmentField from '@pipeline/components/FormMultiTypeEnvironmentField/FormMultiTypeEnvironmentField'
import OrgAccountLevelServiceEnvField from '../OrgAccountLevelServiceEnvField'

const serviceOnSelect = jest.fn()
const environmentOnSelect = jest.fn()

jest.mock('services/cd-ng', () => ({
  useCreateServiceV2: jest.fn().mockReturnValue({
    mutate: jest
      .fn()
      .mockResolvedValue({ status: 'SUCCESS', data: { service: { identifier: 'svc_4', name: 'Service 4' } } })
  }),
  useUpdateServiceV2: jest.fn().mockReturnValue({ mutate: jest.fn().mockResolvedValue({ status: 'SUCCESS' }) }),
  useGetEntityYamlSchema: jest.fn().mockReturnValue({ data: { data: {} } }),
  useUpsertServiceV2: jest.fn().mockImplementation(() => ({
    cancel: jest.fn(),
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      return {
        status: 'SUCCESS'
      }
    })
  })),
  useGetYamlSchema: jest.fn().mockImplementation(() => {
    return { refetch: jest.fn(), error: null, loading: false }
  })
}))

jest.mock('@pipeline/components/FormMultiTypeEnvironmentField/FormMultiTypeEnvironmentField', () => ({
  __esModule: true,
  MultiTypeEnvironmentField: function MockComponent(props: any) {
    return (
      <Container>
        <Button className="addNewEnvironment" onClick={() => props.openAddNewModal()} title="Add New Environment" />
        <Button className="onChangeEnvironment" onClick={() => props.onChange('env1')} title="On Change Environment" />
      </Container>
    )
  }
}))

jest.mock('@pipeline/components/FormMultiTypeServiceFeild/FormMultiTypeServiceFeild', () => ({
  __esModule: true,
  MultiTypeServiceField: function MockComponent(props: any) {
    return (
      <Container>
        <Button className="addNewService" onClick={() => props.openAddNewModal()} title="Add New Service" />
        <Button className="onChangeService" onClick={() => props.onChange('service1')} title="On Change Service" />
      </Container>
    )
  }
}))

describe('OrgAccountLevelServiceEnvField', () => {
  test('should render OrgAccountLevelServiceEnvField with isTemplate true', async () => {
    jest.spyOn(MultiTypeServiceField, 'MultiTypeServiceField').mockImplementation((props: any) => {
      return (
        <Container>
          <Button className="addNewService" onClick={() => props.openAddNewModal()} title="Add New Service" />
          <Button
            className="onChangeService"
            onClick={() => props.onChange({ label: 'service1', value: 'org.service1', scope: 'org' })}
            title="On Change Service"
          />
        </Container>
      )
    })
    jest.spyOn(MultiTypeEnvironmentField, 'MultiTypeEnvironmentField').mockImplementation((props: any) => {
      return (
        <Container>
          <Button className="addNewEnvironment" onClick={() => props.openAddNewModal()} title="Add New Environment" />
          <Button
            className="onChangeEnvironment"
            onClick={() => props.onChange({ label: 'env1', value: 'org.env1', scope: 'org' })}
            title="On Change Environment"
          />
        </Container>
      )
    })
    const { container } = render(
      <TestWrapper>
        <OrgAccountLevelServiceEnvField
          isTemplate
          serviceOnSelect={serviceOnSelect}
          environmentOnSelect={environmentOnSelect}
        />
      </TestWrapper>
    )

    await act(() => {
      userEvent.click(container.querySelector('[title="Add New Service"]')!)
    })
    await act(() => {
      userEvent.click(container.querySelector('[title="On Change Service"]')!)
    })
    expect(serviceOnSelect).toHaveBeenCalledWith({
      label: 'org.service1',
      value: 'org.service1'
    })

    expect(container.querySelector('[title="Add New Environment"]')).toBeInTheDocument()
    await act(() => {
      userEvent.click(container.querySelector('[title="On Change Environment"]')!)
    })
    expect(environmentOnSelect).toHaveBeenCalledWith({
      label: 'org.env1',
      value: 'org.env1'
    })
  })

  test('should render OrgAccountLevelServiceEnvField with isTemplate false', async () => {
    const { container } = render(
      <TestWrapper>
        <OrgAccountLevelServiceEnvField
          isTemplate={false}
          serviceOnSelect={serviceOnSelect}
          environmentOnSelect={environmentOnSelect}
        />
      </TestWrapper>
    )
    jest.spyOn(MultiTypeServiceField, 'MultiTypeServiceField').mockImplementation((props: any) => {
      return (
        <Container>
          <Button className="addNewService" onClick={() => props.openAddNewModal()} title="Add New Service" />
          <Button
            className="onChangeService"
            onClick={() => props.onChange({ name: 'service1' })}
            title="On Change Service"
          />
        </Container>
      )
    })
    jest.spyOn(MultiTypeEnvironmentField, 'MultiTypeEnvironmentField').mockImplementation((props: any) => {
      return (
        <Container>
          <Button className="addNewEnvironment" onClick={() => props.openAddNewModal()} title="Add New Environment" />
          <Button
            className="onChangeEnvironment"
            onClick={() => props.onChange({ name: 'env1' })}
            title="On Change Environment"
          />
        </Container>
      )
    })
    await act(() => {
      userEvent.click(container.querySelector('[title="Add New Service"]')!)
    })
    await act(() => {
      userEvent.click(container.querySelector('[title="On Change Service"]')!)
    })
    expect(serviceOnSelect).toHaveBeenCalledWith({ name: 'service1' })
    await act(() => {
      userEvent.click(container.querySelector('[title="On Change Environment"]')!)
    })
    expect(environmentOnSelect).toHaveBeenCalledWith({ name: 'env1' })
  })

  test('should validate service modal', async () => {
    jest.spyOn(MultiTypeServiceField, 'MultiTypeServiceField').mockImplementation((props: any) => {
      return (
        <Container>
          <Button className="addNewService" onClick={() => props.openAddNewModal()} title="Add New Service" />
          <Button
            className="onChangeService"
            onClick={() => props.onChange({ name: 'service1' })}
            title="On Change Service"
          />
        </Container>
      )
    })
    jest.spyOn(ServiceModal, 'NewEditServiceModal').mockImplementation((props: any) => {
      return (
        <Container>
          <Button
            onClick={() =>
              props.onCreateOrUpdate({
                name: 'service1',
                identifier: 'service1'
              })
            }
            title="create Service"
          />
        </Container>
      )
    })
    const { container } = render(
      <TestWrapper>
        <OrgAccountLevelServiceEnvField
          isTemplate={false}
          serviceOnSelect={serviceOnSelect}
          environmentOnSelect={environmentOnSelect}
        />
      </TestWrapper>
    )
    await act(() => {
      userEvent.click(container.querySelector('[title="Add New Service"]')!)
    })
    await act(() => {
      userEvent.click(document.querySelector('[title="create Service"]')!)
    })
    expect(serviceOnSelect).toHaveBeenCalledWith({
      label: 'service1',
      value: 'service1'
    })
  })

  test('should validate environment modal', async () => {
    jest.spyOn(MultiTypeEnvironmentField, 'MultiTypeEnvironmentField').mockImplementation((props: any) => {
      return (
        <Container>
          <Button className="addNewEnvironment" onClick={() => props?.openAddNewModal()} title="Add New Environment" />
          <Button
            className="onChangeEnvironment"
            onClick={() => props.onChange({ name: 'env1' })}
            title="On Change Environment"
          />
        </Container>
      )
    })
    jest
      .spyOn(
        jest.requireActual('@cd/components/PipelineSteps/DeployEnvironmentEntityStep/AddEditEnvironmentModal'),
        'default'
      )
      .mockImplementation((props: any) => {
        return (
          <Container>
            <Button
              onClick={() =>
                props.onCreateOrUpdate({
                  name: 'Environment1',
                  identifier: 'Environment1'
                })
              }
              title="create Environment"
            />
          </Container>
        )
      })
    const { container } = render(
      <TestWrapper>
        <OrgAccountLevelServiceEnvField
          isTemplate={false}
          serviceOnSelect={serviceOnSelect}
          environmentOnSelect={environmentOnSelect}
        />
      </TestWrapper>
    )
    await act(() => {
      userEvent.click(container.querySelector('[title="Add New Environment"]')!)
    })
    await act(() => {
      userEvent.click(document.querySelector('[title="create Environment"]')!)
    })
    expect(environmentOnSelect).toHaveBeenCalledWith({
      label: 'Environment1',
      value: 'Environment1'
    })
  })
})
