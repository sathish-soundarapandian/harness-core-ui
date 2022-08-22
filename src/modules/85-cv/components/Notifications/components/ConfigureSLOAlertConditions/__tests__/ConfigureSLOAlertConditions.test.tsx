/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import {
  ConfigureSLOAlertConditionsProps,
  SRMNotificationType
} from '@cv/components/Notifications/NotificationsContainer.types'
import ConfigureSLOAlertConditions from '../ConfigureSLOAlertConditions'

const WrapperComponent = (props: ConfigureSLOAlertConditionsProps): JSX.Element => {
  return (
    <TestWrapper>
      <ConfigureSLOAlertConditions {...props} />
    </TestWrapper>
  )
}

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('Unit tests for ConfigureSLOAlertConditions ', () => {
  const props = {
    prevStepData: {
      type: SRMNotificationType.SERVICE_LEVEL_OBJECTIVE
    },
    nextStep: jest.fn(),
    previousStep: jest.fn()
  }
  test('Verify if ConfigureSLOAlertConditionsProps renders', async () => {
    const { getByText } = render(<WrapperComponent {...props} />)
    expect(getByText('cv.notifications.configureAlertConditions')).toBeInTheDocument()
    expect(getByText('Category: cv.SLO')).toBeInTheDocument()
    expect(getByText('cv.notifications.sloDescription')).toBeInTheDocument()
  })

  test('Click on Add condition should add a condition Row and clicking on delete icon should delete the row', async () => {
    const { getByText, container } = render(<WrapperComponent {...props} />)

    expect(getByText('Add Condition')).toBeInTheDocument()
    userEvent.click(getByText('Add Condition'))

    waitFor(() => expect(container.querySelector(`input[name=conditions.0.condition]`)).not.toBeNull())
    waitFor(() => expect(container.querySelector(`input[name=conditions.1.condition]`)).not.toBeNull())

    const deleteButton = container.querySelector('[data-name="trash"]')
    expect(deleteButton).toBeTruthy()
    userEvent.click(deleteButton!)

    // Verify if condition row is deleted.
    waitFor(() => expect(container.querySelector(`input[name=conditions.0.condition]`)).not.toBeNull())
    waitFor(() => expect(container.querySelector(`input[name=conditions.1.condition]`)).toBeNull())

    // Verify if delete button is not present in the dialog now
    expect(deleteButton).not.toBeInTheDocument()
  })

  test('should be able to fill all the fields of a condition Row when condition is Error Budget remaining percentage', async () => {
    const { getByText, container } = render(<WrapperComponent {...props} />)
    const sloConditionType = 'Error Budget remaining percentage'

    // Selecting condition
    const conditionDropdown = container.querySelector('input[name="conditions.0.condition"]') as any
    userEvent.click(conditionDropdown)
    const typeToSelect = getByText(sloConditionType)
    userEvent.click(typeToSelect)
    expect(conditionDropdown.value).toBe(sloConditionType)

    //Selecting threshold
    const valueInputField = container.querySelector('input[name="0.threshold"]') as any
    expect(valueInputField).toBeInTheDocument()
    fireEvent.change(valueInputField, {
      target: { value: '5' }
    })
    expect(valueInputField.value).toBe('5')
  })

  test('should be able to fill all the fields of a condition Row when condition is Error Budget remaining minutes', async () => {
    const { getByText, container } = render(<WrapperComponent {...props} />)
    const sloConditionType = 'Error Budget remaining minutes'

    // Selecting condition
    const conditionDropdown = container.querySelector('input[name="conditions.0.condition"]') as any
    userEvent.click(conditionDropdown)
    const typeToSelect = getByText(sloConditionType)
    userEvent.click(typeToSelect)
    expect(conditionDropdown.value).toBe(sloConditionType)

    //Selecting threshold
    const valueInputField = container.querySelector('input[name="0.threshold"]') as any
    expect(valueInputField).toBeInTheDocument()
    fireEvent.change(valueInputField, {
      target: { value: '5' }
    })
    expect(valueInputField.value).toBe('5')
  })

  test('should be able to fill all the fields of a condition Row when condition is Error Budget Burn Rate is above', async () => {
    const { getByText, container } = render(<WrapperComponent {...props} />)
    const sloConditionType = 'Error Budget Burn Rate is above'

    // Selecting condition
    const conditionDropdown = container.querySelector('input[name="conditions.0.condition"]') as any
    userEvent.click(conditionDropdown)
    const typeToSelect = getByText(sloConditionType)
    userEvent.click(typeToSelect)
    expect(conditionDropdown.value).toBe(sloConditionType)

    //Selecting threshold
    const valueInputField = container.querySelector('input[name="0.threshold"]') as any
    expect(valueInputField).toBeInTheDocument()
    fireEvent.change(valueInputField, {
      target: { value: '5' }
    })
    expect(valueInputField.value).toBe('5')

    // Selecting Duration
    const durationInputField = container.querySelector('input[name="0.lookBackDuration"]') as any
    expect(durationInputField).toBeInTheDocument()
    fireEvent.change(durationInputField, {
      target: { value: '10' }
    })
    expect(durationInputField.value).toBe('10')
  })
})
