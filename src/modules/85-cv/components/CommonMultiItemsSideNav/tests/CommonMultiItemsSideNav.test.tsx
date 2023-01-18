/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Formik from 'formik'
import { noop } from 'lodash-es'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { Formik as FormikForm } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import CommonHealthSourceProvider from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/components/CommonHealthSourceContext/CommonHealthSourceContext'
import { CommonMultiItemsSideNav } from '../CommonMultiItemsSideNav'
import { getFilteredGroupedCreatedMetric, getSelectedMetricIndex } from '../CommonMultiItemsSideNav.utils'
import { commonHealthSourceProviderPropsMock, groupedCreatedMetrics } from './CommonMultiItemsSideNav.mock'

describe('Unit tests for CommonMultiItemsSideNav side nav', () => {
  const defaultMetricName = 'metric-1'
  const tooptipMessage = 'Please fill all required fields'
  const addFieldLabel = 'Add Query'
  const useFormikContextMock = jest.spyOn(Formik, 'useFormikContext')

  beforeEach(() => {
    jest.clearAllMocks()

    useFormikContextMock.mockReturnValue({
      values: {}
    } as unknown as any)
  })

  test('Ensure that all passed in metrics are rendered in CommonMultiItemsSideNav', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <CommonHealthSourceProvider {...commonHealthSourceProviderPropsMock}>
          <CommonMultiItemsSideNav
            tooptipMessage={tooptipMessage}
            defaultMetricName={defaultMetricName}
            addFieldLabel={addFieldLabel}
            createdMetrics={['appdMetric 101', 'appdMetric 102']}
            onRemoveMetric={jest.fn()}
            onSelectMetric={jest.fn()}
            renamedMetric="appdMetric 101"
            openEditMetricModal={jest.fn()}
            defaultSelectedMetric={'appdMetric 101'}
            groupedCreatedMetrics={groupedCreatedMetrics}
          />
        </CommonHealthSourceProvider>
      </TestWrapper>
    )
    await waitFor(() => expect(getByText('appdMetric 101')).not.toBeNull())
    await waitFor(() => expect(getByText('appdMetric 102')).not.toBeNull())

    expect(container.querySelector('[class*="isSelected"]')?.textContent).toEqual('appdMetric 101')
  })

  test('Ensure onSelect work in CommonMultiItemsSideNav', async () => {
    const onSelectMock = jest.fn()
    const onRemoveMock = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <CommonHealthSourceProvider {...commonHealthSourceProviderPropsMock}>
          <CommonMultiItemsSideNav
            tooptipMessage={tooptipMessage}
            defaultMetricName={defaultMetricName}
            addFieldLabel={addFieldLabel}
            createdMetrics={['appdMetric 101', 'appdMetric 102']}
            onRemoveMetric={onRemoveMock}
            onSelectMetric={onSelectMock}
            renamedMetric="appdMetric 101"
            defaultSelectedMetric={'appdMetric 101'}
            openEditMetricModal={jest.fn()}
            groupedCreatedMetrics={groupedCreatedMetrics}
          />
        </CommonHealthSourceProvider>
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('appdMetric 101')).not.toBeNull())
    expect(container.querySelector('[class*="isSelected"]')?.textContent).toEqual('appdMetric 101')

    // if Form is not valid onSelect should not have been called.
    fireEvent.click(getByText('appdMetric 102'))
    expect(onSelectMock).not.toHaveBeenCalled()
  })

  test('Ensure onSelect work in CommonMultiItemsSideNav with local formik', async () => {
    const onRemoveMock = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <FormikForm
          onSubmit={noop}
          formName=""
          initialValues={{
            identifier: 'appdMetric101',
            metricName: 'appdMetric 101',
            groupName: { label: 'Group 1', value: 'Group 1' },
            query: 'query'
          }}
        >
          {formikData => {
            return (
              <CommonHealthSourceProvider {...commonHealthSourceProviderPropsMock}>
                <CommonMultiItemsSideNav
                  tooptipMessage={tooptipMessage}
                  defaultMetricName={defaultMetricName}
                  addFieldLabel={addFieldLabel}
                  createdMetrics={['appdMetric 101', 'appdMetric 102']}
                  onRemoveMetric={onRemoveMock}
                  onSelectMetric={name => formikData.setFieldValue('metricName', name)}
                  renamedMetric="appdMetric 101"
                  defaultSelectedMetric={formikData.values.metricName}
                  openEditMetricModal={jest.fn()}
                  groupedCreatedMetrics={groupedCreatedMetrics}
                />
              </CommonHealthSourceProvider>
            )
          }}
        </FormikForm>
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('appdMetric 101')).not.toBeNull())
    expect(container.querySelector('[class*="isSelected"]')?.textContent).toEqual('appdMetric 101')

    // should not swtch the metric if validations are not met
    fireEvent.click(getByText('appdMetric 102'))
    await waitFor(() => expect(container.querySelector('[class*="isSelected"]')?.textContent).toEqual('appdMetric 101'))
  })

  test('Ensure that only when single app is there delete button does not exist in CommonMultiItemsSideNav', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <CommonHealthSourceProvider {...commonHealthSourceProviderPropsMock}>
          <CommonMultiItemsSideNav
            tooptipMessage={tooptipMessage}
            defaultMetricName={defaultMetricName}
            addFieldLabel={addFieldLabel}
            createdMetrics={['appdMetric 101']}
            onRemoveMetric={jest.fn()}
            onSelectMetric={jest.fn()}
            renamedMetric="appdMetric 101"
            openEditMetricModal={jest.fn()}
            defaultSelectedMetric={'appdMetric 101'}
            groupedCreatedMetrics={{
              'Group 1': [{ groupName: { label: 'Group 1', value: 'Group 1' }, metricName: 'appdMetric 101' }]
            }}
          />
        </CommonHealthSourceProvider>
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('appdMetric 101')).not.toBeNull())
    expect(container.querySelector('[class*="isSelected"]')?.textContent).toEqual('appdMetric 101')
    expect(container.querySelectorAll('[data-icon="main-delete"]').length).toBe(0)
  })

  test('Ensure that when selected app name changes, the nav shows that change in CommonMultiItemsSideNav', async () => {
    const { container, getByText, rerender } = render(
      <TestWrapper>
        <CommonHealthSourceProvider {...commonHealthSourceProviderPropsMock}>
          <CommonMultiItemsSideNav
            tooptipMessage={tooptipMessage}
            defaultMetricName={defaultMetricName}
            addFieldLabel={addFieldLabel}
            createdMetrics={['appdMetric 101']}
            onRemoveMetric={jest.fn()}
            onSelectMetric={jest.fn()}
            renamedMetric="appdMetric 101"
            openEditMetricModal={jest.fn()}
            defaultSelectedMetric={'appdMetric 101'}
            groupedCreatedMetrics={{
              'Group 1': [{ groupName: { label: 'Group 1', value: 'Group 1' }, metricName: 'appdMetric 101' }]
            }}
          />
        </CommonHealthSourceProvider>
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('appdMetric 101')).not.toBeNull())
    expect(container.querySelector('[class*="isSelected"]')?.textContent).toEqual('appdMetric 101')
    expect(container.querySelectorAll('[data-icon="main-delete"]').length).toBe(0)

    rerender(
      <TestWrapper>
        <CommonHealthSourceProvider {...commonHealthSourceProviderPropsMock}>
          <CommonMultiItemsSideNav
            tooptipMessage={tooptipMessage}
            defaultMetricName={defaultMetricName}
            addFieldLabel={addFieldLabel}
            createdMetrics={['solo-dolo']}
            onRemoveMetric={jest.fn()}
            onSelectMetric={jest.fn()}
            renamedMetric="solo-dolo"
            openEditMetricModal={jest.fn()}
            defaultSelectedMetric={'solo-dolo'}
            groupedCreatedMetrics={{
              'Group 1': [{ groupName: { label: 'Group 1', value: 'Group 1' }, metricName: 'solo-dolo' }]
            }}
          />
        </CommonHealthSourceProvider>
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('solo-dolo')).not.toBeNull())
    expect(container.querySelector('[class*="isSelected"]')?.textContent).toEqual('solo-dolo')
    expect(container.querySelector('[data-testid="sideNav-solo-dolo"]')?.textContent).toEqual('solo-dolo')
    expect(container.querySelectorAll('[data-icon="main-delete"]').length).toBe(0)
  })

  test('Ensure that when adding a new metric, the new metric is added to the top in CommonMultiItemsSideNav', async () => {
    const onSelectMock = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <CommonHealthSourceProvider {...commonHealthSourceProviderPropsMock}>
          <CommonMultiItemsSideNav
            tooptipMessage={tooptipMessage}
            defaultMetricName={defaultMetricName}
            addFieldLabel={addFieldLabel}
            createdMetrics={['appdMetric 101']}
            onRemoveMetric={jest.fn()}
            onSelectMetric={onSelectMock}
            renamedMetric="appdMetric 101"
            openEditMetricModal={jest.fn()}
            defaultSelectedMetric={'appdMetric 101'}
            groupedCreatedMetrics={{
              'Group 1': [{ groupName: { label: 'Group 1', value: 'Group 1' }, metricName: 'appdMetric 101' }]
            }}
          />
        </CommonHealthSourceProvider>
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('appdMetric 101')).not.toBeNull())
    expect(container.querySelector('[class*="isSelected"]')?.textContent).toEqual('appdMetric 101')
  })

  test('valide getSelectedMetricIndex utils for CommonMultiItemsSideNav', () => {
    expect(getSelectedMetricIndex(['Metric 101', 'Metric 102'], 'Metric 102', '')).toEqual(1)
    expect(getSelectedMetricIndex(['Metric 101', 'Metric 102'], 'Metric 102', 'Metric New')).toEqual(1)
    expect(getSelectedMetricIndex(['Metric 101', 'Metric 102'], 'Metric 102', 'Metric 102')).toEqual(-1)
    expect(getSelectedMetricIndex(['Metric 101', 'Metric 102'], 'Metric 102', 'Metric 101')).toEqual(-1)
    expect(getSelectedMetricIndex(['Metric 101', 'Metric 102'], '', 'Metric New')).toEqual(-1)
    expect(getSelectedMetricIndex(['Metric 101', 'Metric 102'], '', '')).toEqual(-1)
    expect(getSelectedMetricIndex([], 'Metric New', 'Metric 101')).toEqual(-1)
    expect(getSelectedMetricIndex([], 'Metric New', '')).toEqual(-1)
  })

  test('validate getFilteredGroupedCreatedMetric for CommonMultiItemsSideNav', () => {
    const groupName = {
      label: 'group 1',
      value: 'group1'
    }
    const metric1 = {
      groupName,
      index: 0,
      metricName: 'test metric 1'
    }
    const groupedTwoMetrics = {
      'group 1': [
        { ...metric1 },
        {
          groupName,
          index: 0,
          metricName: 'test metric 2'
        }
      ]
    }
    const groupedOneMetrics = {
      'group 1': [{ ...metric1 }]
    }
    expect(getFilteredGroupedCreatedMetric({}, '')).toEqual({})
    expect(getFilteredGroupedCreatedMetric(groupedTwoMetrics, '')).toEqual(groupedTwoMetrics)
    expect(getFilteredGroupedCreatedMetric(groupedTwoMetrics, 'test')).toEqual(groupedTwoMetrics)
    expect(getFilteredGroupedCreatedMetric(groupedTwoMetrics, 'metric 1')).toEqual(groupedOneMetrics)
  })
})
