/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { Formik } from 'formik'
import * as useFeatureFlag from '@common/hooks/useFeatureFlag'
import { TestWrapper } from '@common/utils/testUtils'
import type { NotificationRuleResponse } from 'services/cv'
import NotificationsContainer from '../NotificationsContainer'
import { NotificationsContainerProps, SRMNotification, SRMNotificationType } from '../NotificationsContainer.types'
import {
  currentNotificationsInTable,
  getUpdatedNotificationsResponse,
  latestNotification,
  mockedNotificationsTable,
  toggledNotificationResponse,
  updatedNotificationRulesResponse,
  updatedNotificationsInTable,
  updateNotificationRulesArgs
} from './NotificationsContainer.mock'
import {
  getInitialNotificationRules,
  getUpdatedNotificationRules,
  getUpdatedNotifications,
  getUpdatedNotificationsRuleRefs,
  toggleNotification
} from '../NotificationsContainer.utils'

const WrapperComponent = (props: NotificationsContainerProps): JSX.Element => {
  return (
    <TestWrapper>
      <NotificationsContainer {...props} />
    </TestWrapper>
  )
}

describe('Unit tests for NotificationsContainer', () => {
  beforeAll(() => {
    const useFeatureFlags = jest.spyOn(useFeatureFlag, 'useFeatureFlag')
    useFeatureFlags.mockReturnValue(true)
  })

  const props = {
    children: <></>,
    type: SRMNotificationType.SERVICE_LEVEL_OBJECTIVE,
    handleDeleteNotification: jest.fn(),
    handleCreateNotification: jest.fn(),
    handleToggleNotification: jest.fn(),
    notificationsInTable: [],
    setPage: () => jest.fn(),
    loading: false,
    error: null,
    page: 0,
    getNotifications: jest.fn()
  }
  test('Verify if NotificationsContainer renders', async () => {
    const { container } = render(
      <Formik initialValues={{ isEdit: true, isMonitoredServiceEnabled: true }} onSubmit={() => Promise.resolve()}>
        <WrapperComponent {...props} />
      </Formik>
    )
    expect(container).toMatchSnapshot()
  })

  test('Verify if NotificationsContainer renders for notification type SERVICE_LEVEL_OBJECTIVE', async () => {
    const newProps = { ...props, type: SRMNotificationType.SERVICE_LEVEL_OBJECTIVE }
    const { container, getByText } = render(
      <Formik initialValues={{ isEdit: true, isMonitoredServiceEnabled: true }} onSubmit={() => Promise.resolve()}>
        <WrapperComponent {...newProps} />
      </Formik>
    )
    expect(getByText('cv.notifications.errorBudgetPolicies')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('Verify if NotificationsContainer renders for notification type MONITORED_SERVICE', async () => {
    const newProps = { ...props, type: SRMNotificationType.MONITORED_SERVICE }
    const { container, getByText } = render(
      <Formik initialValues={{ isEdit: true, isMonitoredServiceEnabled: true }} onSubmit={() => Promise.resolve()}>
        <WrapperComponent {...newProps} />
      </Formik>
    )
    expect(getByText('rbac.notifications.name')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('Verify if NotificationsContainer renders no notifications screen when there are no notificatons', async () => {
    const { container, getByText } = render(
      <Formik initialValues={{ isEdit: true, isMonitoredServiceEnabled: true }} onSubmit={() => Promise.resolve()}>
        <WrapperComponent {...props} />
      </Formik>
    )
    expect(getByText('cv.notifications.newNotificationRule')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('Verify if NotificationsContainer renders notificationsTable with data when there are notifications present', async () => {
    const newProps = { ...props, notificationsInTable: mockedNotificationsTable as NotificationRuleResponse[] }
    const { container, queryByText } = render(
      <Formik initialValues={{ isEdit: true, isMonitoredServiceEnabled: true }} onSubmit={() => Promise.resolve()}>
        <WrapperComponent {...newProps} />
      </Formik>
    )
    expect(queryByText('cv.notifications.newNotificationRule')).not.toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('should render new notifications button as disabled if monitored service is disabled and it is edit scenario', async () => {
    const { container, queryByText } = render(
      <Formik initialValues={{ isEdit: true, isMonitoredServiceEnabled: false }} onSubmit={() => Promise.resolve()}>
        <WrapperComponent {...props} />
      </Formik>
    )

    expect(queryByText('cv.notifications.newNotificationRule')).toBeInTheDocument()
    expect(container.querySelector('button[aria-label="cv.notifications.newNotificationRule"]')).toBeDisabled()
  })

  test('should render new notifications button as enabled if monitored service is enabled and it is edit scenario', async () => {
    const { container, queryByText } = render(
      <Formik initialValues={{ isEdit: true, isMonitoredServiceEnabled: true }} onSubmit={() => Promise.resolve()}>
        <WrapperComponent {...props} />
      </Formik>
    )

    expect(queryByText('cv.notifications.newNotificationRule')).toBeInTheDocument()
    expect(container.querySelector('button[aria-label="cv.notifications.newNotificationRule"]')).not.toBeDisabled()
  })

  test('should render new notifications button as enabled if it is a create scenario', async () => {
    const { container, queryByText } = render(
      <Formik initialValues={{ isEdit: false }} onSubmit={() => Promise.resolve()}>
        <WrapperComponent {...props} />
      </Formik>
    )

    expect(queryByText('cv.notifications.newNotificationRule')).toBeInTheDocument()
    expect(container.querySelector('button[aria-label="cv.notifications.newNotificationRule"]')).not.toBeDisabled()
  })

  test('Verify if getUpdatedNotificationRules method give correct results', () => {
    expect(getUpdatedNotificationRules(updateNotificationRulesArgs)).toEqual(updatedNotificationRulesResponse)
  })

  test('Verify if toggleNotification method give correct results', () => {
    const notificationToToggle = {
      identifier: 'tEST_NEW',
      enabled: true
    }

    const notificationsInTable = [
      {
        notificationRule: {
          orgIdentifier: 'SRM',
          projectIdentifier: 'SRMSLOTesting',
          identifier: 'tEST_NEW',
          name: 'tEST NEW',
          type: 'MonitoredService',
          conditions: [
            {
              type: 'ChangeImpact',
              spec: {
                changeEventTypes: ['Infrastructure'],
                threshold: 1,
                period: '1m'
              }
            }
          ],
          notificationMethod: {
            type: 'Slack',
            spec: {
              userGroups: ['account.act_usergroup'],
              webhookUrl: ''
            }
          }
        },
        enabled: false,
        createdAt: 1658578785337,
        lastModifiedAt: 1658578785337
      }
    ] as NotificationRuleResponse[]
    expect(toggleNotification(notificationToToggle, notificationsInTable)).toEqual(toggledNotificationResponse)
  })
  test('Verify if getUpdatedNotifications method give correct results', () => {
    expect(getUpdatedNotifications(latestNotification, currentNotificationsInTable)).toEqual(
      getUpdatedNotificationsResponse
    )
  })
  test('Verify if getUpdatedNotificationsRuleRefs method give correct results', () => {
    expect(getUpdatedNotificationsRuleRefs(updatedNotificationsInTable)).toEqual([
      { enabled: false, notificationRuleRef: 'New_notification' },
      { enabled: true, notificationRuleRef: 'tEST_NEW' },
      { enabled: true, notificationRuleRef: 'Test123new' },
      { enabled: true, notificationRuleRef: 'moninotification' },
      { enabled: true, notificationRuleRef: 'notify2' }
    ])
  })

  test('Verify if getInitialNotificationRules method give correct results', () => {
    const output = getInitialNotificationRules({
      name: 'Test',
      identifier: 'Test'
    } as SRMNotification)
    expect(output[0].condition).toEqual(null)
  })
})
