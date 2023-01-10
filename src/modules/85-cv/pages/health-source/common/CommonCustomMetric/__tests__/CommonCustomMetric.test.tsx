/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { Formik, FormInput } from '@harness/uicore'
import { fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import { TestWrapper } from '@common/utils/testUtils'
import CommonHealthSourceProvider from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/components/CommonHealthSourceContext/CommonHealthSourceContext'
import CustomMetric from '../CommonCustomMetric'
import { initGroupedCreatedMetrics, initializeSelectedMetricsMap } from '../CommonCustomMetric.utils'
import { commonHealthSourceProviderPropsMock2, updateParentFormikMock } from './CommonCustomMetric.mock'

const WrapperComponent = () => {
  const INIT = { metricName: 'Metric Name', groupName: { label: 'Group 1', value: 'Group 1' } }
  const customMetricsMap = new Map()
  customMetricsMap.set('Metric Name', INIT)

  const { selectedMetric, mappedMetrics } = initializeSelectedMetricsMap(
    'cv.monitoringSources.appD.defaultAppDMetricName',
    INIT as any,
    customMetricsMap
  )
  const formInit = mappedMetrics.get(selectedMetric)

  return (
    <CommonHealthSourceProvider {...commonHealthSourceProviderPropsMock2}>
      <Formik initialValues={formInit} onSubmit={jest.fn()} formName="runtimeInputsTest">
        {formik => {
          const createdMetrics = Array.from(customMetricsMap?.keys()) || ['health source metric']
          const groupedCreatedMetrics = initGroupedCreatedMetrics(customMetricsMap, str => str)
          return (
            <CustomMetric
              selectedMetric={selectedMetric}
              formikValues={formik.values as any}
              mappedMetrics={customMetricsMap}
              createdMetrics={createdMetrics}
              groupedCreatedMetrics={groupedCreatedMetrics}
              defaultMetricName={'appdMetric'}
              tooptipMessage={'cv.monitoringSources.gcoLogs.addQueryTooltip'}
              addFieldLabel={'cv.monitoringSources.addMetric'}
              initCustomForm={INIT as any}
              shouldBeAbleToDeleteLastMetric
              openEditMetricModal={jest.fn()}
            >
              <>
                <FormInput.Text name={'metricName'} />
                <FormInput.Select
                  name={'groupName'}
                  items={[
                    { label: 'Group 1', value: 'Group 1' },
                    { label: 'Group 2', value: 'Group 2' }
                  ]}
                />
              </>
            </CustomMetric>
          )
        }}
      </Formik>
    </CommonHealthSourceProvider>
  )
}

describe('Test case', () => {
  test('should validate Remove Add and Edit', async () => {
    const { container, getByText, getAllByTestId, getByTestId } = render(
      <TestWrapper>
        <WrapperComponent />
      </TestWrapper>
    )

    fireEvent.click(getByText('cv.monitoringSources.addMetric'))

    await fillAtForm([
      {
        container,
        type: InputTypes.TEXTFIELD,
        fieldId: 'metricName',
        value: 'New Metric Name'
      },
      {
        container,
        type: InputTypes.SELECT,
        fieldId: 'groupName',
        value: 'Group 2' //{ label: 'Group 2', value: 'Group 2' } as any
      }
    ])

    expect(updateParentFormikMock).toHaveBeenCalled()
    await waitFor(() => expect(getAllByTestId('sideNav-options').length).toEqual(1))
    const metricSideNav = getAllByTestId('sideNav-options')[0]

    metricSideNav.click()
    await waitFor(() => expect(getByTestId('sideNav-delete')).toBeInTheDocument())
    await waitFor(() => expect(getByTestId('sideNav-edit')).toBeInTheDocument())

    // should be able to click on edit and delete icons
    const deleteBtn = getByTestId('sideNav-delete')
    deleteBtn.click()

    const editBtn = getByTestId('sideNav-edit')
    editBtn.click()
  })
})
