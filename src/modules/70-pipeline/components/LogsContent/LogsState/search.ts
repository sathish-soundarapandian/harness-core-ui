/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import produce from 'immer'
import { mapValues, range } from 'lodash-es'

import { sanitizeHTML } from '@common/utils/StringUtils'
import { getRegexForSearch } from './utils'
import type { Action, ActionType, TextKeys, State } from './types'

// make sure that this array has same order as render
const dataKeys: TextKeys[] = ['level', 'time', 'out']

export function search(state: State, action: Action<ActionType.Search>): State {
  const { payload } = action
  const searchRegex = getRegexForSearch(sanitizeHTML(payload))

  return produce(state, draft => {
    const linesWithResults: number[] = []
    let prevLinesCount = 0

    draft.dataMap = mapValues(state.dataMap, unit => {
      // do not search in closed units
      if (!unit.isOpen) {
        return unit
      }

      return {
        ...unit,
        data: unit.data.map(lineData => {
          const searchIndices: Partial<Record<TextKeys, number[]>> = {}
          dataKeys.forEach(key => {
            const value = lineData.text[key]
            /* istanbul ignore else */
            if (value) {
              const matches = value.match(searchRegex)

              if (matches && matches.length) {
                const prevResultsCount = linesWithResults.length

                // store all the indices of the search results
                searchIndices[key] = range(prevResultsCount, prevResultsCount + matches.length)

                // store the line numbers of the search results
                // same line number is stored multiple times for multiple results of search
                linesWithResults.push(...Array.from<number>({ length: matches.length }).fill(prevLinesCount))
              }
            }
          })

          prevLinesCount++

          return {
            ...lineData,
            searchIndices
          }
        })
      }
    })

    draft.searchData = {
      currentIndex: 0,
      text: payload,
      linesWithResults
    }
  })
}
