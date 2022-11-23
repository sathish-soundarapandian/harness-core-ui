/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import NotificationRuleRow from '../NotificationRuleRow'
import type { NotificationRuleRowProps } from '../NotificationRuleRow.types'
import {
  allEventsTypeOption,
  eventTypeOptions
} from '../../ConfigureMonitoredServiceAlertConditions/ConfigureMonitoredServiceAlertConditions.constants'
import { getOptionsWithAllEvents } from '../NotificationRuleRow.utils'

const WrapperComponent = (props: NotificationRuleRowProps): JSX.Element => {
  return (
    <TestWrapper defaultFeatureFlagValues={{ SRM_CODE_ERROR_NOTIFICATIONS: true }}>
      <NotificationRuleRow {...props} />
    </TestWrapper>
  )
}

describe('Unit tests for NotificationRuleRow', () => {
  const props = {
    notificationRule: {
      id: 'uuid-1',
      condition: null,
      changeType: [],
      duration: '1',
      lookBackDuration: '1',
      value: '1',
      threshold: '1'
    },
    showDeleteNotificationsIcon: false,
    handleChangeField: jest.fn(),
    handleDeleteNotificationRule: jest.fn(),
    index: 0
  }

  test('Verify if NotificationRuleRow renders', async () => {
    const { getByText } = render(<WrapperComponent {...props} />)
    expect(getByText('cv.notifications.condition')).toBeInTheDocument()
  })

  test('should render the delete icon for every row', async () => {
    const newProps = { ...props, showDeleteNotificationsIcon: true }
    const { container } = render(<WrapperComponent {...newProps} />)
    const deleteInvite = container.querySelector('[data-icon="main-trash"]')
    expect(deleteInvite).toBeInTheDocument()
  })

  test('should be able to fill all the fields of a condition Row when condition is Change Impact', async () => {
    const { getByText, container } = render(<WrapperComponent {...props} />)

    // Selecting first condition
    const monitoredServiceConditionType = 'Change Impact'
    const conditionDropdown = container.querySelector('input[name="conditions.0.condition"]') as any
    userEvent.click(conditionDropdown)
    const typeToSelect = getByText(monitoredServiceConditionType)
    userEvent.click(typeToSelect)
    expect(conditionDropdown.value).toBe(monitoredServiceConditionType)

    // Selecting second condition
    const secondMonitoredServiceConditionType = 'Health Score'
    const secondConditionDropdown = container.querySelector('input[name="conditions.0.condition"]') as any
    userEvent.click(conditionDropdown)
    const secondTypeToSelect = getByText(secondMonitoredServiceConditionType)
    userEvent.click(secondTypeToSelect)
    expect(secondConditionDropdown.value).toBe(secondMonitoredServiceConditionType)

    // Selecting third condition
    const thirdMonitoredServiceConditionType = 'Change Observed'
    const thirdConditionDropdown = container.querySelector('input[name="conditions.0.condition"]') as any
    userEvent.click(conditionDropdown)
    const thirdTypeToSelect = getByText(thirdMonitoredServiceConditionType)
    userEvent.click(thirdTypeToSelect)
    expect(thirdConditionDropdown.value).toBe(thirdMonitoredServiceConditionType)

    // Selecting fourth condition
    const fourthMonitoredServiceConditionType = 'Code Errors'
    const fourthConditionDropdown = container.querySelector('input[name="conditions.0.condition"]') as any
    userEvent.click(conditionDropdown)
    const fourthTypeToSelect = getByText(fourthMonitoredServiceConditionType)
    userEvent.click(fourthTypeToSelect)
    expect(fourthConditionDropdown).toHaveValue(fourthMonitoredServiceConditionType)
  })
})

describe('getOptionsWithAllEvents', () => {
  test('It should uncheck everything when All Events was unchecked', async () => {
    const previous = [allEventsTypeOption, eventTypeOptions[1]]
    const current = [eventTypeOptions[1]]
    expect(getOptionsWithAllEvents(previous, current)).toStrictEqual([])
  })

  test('It should check everything when All Events was checked', async () => {
    const previous = [eventTypeOptions[1]]
    const current = [allEventsTypeOption, eventTypeOptions[1]]
    expect(getOptionsWithAllEvents(previous, current)).toStrictEqual(eventTypeOptions)
  })

  test('It should uncheck All Events when All Events is checked and other option was unchecked', async () => {
    const previous = eventTypeOptions
    const current = [
      allEventsTypeOption,
      eventTypeOptions[2],
      eventTypeOptions[3],
      eventTypeOptions[4],
      eventTypeOptions[5]
    ]
    expect(getOptionsWithAllEvents(previous, current)).toStrictEqual([
      eventTypeOptions[2],
      eventTypeOptions[3],
      eventTypeOptions[4],
      eventTypeOptions[5]
    ])
  })

  test('It should check All Events when All Events is unchecked and all other options were checked', async () => {
    const previous = [eventTypeOptions[2], eventTypeOptions[3], eventTypeOptions[4], eventTypeOptions[5]]
    const current = [
      eventTypeOptions[1],
      eventTypeOptions[2],
      eventTypeOptions[3],
      eventTypeOptions[4],
      eventTypeOptions[5]
    ]
    expect(getOptionsWithAllEvents(previous, current)).toStrictEqual(eventTypeOptions)
  })
})
