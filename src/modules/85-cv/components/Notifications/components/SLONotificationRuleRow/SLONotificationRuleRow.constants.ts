/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'

export enum SLOCondition {
  ERROR_BUDGET_REMAINING_PERCENTAGE = 'ErrorBudgetRemainingPercentage',
  ERROR_BUDGET_REMAINING_MINUTES = 'ErrorBudgetRemainingMinutes',
  ERROR_BUDGET_BURN_RATE_IS_ABOVE = 'ErrorBudgetBurnRate'
}

export const sloConditionOptions: SelectOption[] = [
  { label: 'Error Budget remaining percentage', value: SLOCondition.ERROR_BUDGET_REMAINING_PERCENTAGE },
  { label: 'Error Budget remaining minutes', value: SLOCondition.ERROR_BUDGET_REMAINING_MINUTES },
  { label: 'Error Budget Burn Rate is above', value: SLOCondition.ERROR_BUDGET_BURN_RATE_IS_ABOVE }
]
