/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { MultiSelectOption, SelectOption } from '@harness/uicore'
import {
  defaultOption,
  eventStatusDefaultOptions,
  eventTypeDefaultOptions
} from '../../NotificationsContainer.constants'
import type { NotificationRule } from '../../NotificationsContainer.types'
import {
  allEventsTypeOption,
  Condition,
  eventTypeOptions
} from '../ConfigureMonitoredServiceAlertConditions/ConfigureMonitoredServiceAlertConditions.constants'
import type { FieldValueType, MoreFieldsType } from './NotificationRuleRow.types'

export const getArrayOrEmpty = (value: unknown): MultiSelectOption[] => {
  return Array.isArray(value) ? value : []
}

export const getValueFromEvent = (e: React.FormEvent<HTMLElement>): string | SelectOption => {
  return (e?.target as any)?.value || defaultOption
}

export const onConditionChange = (
  selectedOption: SelectOption,
  notificationRule: NotificationRule,
  handleChangeField: (
    notificationRule: NotificationRule,
    currentFieldValue: FieldValueType,
    currentField: string,
    moreFields?: MoreFieldsType
  ) => void
): void => {
  const selecteOptionValue = selectedOption?.value
  let moreFields
  switch (selecteOptionValue) {
    case Condition.CHANGE_IMPACT:
    case Condition.CHANGE_OBSERVED: {
      moreFields = { changeType: notificationRule.changeType || defaultOption }
      break
    }
    case Condition.HEALTH_SCORE: {
      moreFields = { threshold: notificationRule.threshold || defaultOption }
      break
    }
    case Condition.CODE_ERRORS: {
      moreFields = {
        eventStatus: notificationRule.eventStatus || eventStatusDefaultOptions,
        eventType: notificationRule.eventType || eventTypeDefaultOptions
      }
      break
    }
  }
  handleChangeField(notificationRule, selectedOption, 'condition', moreFields)
}

export const getOptionsWithAllEvents = (
  previous: MultiSelectOption[],
  current: MultiSelectOption[]
): MultiSelectOption[] => {
  let result: MultiSelectOption[] = current

  if (previous.includes(allEventsTypeOption) && !current.includes(allEventsTypeOption)) {
    // All Events was unchecked -> uncheck everything
    result = []
  } else if (!previous.includes(allEventsTypeOption) && current.includes(allEventsTypeOption)) {
    // All Events was checked -> check everything
    result = eventTypeOptions
  } else if (
    previous.includes(allEventsTypeOption) &&
    current.includes(allEventsTypeOption) &&
    previous.length > current.length
  ) {
    // All Events is checked and other option was unchecked -> uncheck All Events (first element)
    result.shift()
  } else if (
    !previous.includes(allEventsTypeOption) &&
    !current.includes(allEventsTypeOption) &&
    current.length === eventTypeOptions.length - 1
  ) {
    // All Events is unchecked and all other options were checked -> check All Events
    result.unshift(allEventsTypeOption)
  }

  return result
}
