/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { GetDataError } from 'restful-react'
import type {
  PageAnalyzedRadarChartLogDataDTO,
  PageLogAnalysisRadarChartListDTO,
  RestResponseAnalyzedRadarChartLogDataWithCountDTO,
  RestResponseLogAnalysisRadarChartListWithCountDTO
} from 'services/cv'
import type { LogAnalysisRowData } from '../../LogAnalysis.types'

export interface LogAnalysisRowProps {
  data: LogAnalysisRowData[]
  className?: string
  isErrorTracking?: boolean
  showPagination?: boolean
  logResourceData?: PageLogAnalysisRadarChartListDTO | PageAnalyzedRadarChartLogDataDTO
  goToPage?(val: number): void
  selectedLog?: string | null
  resetSelectedLog?: () => void
  activityId?: string
  isServicePage?: boolean
  startTime?: number
  endTime?: number
  monitoredServiceIdentifier?: string
  refetchLogAnalysis?: () => void
}

export interface LogAnalysisDataRowProps {
  rowData: LogAnalysisRowData
  onSelect?: (
    isSelected: boolean,
    selectedData: LogAnalysisRowData,
    index: number,
    chartOptions: Highcharts.Options
  ) => void
  onDrawOpen: (index: number) => void
  onUpdateEventPreferenceDrawer: (options: UpdateEventPreferenceOpenFn) => void
  onJiraModalOpen: (options: UpdateEventPreferenceOpenFn) => void
  index: number
  isSelected: boolean
  isErrorTracking?: boolean
}

export type CompareLogEventsInfo = {
  data: LogAnalysisRowData
  index: number
}

export interface LogsRowData {
  logsData: RestResponseAnalyzedRadarChartLogDataWithCountDTO | RestResponseLogAnalysisRadarChartListWithCountDTO | null
  logsLoading: boolean
  logsError: GetDataError<unknown> | null
}

export interface UpdateEventPreferenceOpenFn {
  selectedIndex: number
  isOpenedViaLogsDrawer?: boolean
  rowData?: LogAnalysisRowData
}

export interface InitialDrawerValuesType {
  showDrawer: boolean
  selectedRowData: LogAnalysisRowData | null
  isFetchUpdatedData?: boolean
  isOpenedViaLogsDrawer?: boolean
}
