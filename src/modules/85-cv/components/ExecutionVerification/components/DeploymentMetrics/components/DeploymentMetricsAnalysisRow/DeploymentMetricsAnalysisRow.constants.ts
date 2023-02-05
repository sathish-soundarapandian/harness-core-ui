/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AnalysedDeploymentTestDataNode, HostData } from 'services/cv'
import type { UseStringsReturn } from 'framework/strings'

export type HostTestData = {
  risk: HostData['risk']
  points: Highcharts.SeriesLineOptions['data']
  name: string
  analysisReason?: AnalysedDeploymentTestDataNode['analysisReason']
  appliedThresholds?: AnalysedDeploymentTestDataNode['appliedThresholds']
  initialXvalue: number
}

export type HostControlTestData = Omit<HostTestData, 'risk' | 'name'> & {
  risk?: HostData['risk']
  name?: string | null
  initialXvalue: number
  controlDataType?: AnalysedDeploymentTestDataNode['controlDataType']
}

export const getAnalysisReason = (
  reason: string,
  getString: UseStringsReturn['getString'],
  verificationType: string
): string => {
  switch (reason) {
    case 'CUSTOM_FAIL_FAST_THRESHOLD':
      return getString('cv.metricsAnalysis.analysisReason.customFailFastThreshold')
    case 'ML_ANALYSIS':
      return getString('cv.metricsAnalysis.analysisReason.mlAnalysis', { verificationType })
    case 'NO_CONTROL_DATA':
      return getString('cv.metricsAnalysis.analysisReason.noControlData')
    case 'NO_TEST_DATA':
      return getString('cv.metricsAnalysis.analysisReason.noTestData')
    default:
      return ''
  }
}

export const MINIMUM_DEVIATION = 'MINIMUM_DEVIATION'
export const widthPercentagePerGraph = 1
