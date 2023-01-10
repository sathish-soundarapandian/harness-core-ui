/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { v4 as uuid } from 'uuid'
import React from 'react'
import { Layout, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import type { NotificationRuleResponse } from 'services/cv'
import { useStrings } from 'framework/strings'
import ImageDeleteService from '@cv/assets/delete-service.svg'
import { SRMNotification, SRMNotificationType } from '../../NotificationsContainer.types'
import { sloConditionOptions } from '../SLONotificationRuleRow/SLONotificationRuleRow.constants'
import {
  changeTypeOptions,
  conditionOptions,
  eventStatusOptions,
  eventTypeOptions
} from '../ConfigureMonitoredServiceAlertConditions/ConfigureMonitoredServiceAlertConditions.constants'

export function getCurrentNotification(data: NotificationRuleResponse): SRMNotification {
  let currentConditions = []
  if (data?.notificationRule?.type === SRMNotificationType.SERVICE_LEVEL_OBJECTIVE) {
    currentConditions = data?.notificationRule?.conditions?.map(condition => {
      return {
        id: uuid(),
        condition: sloConditionOptions.find(el => el.value === condition?.type),
        threshold: condition?.spec?.threshold,
        ...(condition?.spec?.lookBackDuration && {
          lookBackDuration: condition?.spec?.lookBackDuration?.replace('m', '')
        })
      }
    })
  } else if (data?.notificationRule?.type === SRMNotificationType.MONITORED_SERVICE) {
    currentConditions = data?.notificationRule?.conditions?.map(condition => {
      return {
        id: uuid(),
        condition: conditionOptions.find(el => el.value === condition?.type),
        threshold: condition?.spec?.threshold,
        ...(condition?.spec?.period && {
          duration: condition?.spec?.period?.replace('m', '')
        }),
        ...(condition?.spec?.changeEventTypes &&
          condition?.spec?.changeEventTypes.length && {
            changeType: condition?.spec?.changeEventTypes?.map((changeEventType: string | number | symbol) =>
              changeTypeOptions.find(changeTypeOption => changeTypeOption.value === changeEventType)
            )
          }),
        ...(condition?.spec?.errorTrackingEventStatus &&
          condition?.spec?.errorTrackingEventStatus.length && {
            eventStatus: condition?.spec?.errorTrackingEventStatus?.map((eventStatus: string | number | symbol) =>
              eventStatusOptions.find(eventStatusOption => eventStatusOption.value === eventStatus)
            )
          }),
        ...(condition?.spec?.errorTrackingEventTypes &&
          condition?.spec?.errorTrackingEventTypes.length && {
            eventType: condition?.spec?.errorTrackingEventTypes?.map(
              (errorTrackingEventType: string | number | symbol) =>
                eventTypeOptions.find(
                  errorTrackingTypeOption => errorTrackingTypeOption.value === errorTrackingEventType
                )
            )
          })
      }
    })
  }

  return { ...data?.notificationRule, conditions: currentConditions }
}

export const NotificationDeleteContext = ({ notificationName }: { notificationName?: string }): JSX.Element => {
  const { getString } = useStrings()

  return (
    <Layout.Horizontal flex={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Text color={Color.GREY_800}>
        {getString('cv.notifications.deleteNotificationWarning', { name: notificationName })}
      </Text>
      <div>
        <img src={ImageDeleteService} width="204px" height="202px" />
      </div>
    </Layout.Horizontal>
  )
}
