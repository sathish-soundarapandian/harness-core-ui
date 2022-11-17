/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render, fireEvent, act } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import NotificationList from '../NotificationList'

const putUserGrpupMock = () => {
  return {
    data: true
  }
}

jest.mock('services/cd-ng', () => ({
  ...jest.requireActual('services/cd-ng'),
  usePutUserGroup: jest.fn().mockImplementation(() => ({ mutate: putUserGrpupMock }))
}))

const showSuccess = jest.fn()

jest.mock('@harness/uicore', () => ({
  ...jest.requireActual('@harness/uicore'),
  useToaster: jest.fn(() => ({ showSuccess }))
}))

describe('Notification list tests', () => {
  test('test empty list', () => {
    const { queryByTestId } = render(
      <TestWrapper>
        <NotificationList
          userGroup={{
            identifier: 'dummy_identifier',
            name: 'dummy_name'
          }}
          onSubmit={() => {
            // empty on submit
          }}
        />
      </TestWrapper>
    )
    const addChannelBtn = queryByTestId('addChannel')
    expect(addChannelBtn).not.toBeNull()
  })

  test('click on add channel button', async () => {
    const { container, queryByTestId } = render(
      <TestWrapper>
        <NotificationList
          userGroup={{
            identifier: 'dummy_identifier',
            name: 'dummy_name'
          }}
          onSubmit={() => {
            // empty on submit
          }}
        />
      </TestWrapper>
    )
    const addChannelBtn = queryByTestId('addChannel')
    await act(async () => {
      fireEvent.click(addChannelBtn!)
    })

    const selectChannelDropdown = container.querySelector('input[placeholder="- common.selectAChannel -"]')
    expect(selectChannelDropdown).not.toBeNull()
  })

  test('render with notifications', async () => {
    const { queryByText } = render(
      <TestWrapper>
        <NotificationList
          userGroup={{
            identifier: 'dummy_identifier',
            name: 'dummy_name',
            notificationConfigs: [
              {
                type: 'EMAIL',
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                groupEmail: 'test@test.com'
              },
              {
                type: 'SLACK',
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                slackWebhookUrl: 'test@test.com'
              },
              {
                type: 'MSTEAMS',
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                microsoftTeamsWebhookUrl: 'test@test.com'
              },
              {
                type: 'PAGERDUTY',
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                pagerDutyKey: 'testkey'
              }
            ]
          }}
          onSubmit={() => {
            // empty on submit
          }}
        />
      </TestWrapper>
    )

    expect(queryByText('rbac.notifications.emailOrAlias')).not.toBeNull()
    expect(queryByText('common.slack')).not.toBeNull()
    expect(queryByText('rbac.notifications.labelMS')).not.toBeNull()
    expect(queryByText('common.pagerDuty')).not.toBeNull()
  })

  test('test delete notification', async () => {
    const { queryByTestId } = render(
      <TestWrapper>
        <NotificationList
          userGroup={{
            identifier: 'dummy_identifier',
            name: 'dummy_name',
            notificationConfigs: [
              {
                type: 'SLACK',
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                slackWebhookUrl: 'test@test.com'
              }
            ]
          }}
          onSubmit={() => {
            // empty on submit
          }}
        />
      </TestWrapper>
    )

    const trashBtn = queryByTestId('trashBtn')

    await act(async () => {
      fireEvent.click(trashBtn!)
    })
    expect(showSuccess).toBeCalled()
  })
})
