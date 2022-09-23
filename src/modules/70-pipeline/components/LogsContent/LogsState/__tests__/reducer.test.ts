/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { ActionType, State, Action, UnitLoadingStatus } from '../types'
import { reducer } from '../index'
import { getDefaultReducerState } from '../utils'

jest.mock('@common/utils/dateUtils', () => ({
  formatDatetoLocale: jest.fn().mockReturnValue('<MOCK_TIME>')
}))

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

function getCreateSectionsAction(statuses: UnitLoadingStatus[]): Action<ActionType.CreateSections> {
  return {
    type: ActionType.CreateSections,
    payload: {
      node: {
        executableResponses: [
          {
            taskChain: {
              logKeys: statuses.map((_, i) => `logKey${i + 1}`),
              units: statuses.map((_, i) => `Unit ${i + 1}`)
            } as any
          }
        ],
        unitProgresses: statuses.map((status, i) => ({ unitName: `Unit ${i + 1}`, status })) as any
      },
      selectedStep: 'SELECTED_STEP_1',
      selectedStage: 'SELECTED_STAGE_1',
      getSectionName: jest.fn()
    }
  }
}

function getUnitStatuses(state: State): string[] {
  return Object.values(state.dataMap).map(row => row.unitStatus)
}

function getDefaultStateWithSections(): State {
  return reducer(getDefaultReducerState(), getCreateSectionsAction(['NOT_STARTED', 'NOT_STARTED', 'NOT_STARTED']))
}

