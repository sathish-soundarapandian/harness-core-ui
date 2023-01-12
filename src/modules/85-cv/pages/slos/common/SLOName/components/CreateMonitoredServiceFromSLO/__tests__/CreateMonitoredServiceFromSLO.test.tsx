/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, screen } from '@testing-library/react'
import { Form, Formik } from 'formik'
import type { UseGetReturn } from 'restful-react'
import userEvent from '@testing-library/user-event'
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
              ></CreateMonitoredServiceFromSLO>
            </Form>
          )
        }}
      </Formik>
    </TestWrapper>
  )
}

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
          onClick={() => props.environmentProps.onNewCreated({ name: 'env2', identifier: 'env2' })}
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
          onClick={() => props.serviceProps.onNewCreated({ name: 'service2', identifier: 'service2' })}
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
})
