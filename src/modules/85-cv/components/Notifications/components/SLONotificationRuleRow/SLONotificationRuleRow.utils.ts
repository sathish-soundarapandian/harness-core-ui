/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import { defaultOption } from '../../NotificationsContainer.constants'
import { SLOCondition, sloConditionOptions } from './SLONotificationRuleRow.constants'

export const getValueFromEvent = (e: React.FormEvent<HTMLElement>): string | SelectOption => {
  return (e?.target as any)?.value || defaultOption
}

export const getSLOConditionOptions = (isCompositeRequestBasedSLO?: boolean) => {
  if (isCompositeRequestBasedSLO) {
    return sloConditionOptions.filter(item => item.value !== SLOCondition.ERROR_BUDGET_REMAINING_MINUTES)
  } else {
    return sloConditionOptions
  }
}
