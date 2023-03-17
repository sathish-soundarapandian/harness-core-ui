/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, screen, act } from '@testing-library/react'
import { Form, Formik } from 'formik'
import type { UseGetReturn } from 'restful-react'
import userEvent from '@testing-library/user-event'
import { Button, Container } from '@harness/uicore'
import * as FeatureFlag from '@common/hooks/useFeatureFlag'
import * as cdService from 'services/cd-ng'
import { TestWrapper } from '@common/utils/testUtils'
import CreateMonitoredServiceFromSLO from '../CreateMonitoredServiceFromSLO'
import { initialFormData } from '../CreateMonitoredServiceFromSLO.constants'

function WrapperComponent(props: { initialValues: any }): JSX.Element {
  const { initialValues } = props
  const fetchingMonitoredServices = jest.fn()
  const hideModal = jest.fn()

  return (
    <TestWrapper>
      <Formik enableReinitialize={true} initialValues={initialValues} onSubmit={jest.fn()}>
        {formikProps => {
          return (
            <Form>
              <CreateMonitoredServiceFromSLO
                monitoredServiceFormikProps={formikProps}
                setFieldForSLOForm={formikProps.setFieldValue}
                hideModal={hideModal}
                fetchingMonitoredServices={fetchingMonitoredServices}
              />
            </Form>
          )
        }}
      </Formik>
    </TestWrapper>
  )
}

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

jest.mock('services/cv', () => ({
  useCreateDefaultMonitoredService: jest.fn().mockImplementation(() => ({
    error: null,
    loading: false,
    mutate: jest.fn().mockImplementation(() => {
      return {
        metaData: {},
        resource: {},
        responseMessages: []
      }
    })
  }))
}))

jest.mock('@cv/components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment', () => ({
  ...jest.requireActual('@cv/components/HarnessServiceAndEnvironment/HarnessServiceAndEnvironment'),
  HarnessEnvironmentAsFormField: function Mock(props: any) {
    return (
      <div className={props.environmentProps.className}>
        <button
          className="newEnv"
          onClick={() => props.environmentProps.onNewCreated({ name: 'newEnv', identifier: 'newEnv' })}
        />
        <button
          className="changeEnv"
          onClick={() => props.environmentProps.onSelect({ name: 'env2', identifier: 'env2' })}
        />
        <p>{props.environmentProps.item?.label}</p>
      </div>
    )
  },
  HarnessServiceAsFormField: function Mock(props: any) {
    return (
      <div className={props.serviceProps.className}>
        <button
          className="newService"
          onClick={() => props.serviceProps.onNewCreated({ name: 'newService', identifier: 'newService' })}
        />
        <button
          className="changeService"
          onClick={() => props.serviceProps.onSelect({ name: 'service2', identifier: 'service2' })}
        />
        <p>{props.serviceProps.item?.label}</p>
      </div>
    )
  }
}))

describe('Test CreateMonitoredServiceFromSLO component', () => {
  beforeEach(() => {
    jest
      .spyOn(cdService, 'useGetServiceListForProject')
      .mockReturnValue({ data: { data: { content: [{ identifier: 'service1', name: 'service1' }] } } } as UseGetReturn<
        any,
        any,
        any,
        any
      >)
    jest
      .spyOn(cdService, 'useGetEnvironmentListForProject')
      .mockReturnValue({ data: { data: { content: [{ identifier: 'env1', name: 'env1' }] } } } as UseGetReturn<
        any,
        any,
        any,
        any
      >)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should render CreateMonitoredServiceFromSLO component', async () => {
    const { getByText } = render(<WrapperComponent initialValues={initialFormData} />)
    expect(getByText('save')).toBeInTheDocument()
    expect(getByText('cancel')).toBeInTheDocument()
  })

  test('should be able to create monitored service from given service and env.', async () => {
    const { container, getByText } = render(<WrapperComponent initialValues={initialFormData} />)
    expect(container.getElementsByClassName('newEnv').length).toBe(1)
    expect(container.getElementsByClassName('newService').length).toBe(1)
    userEvent.click(getByText('save'))
    await waitFor(() => expect(getByText('cv.monitoredServices.monitoredServiceCreated')).toBeInTheDocument())
  })

  test('should close the modal when cancel is clicked', async () => {
    const { getByText } = render(<WrapperComponent initialValues={initialFormData} />)
    userEvent.click(getByText('cancel'))
    await waitFor(() => expect(screen.queryByText('cv.slos.monitoredServiceText')).not.toBeInTheDocument())
  })

  test('should add and change service and environment', async () => {
    const { container } = render(<WrapperComponent initialValues={initialFormData} />)
    act(() => {
      userEvent.click(container.querySelector('[class="newService"]')!)
    })
    act(() => {
      userEvent.click(container.querySelector('[class="changeService"]')!)
    })

    expect(container.querySelector('[class="newService"]')).toBeInTheDocument()
    expect(container.querySelector('[class="changeService"]')).toBeInTheDocument()

    act(() => {
      userEvent.click(container.querySelector('[class="newEnv"]')!)
    })
    act(() => {
      userEvent.click(container.querySelector('[class="changeEnv"]')!)
    })
    expect(container.querySelector('[class="newEnv"]')).toBeInTheDocument()
    expect(container.querySelector('[class="changeEnv"]')).toBeInTheDocument()
  })

  test('should render when ff CDS_OrgAccountLevelServiceEnvEnvGroup is true', () => {
    jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
      CDS_OrgAccountLevelServiceEnvEnvGroup: true
    })
    const { container, getByTestId, rerender } = render(<WrapperComponent initialValues={initialFormData} />)

    rerender(
      <WrapperComponent
        initialValues={{
          serviceRef: 'service1',
          environmentRef: 'environment1',
          type: 'Application'
        }}
      />
    )
    expect(container.querySelector('[title="On Service Select"]')).toBeInTheDocument()
    expect(container.querySelector('[title="On Environment Select"]')).toBeInTheDocument()
    act(() => {
      userEvent.click(container.querySelector('[title="On Service Select"]')!)
    })
    act(() => {
      userEvent.click(container.querySelector('[title="On Environment Select"]')!)
    })
    expect(getByTestId('OrgAccountLevelServiceEnvField')).toBeInTheDocument()
  })
})
