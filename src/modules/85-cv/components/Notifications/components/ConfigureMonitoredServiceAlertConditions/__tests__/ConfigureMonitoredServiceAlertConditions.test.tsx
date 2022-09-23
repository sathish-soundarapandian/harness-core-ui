/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import {
  ConfigureMonitoredServiceAlertConditionsProps,
  SRMNotificationType
} from '@cv/components/Notifications/NotificationsContainer.types'
import ConfigureMonitoredServiceAlertConditions from '../ConfigureMonitoredServiceAlertConditions'

const WrapperComponent = (props: ConfigureMonitoredServiceAlertConditionsProps): JSX.Element => {
  return (
    <TestWrapper>
      <ConfigureMonitoredServiceAlertConditions {...props} />
    </TestWrapper>
  )
}

describe('Unit tests for ConfigureMonitoredServiceAlertConditions', () => {
  const props = {
    prevStepData: {
      type: SRMNotificationType.SERVICE_LEVEL_OBJECTIVE
    },
    nextStep: jest.fn(),
    previousStep: jest.fn()
  }
  test('Verify if ConfigureMonitoredServiceAlertConditions renders', async () => {
    const { getByText } = render(<WrapperComponent {...props} />)
    expect(getByText('cv.notifications.configureAlertConditions')).toBeInTheDocument()
    expect(getByText('Category:cv.notifications.serviceHealth')).toBeInTheDocument()
    expect(getByText('cv.notifications.serviceHealthDescription')).toBeInTheDocument()
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
})
