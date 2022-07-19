/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { defaultTo, findLast, set, snakeCase } from 'lodash-es'

import {
  isExecutionComplete,
  isExecutionFailed,
  isExecutionRunningLike,
  isExecutionSuccess
} from '@pipeline/utils/statusHelpers'

import { getDefaultReducerState } from './utils'
import type { Action, ActionType, LogSectionData, State, ProgressMapValue, UnitLoadingStatus } from './types'

function parseToTime(p: unknown): number | undefined {
  if (typeof p === 'number') {
    return p
  }

  if (typeof p === 'string') {
    const t = parseInt(p, 10)

    if (!Number.isNaN(t)) {
      return t
    }
  }
}

const NON_MUTATE_STATES: UnitLoadingStatus[] = ['LOADING', 'QUEUED']

export function createSections(state: State, action: Action<ActionType.CreateSections>): State {
  const { node, selectedStep, selectedStage, getSectionName } = action.payload

  if (!node) {
    return getDefaultReducerState({ selectedStage, selectedStep })
  }

  const isSameStage = selectedStage === state.selectedStage
  const isSameStep = isSameStage && selectedStep === state.selectedStep

  /**
   * task object must always be picked from the first entry
   * in `executableResponses`
   *
   * It can be either be a `taskChain`, `task` or `sync`
   */
  const executableResponse = defaultTo(node?.executableResponses?.[0], {})
  const task =
    executableResponse.taskChain ||
    executableResponse.task ||
    executableResponse.sync ||
    executableResponse.async ||
    executableResponse.child

  // eslint-disable-next-line prefer-const
  let { units = [], logKeys = [] } = defaultTo(task, {} as any)
  const progressMap = new Map<string, ProgressMapValue>()
  const isStepComplete = isExecutionComplete(node.status)
  let hasNoUnits = false

  if (units.length === 0 && logKeys.length > 0) {
    hasNoUnits = true
    units = logKeys.map((_: unknown, i: number) => getSectionName(i + 1))
  }

  if (Array.isArray(node.unitProgresses)) {
    node.unitProgresses.forEach(row => {
      /* istanbul ignore else */
      if (row.unitName) {
        progressMap.set(row.unitName, {
          status: row.status as UnitLoadingStatus,
          startTime: row.startTime,
          endTime: row.endTime
        })
      }
    })
  }

  const dataMap: Record<string, LogSectionData> = units.reduce(
    (acc: Record<string, LogSectionData>, unit: string, i: number) => {
      const key = logKeys[i]
      /**
       * progressMap must have a status for this unit.
       * In case it doesn't, fallback to the 'UNKNOWN' status.
       */
      const unitProgress: ProgressMapValue | undefined = hasNoUnits
        ? { status: snakeCase(defaultTo(node.status, 'NotStarted')).toUpperCase() as UnitLoadingStatus }
        : progressMap.get(unit)
      const unitStatus: UnitLoadingStatus = defaultTo(unitProgress?.status, 'NOT_STARTED')
      const currentStatus = state.dataMap[key]?.status
      const manuallyToggled = !!state.dataMap[key]?.manuallyToggled
      const isRunning = isExecutionRunningLike(unitStatus)

      acc[key] = {
        title: unit,
        data: isSameStep ? defaultTo(state.dataMap[key]?.data, []) : [],
        isOpen: isSameStep && manuallyToggled ? state.dataMap[key]?.isOpen : isRunning,
        manuallyToggled: isSameStep ? manuallyToggled : false,
        status: isSameStep && NON_MUTATE_STATES.includes(currentStatus) && isRunning ? currentStatus : unitStatus,
        unitStatus,
        startTime: parseToTime(unitProgress?.startTime),
        endTime: parseToTime(unitProgress?.endTime),
        dataSource: isRunning ? 'stream' : 'blob'
      }

      return acc
    },
    {}
  )

  let unitToOpen: string | null = null

  /* istanbul ignore else */
  if (logKeys.length > 1) {
    if (isStepComplete) {
      const isStepSuccess = isExecutionSuccess(node.status)

      // if step is successful
      if (isStepSuccess) {
        // open the first section
        unitToOpen = logKeys[0]
      } else {
        // find and open the first failed section
        const failedUnit = logKeys.find((key: string) => isExecutionFailed(dataMap[key]?.unitStatus))
        unitToOpen = defaultTo(failedUnit, null)
      }
    } else {
      // open the running section
      const runningUnit = findLast(logKeys, key => isExecutionRunningLike(dataMap[key]?.unitStatus))
      unitToOpen = defaultTo(runningUnit, null)
    }
  } else if (logKeys.length === 1) {
    const isExecutionRunning = isExecutionRunningLike(dataMap[logKeys[0]]?.unitStatus)

    // only open the unit if it is running/complete
    /* istanbul ignore else */
    if (isExecutionRunning || isStepComplete) {
      unitToOpen = logKeys[0]
    }
  }

  if (unitToOpen && !dataMap[unitToOpen].manuallyToggled) {
    // if we are opening a section the set it to loading
    /* istanbul ignore else */
    if (dataMap[unitToOpen].status !== 'QUEUED' && !dataMap[unitToOpen].data.length) {
      set(dataMap[unitToOpen], 'status', 'LOADING')
    }

    set(dataMap[unitToOpen], 'isOpen', true)
  }

  return {
    units,
    logKeys,
    dataMap,
    selectedStep,
    selectedStage,
    searchData: isSameStep ? { ...state.searchData } : getDefaultReducerState().searchData
  }
}
