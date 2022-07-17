/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import produce from 'immer'
import { set, get } from 'lodash-es'
import { formatDatetoLocale } from '@common/utils/dateUtils'
import { sanitizeHTML } from '@common/utils/StringUtils'
import type { Action, ActionType, State, LogSectionData, LogLineData } from './types'

export function processLogsData(data: string): LogLineData[] {
  return String(data)
    .split('\n')
    .reduce<LogSectionData['data']>((accumulator, line) => {
      /* istanbul ignore else */
      if (line.length > 0) {
        try {
          const { level, time, out } = JSON.parse(line) as Record<string, string>

          accumulator.push({
            text: {
              level: sanitizeHTML(level),
              time: formatDatetoLocale(time),
              out: sanitizeHTML(out)
            }
          })
        } catch (e) {
          //
        }
      }

      return accumulator
    }, [])
}

export function updateSectionData(state: State, action: Action<ActionType.UpdateSectionData>): State {
  const { payload } = action

  return produce(state, draft => {
    const unit = state.dataMap[payload.id]
    const data = processLogsData(payload.data)

    if (!unit) {
      return state
    }

    // update status only for blob data
    /* istanbul ignore else */
    if (unit.dataSource === 'blob') {
      set(draft.dataMap[payload.id], 'status', unit.unitStatus)
    }

    set(draft.dataMap[payload.id], 'isOpen', true)

    if (payload.append) {
      const dataToupdate = get(draft.dataMap[payload.id], 'data', []) as LogLineData[]
      dataToupdate.push(...data)
      set(draft.dataMap[payload.id], 'data', dataToupdate)
    } else {
      set(draft.dataMap[payload.id], 'data', data)
    }
  })
}
