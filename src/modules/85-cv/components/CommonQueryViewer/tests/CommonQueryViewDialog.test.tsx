/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { FormikForm } from '@harness/uicore'
import { Formik } from 'formik'
import * as cvService from 'services/cv'
import CommonHealthSourceProvider from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/components/CommonHealthSourceContext/CommonHealthSourceContext'
import type { HealthSourceConfig } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import { commonHealthSourceProviderPropsMock } from '@cv/components/CommonMultiItemsSideNav/tests/CommonMultiItemsSideNav.mock'
import { TestWrapper } from '@common/utils/testUtils'
import type { CommonQueryViewerProps } from '../types'
import { CommonQueryViewer } from '../CommonQueryViewer'
import { getRunQueryButtonTooltip } from '../components/CommonQueryContent/CommonQueryContent.utils'

function WrapperComponent(props: CommonQueryViewerProps): any {
  return (
    <TestWrapper>
      <CommonHealthSourceProvider {...commonHealthSourceProviderPropsMock}>
        <Formik initialValues={{}} onSubmit={jest.fn()}>
          <FormikForm>
            <CommonQueryViewer {...props} />
          </FormikForm>
        </Formik>
      </CommonHealthSourceProvider>
    </TestWrapper>
  )
}

const getString = (key: any): any => {
  return key
}

describe('Unit tests for CommonQueryViewer ', () => {
  test('Verify if fetch records call is made when user submits the query', async () => {
    jest.spyOn(cvService, 'useGetStackdriverLogSampleData').mockReturnValue({} as any)
    const fetchRecordsMock = jest.fn()
    const { getByText } = render(
      <WrapperComponent
        healthSourceConfig={{} as HealthSourceConfig}
        fetchRecords={fetchRecordsMock}
        query={'Test'}
        loading={false}
        error={null}
      />
    )

    const fetchRecordsButton = await waitFor(() => getByText('cv.monitoringSources.commonHealthSource.runQuery'))
    expect(fetchRecordsButton).not.toBeNull()

    act(() => {
      fireEvent.click(fetchRecordsButton)
    })
    expect(fetchRecordsMock).toHaveBeenCalledTimes(1)
  })

  test('Verify that fetchRecordsButton is disabled if loading is true', async () => {
    jest.spyOn(cvService, 'useGetStackdriverLogSampleData').mockReturnValue({} as any)
    const fetchRecordsMock = jest.fn()
    const { getByText } = render(
      <WrapperComponent
        healthSourceConfig={{} as HealthSourceConfig}
        fetchRecords={fetchRecordsMock}
        query={'Test'}
        loading={true}
        error={null}
      />
    )
    const fetchRecordsButton = await waitFor(() => getByText('cv.monitoringSources.commonHealthSource.runQuery'))

    expect(fetchRecordsButton).not.toBeNull()

    expect(fetchRecordsButton.closest('button')).toBeDisabled()
  })

  test('Ensure dialog opens when expand icon is clicked', async () => {
    jest.spyOn(cvService, 'useGetStackdriverLogSampleData').mockReturnValue({} as any)
    const fetchRecordsMock = jest.fn()
    const { container } = render(
      <WrapperComponent
        healthSourceConfig={{} as HealthSourceConfig}
        fetchRecords={fetchRecordsMock}
        query={'Test'}
        loading={false}
        error={null}
      />
    )

    // click on expand query dialog icon.
    act(() => {
      fireEvent.click(container.querySelector('[data-icon="fullscreen"]')!)
    })
    await waitFor(() => expect(document.body.querySelector('[class*="queryViewDialog"]')).not.toBeNull())
    expect(document.body.querySelector(`[class*="queryViewDialog"] textarea`)).not.toBeNull()

    fireEvent.click(document.body)
    await waitFor(() => expect(container.querySelector('[class*="queryViewDialog"]')).toBeNull())
  })

  test('validate getRunQueryButtonTooltip utils give correct tooltip message for runQuery Button when both Query and QueryField are not present', async () => {
    const query = ''
    const isQueryFieldNotPresent = true
    const queryFieldIdentifier = 'index'
    expect(getRunQueryButtonTooltip(query, isQueryFieldNotPresent, queryFieldIdentifier, getString)).toEqual(
      'cv.monitoringSources.commonHealthSource.query.enterQueryAndQueryField'
    )
  })

  test('validate getRunQueryButtonTooltip utils give correct tooltip message for runQuery Button when query is not present but QueryField is selected', async () => {
    const query = ''
    const isQueryFieldNotPresent = false
    const queryFieldIdentifier = 'index'
    expect(getRunQueryButtonTooltip(query, isQueryFieldNotPresent, queryFieldIdentifier, getString)).toEqual(
      'cv.monitoringSources.commonHealthSource.query.enterQuery'
    )
  })

  test('validate getRunQueryButtonTooltip utils give correct tooltip message for runQuery Button when both Query and QueryField are not present', async () => {
    const query = ''
    const isQueryFieldNotPresent = true
    const queryFieldIdentifier = 'index'
    expect(getRunQueryButtonTooltip(query, isQueryFieldNotPresent, queryFieldIdentifier, getString)).toEqual(
      'cv.monitoringSources.commonHealthSource.query.enterQueryAndQueryField'
    )
  })

  test('validate getRunQueryButtonTooltip utils should not display and tooltip message for runQuery Button when both Query and QueryField are  present', async () => {
    const query = 'query-1'
    const isQueryFieldNotPresent = false
    const queryFieldIdentifier = 'index'
    expect(getRunQueryButtonTooltip(query, isQueryFieldNotPresent, queryFieldIdentifier, getString)).toEqual('')
  })
})
