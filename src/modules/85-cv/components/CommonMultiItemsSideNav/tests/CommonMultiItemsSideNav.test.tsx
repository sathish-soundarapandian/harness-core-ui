/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { CommonMultiItemsSideNav } from '../CommonMultiItemsSideNav'
import { getFilteredGroupedCreatedMetric, getSelectedMetricIndex } from '../CommonMultiItemsSideNav.utils'

describe('Unit tests for CommonMultiItemsSideNav side nav', () => {
  const defaultMetricName = 'metric-1'
  const tooptipMessage = 'Please fill all required fields'
  const addFieldLabel = 'Add Query'

  test('Ensure that all passed in metrics are rendered in CommonMultiItemsSideNav', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <CommonMultiItemsSideNav
          tooptipMessage={tooptipMessage}
          defaultMetricName={defaultMetricName}
          addFieldLabel={addFieldLabel}
          createdMetrics={['app1', 'app2', 'app3']}
          onRemoveMetric={jest.fn()}
          onSelectMetric={jest.fn()}
          isValidInput={true}
          renamedMetric="app1"
          openEditMetricModal={jest.fn()}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('app1')).not.toBeNull())
    await waitFor(() => expect(getByText('app2')).not.toBeNull())
    await waitFor(() => expect(getByText('app3')).not.toBeNull())

    expect(container.querySelector('[class*="isSelected"]')?.innerHTML).toEqual('app1')
  })

  test('Ensure onSelect and onDelete work in CommonMultiItemsSideNav', async () => {
    const onSelectMock = jest.fn()
    const onRemoveMock = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <CommonMultiItemsSideNav
          tooptipMessage={tooptipMessage}
          defaultMetricName={defaultMetricName}
          addFieldLabel={addFieldLabel}
          createdMetrics={['app1', 'app2', 'app3']}
          onRemoveMetric={onRemoveMock}
          onSelectMetric={onSelectMock}
          isValidInput={true}
          renamedMetric="app1"
          openEditMetricModal={jest.fn()}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('app1')).not.toBeNull())
    expect(container.querySelector('[class*="isSelected"]')?.innerHTML).toEqual('app1')

    // select second app
    fireEvent.click(getByText('app2'))
    await waitFor(() => expect(container.querySelector('[class*="isSelected"]')?.innerHTML).toEqual('app2'))
    expect(onSelectMock).toHaveBeenCalledWith('app2', ['app1', 'app2', 'app3'], 1)

    const deleteButtons = container.querySelectorAll('[data-icon="main-delete"]')
    expect(deleteButtons.length).toBe(3)

    // delete second app
    fireEvent.click(deleteButtons[1])
    await waitFor(() => expect(container.querySelectorAll('[data-icon="main-delete"]').length).toBe(2))
    expect(onRemoveMock).toHaveBeenCalledWith('app2', 'app1', ['app1', 'app3'], 0)

    expect(container.querySelector('[class*="isSelected"]')?.innerHTML).toEqual('app1')
  })

  test('Ensure that only when single app is there delete button does not exist in CommonMultiItemsSideNav', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <CommonMultiItemsSideNav
          tooptipMessage={tooptipMessage}
          defaultMetricName={defaultMetricName}
          addFieldLabel={addFieldLabel}
          createdMetrics={['app1']}
          onRemoveMetric={jest.fn()}
          onSelectMetric={jest.fn()}
          isValidInput={true}
          renamedMetric="app1"
          openEditMetricModal={jest.fn()}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('app1')).not.toBeNull())
    expect(container.querySelector('[class*="isSelected"]')?.innerHTML).toEqual('app1')
    expect(container.querySelectorAll('[data-icon="main-delete"]').length).toBe(0)
  })

  test('Ensure that when selected app name changes, the nav shows that change in CommonMultiItemsSideNav', async () => {
    const { container, getByText, rerender } = render(
      <TestWrapper>
        <CommonMultiItemsSideNav
          tooptipMessage={tooptipMessage}
          defaultMetricName={defaultMetricName}
          addFieldLabel={addFieldLabel}
          createdMetrics={['app1']}
          onRemoveMetric={jest.fn()}
          onSelectMetric={jest.fn()}
          isValidInput={true}
          renamedMetric="app1"
          openEditMetricModal={jest.fn()}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('app1')).not.toBeNull())
    expect(container.querySelector('[class*="isSelected"]')?.innerHTML).toEqual('app1')
    expect(container.querySelectorAll('[data-icon="main-delete"]').length).toBe(0)

    rerender(
      <TestWrapper>
        <CommonMultiItemsSideNav
          tooptipMessage={tooptipMessage}
          defaultMetricName={defaultMetricName}
          addFieldLabel={addFieldLabel}
          createdMetrics={['app1']}
          onRemoveMetric={jest.fn()}
          onSelectMetric={jest.fn()}
          isValidInput={true}
          renamedMetric="solo-dolo"
          openEditMetricModal={jest.fn()}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('solo-dolo')).not.toBeNull())
    expect(container.querySelector('[class*="isSelected"]')?.innerHTML).toEqual('solo-dolo')
    expect(container.querySelectorAll('[data-icon="main-delete"]').length).toBe(0)
  })

  test('Ensure that when adding a new metric, the new metric is added to the top in CommonMultiItemsSideNav', async () => {
    const onSelectMock = jest.fn()
    const { container, getByText } = render(
      <TestWrapper>
        <CommonMultiItemsSideNav
          tooptipMessage={tooptipMessage}
          defaultMetricName={defaultMetricName}
          addFieldLabel={addFieldLabel}
          createdMetrics={['app1']}
          onRemoveMetric={jest.fn()}
          onSelectMetric={onSelectMock}
          isValidInput={true}
          renamedMetric="app1"
          openEditMetricModal={jest.fn()}
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('app1')).not.toBeNull())
    expect(container.querySelector('[class*="isSelected"]')?.innerHTML).toEqual('app1')
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
