/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent } from '@testing-library/react'
import { noop } from 'lodash-es'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import { fillAtForm, InputTypes, clickSubmit } from '@common/utils/JestFormHelper'
import { NotificationType } from '@notifications/interfaces/Notifications'
import ConfigureEmailNotifications, {
  TestEmailConfig
} from '../views/ConfigureEmailNotifications/ConfigureEmailNotifications'
import ConfigureSlackNotifications from '../views/ConfigureSlackNotifications/ConfigureSlackNotifications'
import ConfigurePagerDutyNotifications from '../views/ConfigurePagerDutyNotifications/ConfigurePagerDutyNotifications'
import ConfigureMSTeamsNotifications from '../views/ConfigureMSTeamsNotifications/ConfigureMSTeamsNotifications'

const testNotificationMock = jest.fn()
testNotificationMock.mockImplementation((): Promise<{ status: string }> => {
  return Promise.resolve({ status: 'SUCCESS' })
})

jest.mock('services/notifications', () => ({
  useTestNotificationSetting: jest.fn().mockImplementation(() => ({ mutate: testNotificationMock }))
}))

describe('ConfigureNotifications', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  test('Slack', async () => {
    const handleSuccess = jest.fn()

    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/test" pathParams={{ accountId: 'dummy' }}>
        <ConfigureSlackNotifications hideModal={noop} onSuccess={handleSuccess} />
      </TestWrapper>
    )

    fillAtForm([
      {
        container,
        fieldId: 'webhookUrl',
        type: InputTypes.TEXTFIELD,
        value: 'http://valid.url'
      }
    ])

    expect(container).toMatchSnapshot()

    act(() => {
      fireEvent.click(getByText('test'))
    })

    expect(testNotificationMock).toHaveBeenCalledWith({
      accountId: 'dummy',
      type: 'SLACK',
      recipient: 'http://valid.url',
      notificationId: 'asd'
    })

    clickSubmit(container)

    await waitFor(() =>
      expect(handleSuccess).toHaveBeenCalledWith({
        type: NotificationType.Slack,
        webhookUrl: 'http://valid.url',
        userGroups: []
      })
    )
  })

  test('Microsoft Teams', async () => {
    const handleSuccess = jest.fn()

    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/test" pathParams={{ accountId: 'dummy' }}>
        <ConfigureMSTeamsNotifications hideModal={noop} onSuccess={handleSuccess} />
      </TestWrapper>
    )

    const msTeamKey = container.querySelector('[name="msTeamKeys.0"]')
    if (!msTeamKey) {
      throw Error('Microsoft team keys was not rendered.')
    }

    fireEvent.change(msTeamKey, { target: { value: 'https://www.google.com/' } })
    await waitFor(() => expect(container.querySelector('[name="msTeamKeys.0"]')).not.toBeNull())
    await act(() => {
      fireEvent.click(getByText('test'))
      expect(testNotificationMock).toHaveBeenCalledWith({
        accountId: 'dummy',
        notificationId: 'MSTeams',
        recipient: 'https://www.google.com/',
        type: 'MSTEAMS'
      })
    })

    expect(container).toMatchSnapshot()
  })

  test('Microsoft Teams - edit case', async () => {
    const handleSuccess = jest.fn()

    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/test" pathParams={{ accountId: 'dummy' }}>
        <ConfigureMSTeamsNotifications
          hideModal={noop}
          onSuccess={handleSuccess}
          config={{
            msTeamKeys: ['test-1'],
            type: NotificationType.MsTeams,
            userGroups: []
          }}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()

    await act(() => {
      fireEvent.click(getByText('test'))
      expect(testNotificationMock).toHaveBeenCalledWith({
        accountId: 'dummy',
        notificationId: 'MSTeams',
        recipient: 'test-1',
        type: 'MSTEAMS'
      })
    })

    expect(container).toMatchSnapshot()
  })

  test('Email', async () => {
    const handleSuccess = jest.fn()

    const { container } = render(
      <TestWrapper path="/account/:accountId/test" pathParams={{ accountId: 'dummy' }}>
        <ConfigureEmailNotifications hideModal={noop} onSuccess={handleSuccess} />
      </TestWrapper>
    )

    fillAtForm([
      {
        container,
        fieldId: 'emailIds',
        type: InputTypes.TEXTAREA,
        value: 'test@harness.io'
      }
    ])

    expect(container).toMatchSnapshot()

    clickSubmit(container)
    await waitFor(() =>
      expect(handleSuccess).toHaveBeenCalledWith({
        type: NotificationType.Email,
        emailIds: ['test@harness.io'],
        userGroups: []
      })
    )
  })

  test('test email works correctly', async () => {
    const handleTest = jest.fn()
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/test" pathParams={{ accountId: 'dummy' }}>
        <TestEmailConfig handleTest={handleTest} />
      </TestWrapper>
    )

    fillAtForm([
      {
        container,
        fieldId: 'to',
        type: InputTypes.TEXTAREA,
        value: 'test@harness.io'
      },
      {
        container,
        fieldId: 'subject',
        type: InputTypes.TEXTAREA,
        value: 'test subject'
      },
      {
        container,
        fieldId: 'body',
        type: InputTypes.TEXTAREA,
        value: 'test body'
      }
    ])

    fireEvent.click(getByText('notifications.buttonSend'))
    await waitFor(() =>
      expect(handleTest).toHaveBeenCalledWith({
        body: 'test body',
        subject: 'test subject',
        to: 'test@harness.io'
      })
    )
  })

  test('PagerDuty', async () => {
    const handleSuccess = jest.fn()
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId/test" pathParams={{ accountId: 'dummy' }}>
        <ConfigurePagerDutyNotifications hideModal={noop} onSuccess={handleSuccess} />
      </TestWrapper>
    )

    fillAtForm([
      {
        container,
        fieldId: 'key',
        type: InputTypes.TEXTFIELD,
        value: 'testKey'
      }
    ])

    expect(container).toMatchSnapshot()

    act(() => {
      fireEvent.click(getByText('test'))
    })

    expect(testNotificationMock).toHaveBeenCalledWith({
      accountId: 'dummy',
      type: 'PAGERDUTY',
      recipient: 'testKey',
      notificationId: 'asd'
    })

    clickSubmit(container)
    await waitFor(() =>
      expect(handleSuccess).toHaveBeenCalledWith({
        type: NotificationType.PagerDuty,
        key: 'testKey',
        userGroups: []
      })
    )
  })
})
