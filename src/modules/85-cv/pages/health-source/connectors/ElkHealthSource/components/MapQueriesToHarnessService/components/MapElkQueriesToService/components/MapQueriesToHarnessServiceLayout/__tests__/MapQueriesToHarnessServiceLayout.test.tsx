/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { FormikForm } from '@wings-software/uicore'
import { Formik } from 'formik'
import { TestWrapper } from '@common/utils/testUtils'
import { mockedElkIndicesData } from '@cv/pages/health-source/connectors/ElkHealthSource/__tests__/ElkHealthSource.mock'
import MapQueriesToHarnessServiceLayout from '../MapQueriesToHarnessServiceLayout'
import type { MapQueriesToHarnessServiceLayoutProps } from '../MapQueriesToHarnessServiceLayout.types'
import { mockedELKSampleData } from './MapQueriesToHarnessServiceLayout.mocks'

const WrapperComponent = (props: MapQueriesToHarnessServiceLayoutProps): JSX.Element => {
  return (
    <TestWrapper
      pathParams={{
        accountId: '1234_accountId',
        projectIdentifier: '1234_project',
        orgIdentifier: '1234_ORG'
      }}
    >
      <Formik initialValues={props.formikProps.initialValues} onSubmit={jest.fn()}>
        <FormikForm>
          <MapQueriesToHarnessServiceLayout {...props} />
        </FormikForm>
      </Formik>
    </TestWrapper>
  )
}

jest.mock('services/cv', () => ({
  useGetELKSavedSearches: jest.fn().mockImplementation(() => ({
    data: [],
    refetch: jest.fn()
  })),
  useGetELKLogSampleData: jest.fn().mockImplementation(() => ({
    data: mockedELKSampleData,
    loading: false,
    error: null,
    refetch: jest.fn(),
    mutate: jest.fn(() => Promise.resolve(mockedELKSampleData))
  })),
  useGetELKIndices: jest.fn().mockImplementation(() => ({
    data: mockedElkIndicesData,
    loading: false,
    error: null,
    refetch: jest.fn()
  })),
  useGetTimeFormat: jest.fn().mockImplementation(() => ({
    data: [],
    loading: false,
    error: null,
    refetch: jest.fn()
  }))
}))

describe('Unit tests for MapQueriesToHarnessServiceLayout', () => {
  const initialProps = {
    formikProps: {
      initialValues: {
        metricName: 'ELK Logs Query',
        query: '',
        serviceInstance: ''
      }
    },
    connectorIdentifier: 'Test',
    onChange: jest.fn()
  }
  test('Verify that records are fetched when fetch records button is clicked', async () => {
    const { getByText } = render(
      <WrapperComponent
        {...{
          ...initialProps,
          formikProps: {
            ...initialProps.formikProps,
            values: { query: 'queerytt', logIndexes: 'test' }
          }
        }}
      />
    )
    // When query is empty initially then fetch records button should be disabled
    const fetchRecordsButton = getByText('cv.monitoringSources.gcoLogs.fetchRecords')
    await waitFor(() => expect(fetchRecordsButton).not.toBeNull())

    await waitFor(() => expect(fetchRecordsButton).not.toBeNull())
    fireEvent.click(fetchRecordsButton)

    //Verify if record are present
    await waitFor(() => expect(getByText('cv.monitoringSources.gcoLogs.records')).not.toBeNull())
  })

  test('Verify that records are fetched automatically when query is prefilled in edit flow', async () => {
    const propsWhenQueryIsPresent = {
      formikProps: {
        initialValues: {
          metricName: 'ELK Logs Query',
          query: 'Test',
          serviceInstance: ''
        }
      },
      connectorIdentifier: 'Test',
      onChange: jest.fn()
    }
    const { getByText } = render(<WrapperComponent {...propsWhenQueryIsPresent} />)

    //Verify if records are present
    await waitFor(() => expect(getByText('cv.monitoringSources.gcoLogs.records')).not.toBeNull())
  })
})
