/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color } from '@harness/design-system'
import { ChangeSourceCategoryName } from '@cv/pages/ChangeSource/ChangeSourceDrawer/ChangeSourceDrawer.constants'
import type { UseStringsReturn } from 'framework/strings'
import type { CategoryCountDetails, ChangeSourceDTO, ChangeSummaryDTO } from 'services/cv'
import type { ChangeSourceCardData } from './ChangesSourceCard.types'
import { changeLabel } from './ChangesSourceCard.constants'

const labelByCategory = (
  categoryType: ChangeSourceDTO['category'] | 'Changes',
  getString: UseStringsReturn['getString']
): string => {
  switch (categoryType) {
    case ChangeSourceCategoryName.INFRASTRUCTURE:
      return getString('infrastructureText')
    case ChangeSourceCategoryName.DEPLOYMENT:
      return getString('deploymentsText')
    case ChangeSourceCategoryName.FEATURE_FLAG:
      return getString('common.purpose.cf.continuous')
    case ChangeSourceCategoryName.ALERT:
      return getString('cv.changeSource.tooltip.incidents')
    case ChangeSourceCategoryName.CHAOS_EXPERIMENT:
      return getString('chaos.chaosExperiment')
    case changeLabel:
      return getString('changes')
    default:
      return ''
  }
}

const createChangeSourceCardData = (
  category: CategoryCountDetails,
  categoryType: ChangeSourceDTO['category'] | 'Changes',
  getString: UseStringsReturn['getString']
): ChangeSourceCardData => ({
  count: getValue(category?.count),
  id: categoryType ?? '',
  label: labelByCategory(categoryType, getString),
  percentage: getValue(category?.percentageChange)
})

const getValue = (item: number | undefined): number => (item && Number.isNaN(item) ? 0 : item || 0)

export const zeroIfUndefined = (item: number | undefined): number => item || 0

export const calculateChangePercentage = (
  getString: UseStringsReturn['getString'],
  changeSummary?: ChangeSummaryDTO
): ChangeSourceCardData[] => {
  if (changeSummary && changeSummary?.categoryCountMap && changeSummary?.total) {
    const { categoryCountMap, total } = changeSummary
    return [
      createChangeSourceCardData(total as CategoryCountDetails, changeLabel, getString),
      ...Object.entries(categoryCountMap).map(categoryCountEntry =>
        createChangeSourceCardData(
          categoryCountEntry[1],
          categoryCountEntry[0] as ChangeSourceDTO['category'],
          getString
        )
      )
    ]
  }
  return []
}

export const getTickerColor = (percentage: number): Color => (percentage > -1 ? Color.GREEN_600 : Color.RED_500)
