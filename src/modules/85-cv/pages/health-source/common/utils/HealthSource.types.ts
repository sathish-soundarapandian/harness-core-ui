/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@wings-software/uicore'
import type { AnalysisDTO, RiskProfile, Slidto } from 'services/cv'

export interface BaseHealthSourceMetricDefinition {
  analysis?: AnalysisDTO
  groupName?: string
  identifier: string
  isManualQuery?: boolean
  metricName: string
  riskProfile?: RiskProfile
  sli?: Slidto
}

export interface AssignComponentPayload {
  analysis?: AnalysisDTO
  sli?: Slidto
}

export interface BaseHealthSourceMetricInfo {
  metricName?: string
  identifier?: string
  groupName?: SelectOption
  sli?: boolean
  continuousVerification?: boolean
  healthScore?: boolean
  riskCategory?: string
  lowerBaselineDeviation?: boolean
  higherBaselineDeviation?: boolean
  isNew?: boolean
  isManualQuery?: boolean
}

export interface CommonSetupHealthSourceListType {
  identifier: string
}

export interface RiskThresholdTypes {
  lowerBaselineDeviation?: boolean
  higherBaselineDeviation?: boolean
}
