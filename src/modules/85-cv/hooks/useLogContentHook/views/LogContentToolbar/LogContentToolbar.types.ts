/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { CVNGLogDTO } from 'services/cv'
import type { LogTypes, TimeRange } from '../../useLogContentHook.types'
import type { ExecutionLogSearchProps, LogLineData } from '../ExecutionLog/ExecutionLog.types'

export interface LogContentToolbarProps {
  logType: LogTypes
  data?: Array<LogLineData['text']> | CVNGLogDTO[]
  searchInput?: React.ReactElement<ExecutionLogSearchProps>
  isFullScreen: boolean
  setIsFullScreen: (isFullScreen: boolean | ((isFullScreen: boolean) => boolean)) => void
  isVerifyStep: boolean
  timeRange?: TimeRange
  isMonitoredService?: boolean
  handleDownloadLogs: () => Promise<void>
}
