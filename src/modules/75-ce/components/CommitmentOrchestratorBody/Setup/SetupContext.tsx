/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { SelectOption } from '@harness/uicore'

export interface ExcludedInstanceType {
  instance_type: string
  region: string
  compute_spend?: number
  coverage_percentage?: number
  machine_type?: string
}

export enum UpfrontPaymentMethods {
  All = 'All upfront',
  Partial = 'Partial upfront',
  No = 'No upfront'
}

export interface PlanCoverageDetails {
  coverage?: number
  coveragePercentage?: number
  payment?: UpfrontPaymentMethods
  term?: number
}

export interface SetupData {
  overallCoverage?: number
  excludedInstances?: ExcludedInstanceType[]
  instanceFilters?: {
    region?: SelectOption
    instanceFamily?: SelectOption
  }
  savingsPlanConfig?: PlanCoverageDetails
  riConfig?: PlanCoverageDetails
  isConfirm?: boolean
}

export interface SetupContextProps {
  setupData?: SetupData
  setSetupData?: (data?: SetupData) => void
}

export const SetupContext = React.createContext<SetupContextProps>({})

export function useSetupContext() {
  return React.useContext(SetupContext)
}
