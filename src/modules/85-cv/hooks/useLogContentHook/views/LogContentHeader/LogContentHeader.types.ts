/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import type { LogTypes, TimeRange } from '../../useLogContentHook.types'

export interface LogContentHeaderProps {
  logType: LogTypes
  verifyStepExecutionId?: string
  serviceName?: string
  envName?: string
  healthSource?: SelectOption
  handleHealthSource?: (healthSource: SelectOption) => void
  timeRange?: TimeRange
  handleTimeRange?: (timeRange: TimeRange) => void
  errorLogsOnly: boolean
  handleDisplayOnlyErrors: (errorLogsOnly: boolean) => void
  monitoredServiceIdentifier?: string
}
