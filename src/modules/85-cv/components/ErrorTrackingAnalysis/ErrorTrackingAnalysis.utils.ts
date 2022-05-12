/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { UseStringsReturn } from 'framework/strings'
import type { AnalyzedLogDataDTO } from 'services/cv'
import { getRiskColorValue } from '@cv/utils/CommonUtils'
import { ErrorTrackingAnalysisRowData, ErrorTrackingEvents } from './ErrorTrackingAnalysis.types'

export const getClusterTypes = (getString: UseStringsReturn['getString']): SelectOption[] => {
  return [
    { label: getString('auditTrail.allEvents'), value: '' },
    { label: getString('cv.known'), value: ErrorTrackingEvents.KNOWN },
    { label: getString('cv.unknown'), value: ErrorTrackingEvents.UNKNOWN },
    { label: getString('cv.unexpected'), value: ErrorTrackingEvents.UNEXPECTED }
  ]
}

export function getErrorTrackingAnalysisTableData(logsData: AnalyzedLogDataDTO[]): ErrorTrackingAnalysisRowData[] {
  return (
    logsData.map(log => ({
      clusterType: log.logData?.tag,
      count: log.logData?.count ?? 0,
      message: log.logData?.text ?? '',
      messageFrequency: [
        {
          name: 'trendData',
          type: 'column',
          color: getRiskColorValue(log.logData?.riskStatus),
          data: log.logData?.trend?.map(t => t.count ?? 0)
        }
      ],
      riskScore: log.logData?.riskScore ?? 0,
      riskStatus: log.logData?.riskStatus
    })) ?? []
  )
}
