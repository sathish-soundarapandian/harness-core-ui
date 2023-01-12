/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SLIMetricSpec } from 'services/cv'
import { PeriodTypeEnum } from '@cv/pages/slos/common/SLOTargetAndBudgetPolicy/SLOTargetAndBudgetPolicy.constants'
import { SLIMetricEnum, SLITypeEnum } from './components/SLI/SLI.constants'

export enum CreateSLOEnum {
  NAME = 'Name',
  SLI = 'SLI',
  SLO_TARGET_BUDGET_POLICY = 'SLO Target & Error Budget Policy'
}

export const TabsOrder = [CreateSLOEnum.NAME, CreateSLOEnum.SLI, CreateSLOEnum.SLO_TARGET_BUDGET_POLICY]

export const initialValuesSLO = {
  name: '',
  identifier: '',
  description: '',
  tags: {},
  userJourneyRef: '',
  monitoredServiceRef: '',
  healthSourceRef: '',
  serviceLevelIndicators: {
    name: '',
    identifier: '',
    type: SLITypeEnum.LATENCY,
    spec: {
      type: SLIMetricEnum.RATIO,
      spec: {
        eventType: '',
        metric1: '',
        metric2: ''
      } as SLIMetricSpec
    }
  },
  target: {
    type: PeriodTypeEnum.ROLLING,
    sloTargetPercentage: 0,
    spec: {
      periodLength: '',
      startDate: '',
      endDate: ''
    }
  }
}
