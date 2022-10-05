/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor, act } from '@testing-library/react'
import { Formik, FormInput } from '@wings-software/uicore'
import { fillAtForm, InputTypes } from '@common/utils/JestFormHelper'
import { TestWrapper } from '@common/utils/testUtils'
import useGroupedSideNaveHook from '@cv/hooks/GroupedSideNaveHook/useGroupedSideNaveHook'
import CustomMetric from '../CustomMetric'

const WrapperComponent = () => {
  const INIT = { metricName: 'Metric Name', groupName: { label: 'Group 1', value: 'Group 1' } }
  const mappedServicesAndEnvs = new Map()
  mappedServicesAndEnvs.set('Metric Name', INIT)

  const {
    createdMetrics,
    mappedMetrics,
    selectedMetric,
    groupedCreatedMetrics,
    setMappedMetrics,
    setCreatedMetrics,
    setGroupedCreatedMetrics
  } = useGroupedSideNaveHook({
    defaultCustomMetricName: 'cv.monitoringSources.appD.defaultAppDMetricName',
    initCustomMetricData: INIT as any,
    mappedServicesAndEnvs
  })
  const formInit = mappedMetrics.get(selectedMetric)
  return (
    <Formik initialValues={formInit} onSubmit={jest.fn()} formName="runtimeInputsTest">
      {formik => {
        return (
          <CustomMetric
            isValidInput={true}
            setMappedMetrics={setMappedMetrics}
            selectedMetric={selectedMetric}
            formikValues={formik.values as any}
            mappedMetrics={mappedMetrics}
            createdMetrics={createdMetrics}
            groupedCreatedMetrics={groupedCreatedMetrics}
            setCreatedMetrics={setCreatedMetrics}
            setGroupedCreatedMetrics={setGroupedCreatedMetrics}
            defaultMetricName={'appdMetric'}
            tooptipMessage={'cv.monitoringSources.gcoLogs.addQueryTooltip'}
            addFieldLabel={'cv.monitoringSources.addMetric'}
            initCustomForm={INIT as any}
            shouldBeAbleToDeleteLastMetric
          >
            <FormInput.Text name={'metricName'} />
            <FormInput.Select
              name={'groupName'}
              items={[
                { label: 'Group 1', value: 'Group 1' },
                { label: 'Group 2', value: 'Group 2' }
              ]}
            />
          </CustomMetric>
        )
      }}
    </Formik>
  )
}

describe('Test case', () => {
  test('should validate Remove Add and Edit', async () => {
    const { container, getByText } = render(
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

    await waitFor(() =>
      expect(container.querySelectorAll('.seletedAppContainer span[data-icon="main-delete"]').length).toEqual(2)
    )
    act(() => {
      fireEvent.click(container.querySelector('span[data-icon="main-delete"]')!)
    })

    await waitFor(() =>
      expect(container.querySelectorAll('.seletedAppContainer span[data-icon="main-delete"]').length).toEqual(1)
    )
  })
})
