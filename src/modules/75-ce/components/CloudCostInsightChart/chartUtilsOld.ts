/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { DataPoint, TimeSeriesDataPoints } from 'services/ce/services'

type appMapType = Record<string, Array<[number, Array<DataPoint>]>>
type idMapType = Record<string, { id: string; name: string }>

export interface ChartConfigType {
  name: string
  nodeId: string
  data: Array<[number, Array<DataPoint>]>
  showInLegend: boolean
  marker: {
    symbol: string
  }
  color: string
}

export function transformTimeSeriesData(
  data: TimeSeriesDataPoints[] = [],
  columnSequence: string[] = []
): ChartConfigType[] {
  const appMap: appMapType = {}
  const idMap: idMapType = {}

  data.forEach(item => {
    item.values.forEach(value => {
      if (value) {
        const key = value?.key?.id || 'Total'

        if (!appMap[key]) {
          appMap[key] = []
        }

        if (!idMap[key]) {
          idMap[key] = {
            id: value?.key?.id,
            name: value?.key?.name
          }
        }
        appMap[key].push([+item.time, value.value])
      }
    })
  })
  const config = getChartConfig(appMap, idMap)

  sortCCMData(config, columnSequence, 'nodeId')

  return config
}

function getChartConfig(appMap: appMapType, idMap: idMapType): ChartConfigType[] {
  return Object.keys(appMap).map(key => {
    return {
      name: idMap[key].name,
      nodeId: idMap[key].id,
      data: appMap[key],
      showInLegend: false,
      marker: {
        symbol: 'circle'
      },
      color: ''
    }
  })
}

export function sortCCMData(data: ChartConfigType[], columnSequence: string[] = [], key: 'nodeId'): void {
  if (columnSequence.length) {
    data.sort((configA, configB) => {
      const indexA = columnSequence.indexOf(configA[key]),
        indexB = columnSequence.indexOf(configB[key])

      if (indexA === indexB) {
        return 0
      }

      if (indexA === -1) {
        return 1
      }

      if (indexB === -1) {
        return -1
      }

      return indexA >= indexB ? 1 : -1
    })
  }
}
