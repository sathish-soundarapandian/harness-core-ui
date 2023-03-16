/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { MultiSelectDropDown, MultiSelectOption } from '@harness/uicore'
import { defaultTo, flatten, uniqBy, has } from 'lodash-es'
import type { ExecutionStatus } from '@pipeline/utils/statusHelpers'
import { StringKeys, useStrings } from 'framework/strings'

type FilterExecutionStatus = Exclude<
  ExecutionStatus,
  | 'NotStarted'
  | 'Queued'
  | 'Skipped'
  | 'Pausing'
  | 'Suspended'
  | 'QueuedLicenseLimitReached'
  | 'QueuedExecutionConcurrencyReached'
>

export const stringsMap: Record<FilterExecutionStatus, StringKeys> = {
  Aborted: 'pipeline.executionFilters.labels.Aborted',
  AbortedByFreeze: 'pipeline.executionFilters.labels.AbortedByFreeze',
  Discontinuing: 'pipeline.executionFilters.labels.Aborted',
  Running: 'pipeline.executionFilters.labels.Running',
  AsyncWaiting: 'pipeline.executionFilters.labels.Running',
  TaskWaiting: 'pipeline.executionFilters.labels.Running',
  TimedWaiting: 'pipeline.executionFilters.labels.Running',
  Failed: 'pipeline.executionFilters.labels.Failed',
  Errored: 'pipeline.executionFilters.labels.Failed',
  Expired: 'pipeline.executionFilters.labels.Expired',
  Paused: 'pipeline.executionFilters.labels.Paused',
  ResourceWaiting: 'pipeline.executionFilters.labels.Waiting',
  Success: 'pipeline.executionFilters.labels.Success',
  IgnoreFailed: 'pipeline.executionFilters.labels.Success',
  ApprovalRejected: 'pipeline.executionFilters.labels.ApprovalRejected',
  InterventionWaiting: 'pipeline.executionFilters.labels.InterventionWaiting',
  ApprovalWaiting: 'pipeline.executionFilters.labels.ApprovalWaiting',
  InputWaiting: 'pipeline.executionFilters.labels.Waiting',
  WaitStepRunning: 'pipeline.executionFilters.labels.Waiting'
}

type GroupedOptions = Record<StringKeys, ExecutionStatus[]>

/**
 * @example
 * {
 *    pipeline.executionFilters.label.Aborted: [Aborted],
 *    pipeline.executionFilters.label.Success: [Success, IgnoreFailed],
 *    ...
 * }
 */
const groupedOptions = Object.entries(stringsMap).reduce<GroupedOptions>((p, [status, strKey]) => {
  if (!Array.isArray(p[strKey])) {
    p[strKey] = []
  }

  p[strKey].push(status as ExecutionStatus)

  return p
}, {} as GroupedOptions)

export interface StatusSelectProps {
  value?: ExecutionStatus[] | null
  onSelect(status: ExecutionStatus[] | null): void
}

export default function StatusSelect(props: StatusSelectProps): React.ReactElement {
  const { value, onSelect } = props
  const { getString } = useStrings()

  const items = React.useMemo(
    () =>
      Object.entries(groupedOptions).map(
        ([key, status]): MultiSelectOption => ({
          label: getString(key as StringKeys),
          value: status as any
        })
      ),
    [getString]
  )

  const actualValue = React.useMemo(
    () =>
      uniqBy(
        flatten(defaultTo(value, []))
          .filter(val => has(stringsMap, val))
          .map((val): MultiSelectOption => {
            const key = stringsMap[val as FilterExecutionStatus]

            return { label: getString(key), value: groupedOptions[key] as any }
          }),
        row => row.label
      ),
    [getString, value]
  )

  return (
    <MultiSelectDropDown
      minWidth={120}
      buttonTestId="status-select"
      value={actualValue}
      onChange={option => {
        onSelect((option.flatMap(item => item.value) as ExecutionStatus[]) || null)
      }}
      items={items}
      usePortal={true}
      placeholder={getString('status')}
    />
  )
}