describe('logs state reducer tests', () => {
  test('CreateSections', () => {
    const state = reducer(
      getDefaultReducerState(),
      getCreateSectionsAction(['NOT_STARTED', 'NOT_STARTED', 'NOT_STARTED'])
    )

    expect(getUnitStatuses(state)).toMatchInlineSnapshot(`
          Array [
            "NOT_STARTED",
            "NOT_STARTED",
            "NOT_STARTED",
          ]
        `)
  })

  test('FetchSectionData', () => {
    const init = getDefaultStateWithSections()
    const state = reducer(init, { type: ActionType.FetchSectionData, payload: 'logKey1' })

    expect(init.dataMap.logKey1.status).toBe('NOT_STARTED')
    expect(state.dataMap.logKey1.status).toBe('LOADING')
  })

  test('FetchingSectionData', () => {
    const init = getDefaultStateWithSections()
    const state = reducer(init, { type: ActionType.FetchingSectionData, payload: 'logKey1' })

    expect(init.dataMap.logKey1.status).toBe('NOT_STARTED')
    expect(state.dataMap.logKey1.status).toBe('QUEUED')
  })

  test('UpdateSectionData', () => {
    const init = getDefaultStateWithSections()
    const state = reducer(init, {
      type: ActionType.UpdateSectionData,
      payload: { id: 'logKey1', data: JSON.stringify({ out: 'Line1', level: 'log', time: '123' }) }
    })

    expect(init.dataMap.logKey1.data).toEqual([])
    expect(state.dataMap.logKey1.data).toEqual([
      {
        text: { out: 'Line1', level: 'log', time: '<MOCK_TIME>' }
      }
    ])

    // update with append false
    const state2 = reducer(state, {
      type: ActionType.UpdateSectionData,
      payload: { id: 'logKey1', data: JSON.stringify({ out: 'Line2', level: 'log', time: '123' }) }
    })

    expect(state2.dataMap.logKey1.data).toEqual([
      {
        text: { out: 'Line2', level: 'log', time: '<MOCK_TIME>' }
      }
    ])

    // update with append true
    const state3 = reducer(state, {
      type: ActionType.UpdateSectionData,
      payload: { id: 'logKey1', data: JSON.stringify({ out: 'Line2', level: 'log', time: '123' }), append: true }
    })

    expect(state3.dataMap.logKey1.data).toEqual([
      {
        text: { out: 'Line1', level: 'log', time: '<MOCK_TIME>' }
      },
      {
        text: { out: 'Line2', level: 'log', time: '<MOCK_TIME>' }
      }
    ])

    // non existing key
    const state4 = reducer(state, {
      type: ActionType.UpdateSectionData,
      payload: {
        id: 'logKey_nonexisting',
        data: JSON.stringify({ out: 'Line2', level: 'log', time: '123' }),
        append: true
      }
    })

    expect(state4).toEqual(state)
  })

  test('ResetSection', () => {
    const init = getDefaultStateWithSections()
    init.dataMap.logKey1.isOpen = true

    const state = reducer(init, { type: ActionType.ResetSection, payload: 'logKey1' })

    expect(init.dataMap.logKey1.isOpen).toEqual(true)
    expect(state.dataMap.logKey1.isOpen).toEqual(false)

    const state2 = reducer(init, { type: ActionType.ResetSection, payload: 'logKey_nonexisting' })

    expect(init.dataMap.logKey1.isOpen).toEqual(true)
    expect(state2.dataMap.logKey1.isOpen).toEqual(true)
  })

  test('ToggleSection', () => {
    const init = getDefaultStateWithSections()

    const state = reducer(init, { type: ActionType.ToggleSection, payload: 'logKey1' })

    expect(init.dataMap.logKey1.isOpen).toEqual(false)
    expect(init.dataMap.logKey1.manuallyToggled).toEqual(false)
    expect(state.dataMap.logKey1.isOpen).toEqual(true)
    expect(state.dataMap.logKey1.manuallyToggled).toEqual(true)
  })

  test('Search', () => {
    const init = getDefaultStateWithSections()
    init.dataMap.logKey1.isOpen = true
    init.dataMap.logKey1.data = [
      {
        text: { out: 'Failure:\nThis test 1 has failed', level: 'log', time: '<MOCK_TIME>' }
      },
      {
        text: { out: 'Failure:\nThis test  2 has failed', level: 'log', time: '<MOCK_TIME>' }
      }
    ]

    const state = reducer(init, { type: ActionType.Search, payload: 'failed' })

    expect(state.dataMap.logKey1.data[0].searchIndices).toEqual({ out: [0] })
    expect(state.dataMap.logKey1.data[1].searchIndices).toEqual({ out: [1] })
    expect(state.searchData).toEqual({ currentIndex: 0, linesWithResults: [0, 1], text: 'failed' })
  })

  test('ResetSearch', () => {
    const init = getDefaultStateWithSections()
    init.searchData = { currentIndex: 0, linesWithResults: [0], text: 'failed' }
    init.dataMap.logKey1.isOpen = true
    init.dataMap.logKey1.data = [
      {
        text: { out: 'Failure:\nThis test has failed', level: 'log', time: '<MOCK_TIME>' },
        searchIndices: { out: [0] }
      }
    ]

    const state = reducer(init, { type: ActionType.ResetSearch, payload: '' })

    expect(state.dataMap.logKey1.data[0].searchIndices).toBeUndefined()
    expect(state.searchData).toEqual({ currentIndex: 0, linesWithResults: [], text: '' })
  })

  test('GoToNextSearchResult', () => {
    const init = getDefaultStateWithSections()
    init.searchData = { currentIndex: 0, linesWithResults: [0, 1], text: 'failed' }
    init.dataMap.logKey1.isOpen = true
    init.dataMap.logKey1.data = [
      {
        text: { out: 'Failure:\nThis test 1 has failed', level: 'log', time: '<MOCK_TIME>' },
        searchIndices: { out: [0] }
      },
      {
        text: { out: 'Failure:\nThis test  2 has failed', level: 'log', time: '<MOCK_TIME>' },
        searchIndices: { out: [1] }
      }
    ]

    const state = reducer(init, { type: ActionType.GoToNextSearchResult, payload: '' })

    expect(state.searchData).toEqual({ currentIndex: 1, linesWithResults: [0, 1], text: 'failed' })
  })

  test('GoToPrevSearchResult', () => {
    const init = getDefaultStateWithSections()
    init.searchData = { currentIndex: 1, linesWithResults: [0, 1], text: 'failed' }
    init.dataMap.logKey1.isOpen = true
    init.dataMap.logKey1.data = [
      {
        text: { out: 'Failure:\nThis test 1 has failed', level: 'log', time: '<MOCK_TIME>' },
        searchIndices: { out: [0] }
      },
      {
        text: { out: 'Failure:\nThis test  2 has failed', level: 'log', time: '<MOCK_TIME>' },
        searchIndices: { out: [1] }
      }
    ]

    const state = reducer(init, { type: ActionType.GoToPrevSearchResult, payload: '' })

    expect(state.searchData).toEqual({ currentIndex: 0, linesWithResults: [0, 1], text: 'failed' })
  })

  test('default', () => {
    const init = getDefaultStateWithSections()
    const state = reducer(init, { type: 'any action', payload: '' } as any)

    expect(state).toEqual(init)
  })
})
