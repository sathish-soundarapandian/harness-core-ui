/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName, SelectOption } from '@harness/uicore'
import { cloneDeep } from 'lodash-es'
import type { AppDynamicsFileDefinition } from 'services/cv'
import { MetricPathKeyPrefix } from './MetricPath.constants'
import type { MetricPathData } from './MetricPath.types'

export const onMetricPathChange = (
  selectedOption: SelectOption,
  index: number,
  metricPathData: MetricPathData
): MetricPathData => {
  // new logic
  const selectedPath = selectedOption.value as string
  const currentKey = MetricPathKeyPrefix + index
  const nextItemKey = MetricPathKeyPrefix + parseInt((index + 1).toString())
  const prvKey = MetricPathKeyPrefix + index
  const path = metricPathData[prvKey]?.path
  const lastItem = Object.keys(metricPathData)[Object.keys(metricPathData).length - 1]

  let metricPathDetails = cloneDeep(metricPathData)

  // delete values after index
  const lastIndex = parseInt(lastItem.split('_')[1])
  const lastItemexist = !!metricPathDetails[lastItem]
  if (index < lastIndex && lastItemexist) {
    for (let idx = index + 1; idx <= lastIndex; idx++) {
      delete metricPathDetails[MetricPathKeyPrefix + idx]
    }
  }

  if (!metricPathDetails[nextItemKey] && selectedPath) {
    // adding first time
    const nextPath = path?.length ? `${path}|${selectedPath}` : selectedPath
    metricPathDetails = {
      ...metricPathDetails,
      [nextItemKey]: { value: '', path: nextPath, isMetric: false }
    }
  }

  return {
    ...metricPathDetails,
    [currentKey]: {
      value: selectedPath,
      path,
      isMetric: selectedOption?.icon?.name ? isTypeMetric(getTypeByIconName(selectedOption?.icon?.name)) : false
    }
  }
}

export const isTypeMetric = (selctedType: AppDynamicsFileDefinition['type'] | undefined): boolean =>
  selctedType === 'leaf'

export const getTypeByIconName = (icon: IconName): AppDynamicsFileDefinition['type'] | undefined => {
  switch (icon) {
    case 'main-folder-open':
      return 'folder'
    case 'main-like':
      return 'leaf'
    default:
      return
  }
}

export const getSecondLastItemKey = (metricPathValue: MetricPathData): string => {
  let secondLastIndex = 0
  const metrickeysArray = Object.keys(metricPathValue)
  if (metrickeysArray.length > 1) {
    secondLastIndex = metrickeysArray.length - 2
  }
  return metrickeysArray[secondLastIndex]
}
