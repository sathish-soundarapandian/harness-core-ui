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
    case changeLabel:
      return getString('changes')
    default:
      return ''
  }
}

const createChangeSourceCardData = (
  category: CategoryCountDetails,
  categoryType: ChangeSourceDTO['category'] | 'Changes',
  ffIntegration: boolean,
  getString: UseStringsReturn['getString']
): ChangeSourceCardData => {
  if (ffIntegration) {
    return {
      count: getValue(category?.count),
      id: categoryType ?? '',
      label: labelByCategory(categoryType, getString),
      percentage: getValue(category?.percentageChange)
    }
  } else {
    const count = category?.count && isNaN(category?.count) ? 0 : category?.count || 0
    const previousCount =
      category?.countInPrecedingWindow && isNaN(category?.countInPrecedingWindow)
        ? 0
        : category?.countInPrecedingWindow || 0
    const categoryPercentage: number = ((count - previousCount) / previousCount) * 100
    return {
      count,
      id: categoryType ?? '',
      label: labelByCategory(categoryType, getString),
      percentage: isNaN(categoryPercentage) ? 0 : categoryPercentage === Infinity ? 100 : categoryPercentage
    }
  }
}

const getValue = (item: number | undefined): number => (item && Number.isNaN(item) ? 0 : item || 0)

export const zeroIfUndefined = (item: number | undefined): number => item || 0

export const calculateChangePercentage = (
  getString: UseStringsReturn['getString'],
  ffIntegration: boolean,
  changeSummary?: ChangeSummaryDTO
): ChangeSourceCardData[] => {
  if (changeSummary && changeSummary?.categoryCountMap && changeSummary?.total) {
    if (ffIntegration) {
      const { categoryCountMap, total } = changeSummary
      return [
        createChangeSourceCardData(total as CategoryCountDetails, changeLabel, ffIntegration, getString),
        ...Object.entries(categoryCountMap).map(categoryCountEntry =>
          createChangeSourceCardData(
            categoryCountEntry[1],
            categoryCountEntry[0] as ChangeSourceDTO['category'],
            ffIntegration,
            getString
          )
        )
      ]
    } else {
      const { categoryCountMap } = changeSummary
      const { Infrastructure, Deployment, Alert } = categoryCountMap
      const total = {
        count:
          zeroIfUndefined(Infrastructure?.count) + zeroIfUndefined(Deployment?.count) + zeroIfUndefined(Alert?.count),
        countInPrecedingWindow:
          zeroIfUndefined(Infrastructure?.countInPrecedingWindow) +
          zeroIfUndefined(Deployment?.countInPrecedingWindow) +
          zeroIfUndefined(Alert?.countInPrecedingWindow)
      }
      return [
        createChangeSourceCardData(total, changeLabel, ffIntegration, getString),
        createChangeSourceCardData(
          Deployment,
          ChangeSourceCategoryName.DEPLOYMENT as ChangeSourceDTO['category'],
          ffIntegration,
          getString
        ),
        createChangeSourceCardData(
          Infrastructure,
          ChangeSourceCategoryName.INFRASTRUCTURE as ChangeSourceDTO['category'],
          ffIntegration,
          getString
        ),
        createChangeSourceCardData(
          Alert,
          ChangeSourceCategoryName.ALERT as ChangeSourceDTO['category'],
          ffIntegration,
          getString
        )
      ]
    }
  }
  return []
}

export const getTickerColor = (percentage: number): Color => (percentage > -1 ? Color.GREEN_600 : Color.RED_500)
