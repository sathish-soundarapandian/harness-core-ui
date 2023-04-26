/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { GetDataError } from 'restful-react'
import type { LogAnalysisRadarChartListDTO, LogData, LogFeedback } from 'services/cv'
import type {
  LogAnalysisMessageFrequency,
  LogAnalysisRowData
} from '@cv/components/ExecutionVerification/components/LogAnalysisContainer/LogAnalysis.types'
import type { UpdateEventPreferenceOpenFn } from '../../LogAnalysisRow.types'

export interface LogAnalysisDetailsDrawerProps {
  rowData: LogAnalysisRowData
  onHide: (data?: any) => void
  isDataLoading?: boolean
  logsError?: GetDataError<unknown> | null
  retryLogsCall?: () => void
  index: number | null
  onUpdatePreferenceDrawerOpen: (options: UpdateEventPreferenceOpenFn) => void
  onJiraDrawerOpen: (options: UpdateEventPreferenceOpenFn) => void
}

export interface RiskAndMessageFormProps {
  handleSubmit: () => void
  hasSubmitted?: boolean
}

export interface ActivityHeadingContentProps {
  count: number
  messageFrequency?: LogAnalysisMessageFrequency[]
  activityType?: LogData['tag']
  riskStatus?: LogAnalysisRadarChartListDTO['risk']
  feedback?: LogFeedback
  feedbackApplied?: LogFeedback
}

export interface SampleDataProps {
  logMessage?: string
}
