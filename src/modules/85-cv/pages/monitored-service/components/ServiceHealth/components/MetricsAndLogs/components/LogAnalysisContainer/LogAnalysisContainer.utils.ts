/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { getRiskColorValue } from '@cv/utils/CommonUtils'
import type { AnalyzedLogDataDTO, RestResponsePageAnalyzedLogDataDTO } from 'services/cv'
import type { LogAnalysisRowData } from '@cv/components/LogsAnalysis/LogAnalysis.types'

export function roundOffRiskScore(log: AnalyzedLogDataDTO): number {
  return (
    log?.logData?.riskScore && log?.logData?.riskScore % 1 !== 0
      ? log?.logData?.riskScore?.toFixed(1)
      : log?.logData?.riskScore
  ) as number
}

export function getLogAnalysisTableData(logsData: RestResponsePageAnalyzedLogDataDTO | null): LogAnalysisRowData[] {
  return (
    logsData?.resource?.content?.map(log => ({
      clusterType: log?.logData?.tag,
      count: log?.logData?.count as number,
      message: log?.logData?.text as string,
      messageFrequency: [
        {
          name: 'trendData',
          type: 'column',
          color: getRiskColorValue(log?.logData?.riskStatus),
          data: log?.logData?.trend?.map(trend => trend.count) as number[]
        }
      ],
      riskScore: roundOffRiskScore(log),
      riskStatus: log?.logData?.riskStatus
    })) ?? []
  )
}
