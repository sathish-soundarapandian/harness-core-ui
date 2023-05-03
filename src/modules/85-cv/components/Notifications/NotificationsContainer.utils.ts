/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { v4 as uuid } from 'uuid'
import { set } from 'lodash-es'
import type {
  CVNGNotificationChannel,
  NotificationRuleRefDTO,
  NotificationRuleResponse,
  RestResponseNotificationRuleResponse
} from 'services/cv'
import type { NotificationToToggle } from '@cv/pages/slos/common/SLOTargetAndBudgetPolicy/SLOTargetAndBudgetPolicy.types'
import type { StringKeys } from 'framework/strings'
import type {
  NotificationConditions,
  NotificationRule,
  SRMNotification,
  SRMNotificationType
} from './NotificationsContainer.types'
import { Condition } from './components/ConfigureMonitoredServiceAlertConditions/ConfigureMonitoredServiceAlertConditions.constants'
import type { FieldValueType, MoreFieldsType } from './components/NotificationRuleRow/NotificationRuleRow.types'

export const createNotificationRule = (): NotificationRule => {
  return {
    id: uuid(),
    condition: null
  }
}

export function getUpdatedNotificationRules({
  conditions,
  notificationRule,
  currentField,
  currentFieldValue,
  moreFields
}: {
  conditions: NotificationRule[]
  notificationRule: NotificationRule
  currentField: string
  currentFieldValue: FieldValueType
  moreFields?: MoreFieldsType
}): NotificationRule[] {
  return conditions.map(el => {
    if (el.id === notificationRule.id) {
      return {
        ...el,
        [currentField]: currentFieldValue,
        ...moreFields
      }
    } else return el
  })
}

export function isNotificationEdited(
  notificationRuleRefs: NotificationRuleRefDTO[],
  latestNotificationIdentifier: string
): boolean {
  return notificationRuleRefs.some(
    notificationRuleRef => notificationRuleRef?.notificationRuleRef === latestNotificationIdentifier
  )
}

export function toggleNotification(
  notificationToToggle: NotificationToToggle,
  notificationsInTable: NotificationRuleResponse[]
): NotificationRuleResponse[] {
  return notificationsInTable.map(el => {
    if (el?.notificationRule?.identifier === notificationToToggle?.identifier) {
      return {
        ...el,
        enabled: !!notificationToToggle?.enabled
      }
    } else return el
  })
}

export function getUpdatedNotifications(
  latestNotification: RestResponseNotificationRuleResponse,
  notificationsInTable: NotificationRuleResponse[]
): NotificationRuleResponse[] {
  let updatedNotificationsInTable: NotificationRuleResponse[] = []
  const latestNotificationData = latestNotification?.resource as NotificationRuleResponse
  const latestNotificationIdentifier = latestNotification?.resource?.notificationRule?.identifier || ''

  if (!notificationsInTable.length) {
    // first time create
    updatedNotificationsInTable = [latestNotificationData]
  } else if (
    notificationsInTable.some(
      notificationInTable => notificationInTable?.notificationRule?.identifier === latestNotificationIdentifier
    )
  ) {
    // edit notification
    updatedNotificationsInTable = notificationsInTable.map(el => {
      if (el?.notificationRule?.identifier === latestNotificationIdentifier) {
        return {
          ...latestNotificationData,
          enabled: el?.enabled
        }
      } else {
        return el
      }
    })
  } else {
    // creation of notification
    updatedNotificationsInTable = [latestNotificationData, ...notificationsInTable]
  }

  return updatedNotificationsInTable
}

export function getUpdatedNotificationsRuleRefs(
  updatedNotificationsInTable: NotificationRuleResponse[]
): NotificationRuleRefDTO[] {
  return updatedNotificationsInTable.map(el => {
    return {
      enabled: !!el?.enabled,
      notificationRuleRef: el?.notificationRule?.identifier
    }
  })
}

export const getInitialNotificationRules = (prevStepData?: SRMNotification): NotificationRule[] => {
  return (prevStepData?.conditions as NotificationRule[]) || [createNotificationRule()]
}

export function validateNotificationConditions(
  dataTillCurrentStep: {
    conditions: NotificationRule[]
    type: SRMNotificationType
    identifier?: string | undefined
    enabled?: boolean | undefined
    name?: string | undefined
    notificationMethod?: CVNGNotificationChannel | undefined
  },
  values: NotificationConditions,
  getString: (key: StringKeys) => string
) {
  const errors = {}
  dataTillCurrentStep?.conditions?.forEach((condition, index) => {
    if (!condition?.condition && !values?.conditions?.[index]?.condition) {
      set(errors, `conditions.${index}.condition`, getString('cv.notifications.validations.conditionIsRequired'))
    }
    if (
      condition?.condition?.value === Condition.CODE_ERRORS ||
      values?.conditions?.[index]?.condition === Condition.CODE_ERRORS
    ) {
      if (!condition?.eventStatus?.length && !values?.conditions?.[index]?.eventStatus?.length) {
        set(errors, `conditions.${index}.eventStatus`, getString('cv.notifications.validations.eventStatusIsRequired'))
      }
      if (!condition?.eventType?.length && !values?.conditions?.[index]?.eventType?.length) {
        set(errors, `conditions.${index}.eventType`, getString('cv.notifications.validations.eventTypeIsRequired'))
      }
    }
  })
  return errors
}
