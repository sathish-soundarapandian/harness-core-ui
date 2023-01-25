/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { AnalysedDeploymentTestDataNode, HostData } from 'services/cv'

export type HostTestData = {
  risk: HostData['risk']
  points: Highcharts.SeriesLineOptions['data']
  name: string
  analysisReason?: AnalysedDeploymentTestDataNode['analysisReason']
}

export type HostControlTestData = Omit<HostTestData, 'risk' | 'name'> & {
  risk?: HostData['risk']
  name?: string | null
}

export const ANALYSIS_REASON_MAPPING: { [key: string]: string } = {
  CUSTOM_FAIL_FAST_THRESHOLD: 'Failed because a fail-fast threshold was breached',
  ML_ANALYSIS: 'Passed/failed by the Harness ML analysis',
  NO_CONTROL_DATA: 'No control data to compare against.',
  NO_TEST_DATA: ' No data to be analysed.'
}

export const widthPercentagePerGraph = 1
