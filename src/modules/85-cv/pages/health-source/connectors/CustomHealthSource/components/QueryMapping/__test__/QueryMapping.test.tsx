/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import type { UseGetReturn } from 'restful-react'
import { Formik, FormikForm } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { QueryType } from '@cv/pages/health-source/common/HealthSourceQueryType/HealthSourceQueryType.types'
import * as cvServices from 'services/cv'
import * as cdServices from 'services/cd-ng'
import QueryMapping from '../QueryMapping'
import { mocksampledata } from '../../../__tests__/CustomHealthSource.mock'
import type { QueryMappingInterface } from '../QueryMapping.types'
import { connectorIdentifierMock } from './QueryMapping.mock'

const SampleComponent: React.FC<Omit<QueryMappingInterface, 'formValue'>> = (
  props: Omit<QueryMappingInterface, 'formValue'>
) => {
  return (
    <TestWrapper
      path="/:orgIdentifier/:accountId/:projectIdentifier/"
      pathParams={{
        accountId: 'accountId',
        orgIdentifier: 'orgIdentifier',
        projectIdentifier: 'projectIdentifier'
      }}
    >
      <Formik formName="test" initialValues={{}} onSubmit={jest.fn()}>
        {formikProps => (
          <FormikForm>
            <QueryMapping
              {...{
                ...props,
                // onFieldChange: formikProps.setFieldValue,
                onValueChange: formikProps.setValues,
                formValue: formikProps.values as any
              }}
            />
            <button type="submit" data-testid={'submitButtonJest'} />
          </FormikForm>
        )}
      </Formik>
    </TestWrapper>
  )
}

const onFetchRecordsSuccess = jest.fn()
const setLoading = jest.fn()
describe('Validate MapMetricsToServices conponent', () => {
  let useGetConnectorMock: jest.SpyInstance<
    UseGetReturn<
      cdServices.ResponseConnectorResponse,
      cdServices.Failure | cdServices.Error,
      cdServices.GetConnectorQueryParams,
      unknown
    >,
    [cdServices.UseGetConnectorProps]
  >
  beforeEach(() => {
    jest
      .spyOn(cvServices, 'useFetchSampleData')
      .mockReturnValue({ loading: false, error: null, mutate: jest.fn() } as any)
    useGetConnectorMock = jest
      .spyOn(cdServices, 'useGetConnector')
      .mockReturnValue({ loading: false, error: null, data: {} } as any)
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  test('should render MapMetricsToServices', () => {
    const { container } = render(
      <SampleComponent
        connectorIdentifier={'customConn'}
        onFetchRecordsSuccess={onFetchRecordsSuccess}
        isQueryExecuted={true}
        recordsData={mocksampledata as any}
        setLoading={setLoading}
        onFieldChange={jest.fn()}
        onValueChange={jest.fn()}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('should render MapMetricsToServices in editMode', () => {
    const { container } = render(
      <SampleComponent
        connectorIdentifier={'customConn'}
        onFetchRecordsSuccess={onFetchRecordsSuccess}
        isQueryExecuted={true}
        recordsData={mocksampledata as any}
        setLoading={setLoading}
        onFieldChange={jest.fn()}
        onValueChange={jest.fn()}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('ensure behavior is correct whhen changing queryType', async () => {
    const { container } = render(
      <SampleComponent
        connectorIdentifier={'customConn'}
        onFetchRecordsSuccess={onFetchRecordsSuccess}
        isQueryExecuted={true}
        recordsData={mocksampledata as any}
        setLoading={setLoading}
        onFieldChange={jest.fn()}
        onValueChange={jest.fn()}
      />
    )

    await waitFor(() =>
      expect(useGetConnectorMock).toHaveBeenCalledWith({
        identifier: 'customConn',
        lazy: false,
        queryParams: {
          accountIdentifier: 'accountId',
          orgIdentifier: 'orgIdentifier',
          projectIdentifier: 'projectIdentifier'
        }
      })
    )

    await waitFor(() => expect(container.querySelector(`[value="${QueryType.HOST_BASED}"]`)).not.toBeNull())
    fireEvent.click(container.querySelector(`[value="${QueryType.SERVICE_BASED}"]`)!)
    await waitFor(() =>
      expect(container.querySelector(`[value="${QueryType.SERVICE_BASED}"]`)?.getAttribute('checked')).not.toBeNull()
    )
    fireEvent.click(container.querySelector(`[value="${QueryType.HOST_BASED}"]`)!)
    await waitFor(() =>
      expect(container.querySelector(`[value="${QueryType.HOST_BASED}"]`)?.getAttribute('checked')).not.toBeNull()
    )
  })

  test('should test correct connectorRef has been passed as a query param during templates', async () => {
    render(
      <SampleComponent
        connectorIdentifier={connectorIdentifierMock as unknown as string}
        onFetchRecordsSuccess={onFetchRecordsSuccess}
        isQueryExecuted={true}
        recordsData={mocksampledata as any}
        setLoading={setLoading}
        onFieldChange={jest.fn()}
        onValueChange={jest.fn()}
      />
    )

    await waitFor(() =>
      expect(useGetConnectorMock).toHaveBeenCalledWith({
        identifier: 'customELK',
        lazy: false,
        queryParams: {
          accountIdentifier: 'accountId'
        }
      })
    )
  })

  test('should hide the baseURL field if connector is runtime', async () => {
    render(
      <SampleComponent
        connectorIdentifier="<+input>"
        onFetchRecordsSuccess={onFetchRecordsSuccess}
        isQueryExecuted={true}
        recordsData={mocksampledata as any}
        setLoading={setLoading}
        onFieldChange={jest.fn()}
        onValueChange={jest.fn()}
      />
    )

    await waitFor(() =>
      expect(useGetConnectorMock).toHaveBeenCalledWith({
        identifier: '<+input>',
        lazy: true,
        queryParams: {
          accountIdentifier: 'accountId',
          orgIdentifier: 'orgIdentifier',
          projectIdentifier: 'projectIdentifier'
        }
      })
    )

    await waitFor(() => expect(screen.queryByTestId(/baseURL/)).not.toBeInTheDocument())
  })

  test('should hide the baseURL field if connector is expression', async () => {
    render(
      <SampleComponent
        connectorIdentifier="<+myVariable>"
        onFetchRecordsSuccess={onFetchRecordsSuccess}
        isQueryExecuted={true}
        recordsData={mocksampledata as any}
        setLoading={setLoading}
        onFieldChange={jest.fn()}
        onValueChange={jest.fn()}
      />
    )

    await waitFor(() =>
      expect(useGetConnectorMock).toHaveBeenCalledWith({
        identifier: '<+myVariable>',
        lazy: true,
        queryParams: {
          accountIdentifier: 'accountId',
          orgIdentifier: 'orgIdentifier',
          projectIdentifier: 'projectIdentifier'
        }
      })
    )

    await waitFor(() => expect(screen.queryByTestId(/baseURL/)).not.toBeInTheDocument())
  })
})
