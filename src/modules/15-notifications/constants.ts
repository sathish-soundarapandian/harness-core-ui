/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@wings-software/uicore'
import { NotificationType } from './interfaces/Notifications'

export const NotificationTypeSelectOptions: SelectOption[] = [
  {
    label: NotificationType.Slack,
    value: NotificationType.Slack
  }
  // {
  //   label: NotificationType.Email,
  //   value: NotificationType.Email
  // },
  // {
  //   label: NotificationType.PagerDuty,
  //   value: NotificationType.PagerDuty
  // }
]
