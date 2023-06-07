/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { IconName } from '@wings-software/uicore'
import { NotificationType } from '@notifications/interfaces/Notifications'
import type {
  EmailConfigDTO,
  MicrosoftTeamsConfigDTO,
  NotificationSettingConfigDTO,
  PagerDutyConfigDTO,
  SlackConfigDTO
} from 'services/cd-ng'
import { String } from 'framework/strings'

interface NotificationItemDTO {
  label: React.ReactElement
  icon: IconName
  value?: string
}

export const getIconByNotificationMethod = (option: NotificationType): IconName => {
  switch (option) {
    case NotificationType.Email:
      return 'main-email'
    case NotificationType.PagerDuty:
      return 'service-pagerduty'
    case NotificationType.Slack:
      return 'service-slack'
    default:
      return 'main-email'
  }
}

export const getNotificationByConfig = (option: NotificationSettingConfigDTO | null): NotificationItemDTO => {
  switch (option?.type) {
    case 'EMAIL':
      return {
        label: <String stringID="notifications.emailOrAlias" />,
        icon: 'main-email',
        value: (option as EmailConfigDTO)?.groupEmail
      }
    case 'PAGERDUTY':
      return {
        label: <String stringID="common.pagerDuty" />,
        icon: 'service-pagerduty',
        value: (option as PagerDutyConfigDTO)?.pagerDutyKey
      }
    case 'SLACK':
      return {
        label: <String stringID="common.slack" />,
        icon: 'service-slack',
        value: (option as SlackConfigDTO)?.slackWebhookUrl
      }
    case 'MSTEAMS':
      return {
        label: <String stringID="notifications.labelMS" />,
        icon: 'service-msteams',
        value: (option as MicrosoftTeamsConfigDTO)?.microsoftTeamsWebhookUrl
      }
    default:
      return {
        label: <String stringID="notifications.emailOrAlias" />,
        icon: 'main-email',
        value: ''
      }
  }
}
