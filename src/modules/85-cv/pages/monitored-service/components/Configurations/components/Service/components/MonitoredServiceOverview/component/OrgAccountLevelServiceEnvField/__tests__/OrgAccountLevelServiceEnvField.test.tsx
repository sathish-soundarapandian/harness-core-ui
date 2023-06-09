/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import userEvent from '@testing-library/user-event'
import { act, render } from '@testing-library/react'
import { Container, Button, Formik } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import * as ServiceModal from '@cd/components/PipelineSteps/DeployServiceStep/NewEditServiceModal'
import * as MultiTypeServiceField from '@pipeline/components/FormMultiTypeServiceFeild/FormMultiTypeServiceFeild'
import * as MultiTypeEnvironmentField from '@pipeline/components/FormMultiTypeEnvironmentField/FormMultiTypeEnvironmentField'
import OrgAccountLevelServiceEnvField from '../OrgAccountLevelServiceEnvField'
import { DefaultShowServiceEnvironment } from '../OrgAccountLevelServiceEnvField.constants'
import { shouldShowServiceEnvironmentField, onValueChange } from '../OrgAccountLevelServiceEnvField.utils'
import type { OrgAccountLevelServiceEnvFieldProps } from '../OrgAccountLevelServiceEnvField.types'

const serviceOnSelect = jest.fn()
const environmentOnSelect = jest.fn()

const Wrapper = ({
  values,
  isInputSet,
  isTemplate,
  serviceOnSelect: serviceSelect,
  environmentOnSelect: environmentSelect
}: React.PropsWithChildren<
  OrgAccountLevelServiceEnvFieldProps & { values?: { serviceRef?: string | null; environmentRef?: string | null } }
>): React.ReactElement => {
  return (
    <TestWrapper>
      <Formik initialValues={{ ...values }} onSubmit={jest.fn()} formName="TestWrapper">
        {() => (
          <OrgAccountLevelServiceEnvField
            isInputSet={isInputSet}
            isTemplate={isTemplate}
            serviceOnSelect={serviceSelect}
            environmentOnSelect={environmentSelect}
          />
        )}
      </Formik>
    </TestWrapper>
  )
}

const serviceOption = {
  label: 'service1',
  scope: 'org',
  value: 'org.service1'
}
const envOptions = {
  label: 'env1',
  scope: 'org',
  value: 'org.env1'
}

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
      <Wrapper isTemplate serviceOnSelect={serviceOnSelect} environmentOnSelect={environmentOnSelect} />
    )

    await act(() => {
      userEvent.click(container.querySelector('[title="Add New Service"]')!)
    })
    await act(() => {
      userEvent.click(container.querySelector('[title="On Change Service"]')!)
    })
    expect(serviceOnSelect).toHaveBeenCalledWith({
      label: serviceOption,
      value: serviceOption
    })

    expect(container.querySelector('[title="Add New Environment"]')).toBeInTheDocument()
    await act(() => {
      userEvent.click(container.querySelector('[title="On Change Environment"]')!)
    })
    expect(environmentOnSelect).toHaveBeenCalledWith({
      label: envOptions,
      value: envOptions
    })
  })

  test('should render OrgAccountLevelServiceEnvField with isTemplate false', async () => {
    const { container } = render(
      <Wrapper isTemplate={false} serviceOnSelect={serviceOnSelect} environmentOnSelect={environmentOnSelect} />
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

  test('should render OrgAccountLevelServiceEnvField with isInputSet true', async () => {
    const { container } = render(
      <Wrapper
        isTemplate
        isInputSet
        values={{ serviceRef: null }}
        serviceOnSelect={serviceOnSelect}
        environmentOnSelect={environmentOnSelect}
      />
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
    expect(container.querySelector('[title="Add New Service"]')).toBeInTheDocument()
    expect(container.querySelector('[title="Add New Environment"]')).not.toBeInTheDocument()
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
      <Wrapper isTemplate={false} serviceOnSelect={serviceOnSelect} environmentOnSelect={environmentOnSelect} />
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
      <Wrapper isTemplate={false} serviceOnSelect={serviceOnSelect} environmentOnSelect={environmentOnSelect} />
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

  test('should validate multiSelect environment', () => {
    const onSuccess = jest.fn()
    const multiSelectEnv = [
      { label: 'env1', value: 'env1' },
      { label: 'env2', value: 'env2' }
    ]
    expect(onValueChange({ isTemplate: false, onSuccess, value: multiSelectEnv }))
    expect(onSuccess).toHaveBeenCalledWith(multiSelectEnv)
  })

  describe('shouldShowServiceEnvironmentField', () => {
    test('should return the default values when no arguments are passed', () => {
      const result = shouldShowServiceEnvironmentField({})
      expect(result).toEqual(DefaultShowServiceEnvironment)
    })

    test('should return service and env as false for undefined values', () => {
      const falseServiceAndEnv = { showEnvironment: false, showService: false }
      const noServiceAndEnv = shouldShowServiceEnvironmentField({ isInputSet: true })
      expect(noServiceAndEnv).toEqual(falseServiceAndEnv)
      const serviceWithNoEnv = shouldShowServiceEnvironmentField({ isInputSet: true, serviceRef: undefined })
      expect(serviceWithNoEnv).toEqual(falseServiceAndEnv)
      const envWithNoService = shouldShowServiceEnvironmentField({ isInputSet: true, environmentRef: undefined })
      expect(envWithNoService).toEqual(falseServiceAndEnv)
    })

    test('should return service and env for null values', () => {
      const serviceWithNoEnv = shouldShowServiceEnvironmentField({ isInputSet: true, serviceRef: null })
      expect(serviceWithNoEnv).toEqual({ showEnvironment: false, showService: true })
      const envWithNoService = shouldShowServiceEnvironmentField({ isInputSet: true, environmentRef: null })
      expect(envWithNoService).toEqual({ showEnvironment: true, showService: false })
    })

    test('should set showService and showEnvironment to true if both serviceRef and environmentRef are defined', () => {
      const result = shouldShowServiceEnvironmentField({
        isInputSet: true,
        serviceRef: 'service',
        environmentRef: 'environment'
      })
      expect(result).toEqual({ ...DefaultShowServiceEnvironment })
    })
  })
})
