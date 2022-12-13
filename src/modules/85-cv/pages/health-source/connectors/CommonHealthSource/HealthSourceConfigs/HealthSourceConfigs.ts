/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { HealthSourcesConfig } from '../CommonHealthSource.types'

export const healthSourcesConfig: HealthSourcesConfig = {
  SumoLogic_METRICS: {
    customMetrics: {
      enabled: true
    },
    queryAndRecords: {
      enabled: true
    },
    sideNav: {
      shouldBeAbleToDeleteLastMetric: false
    }
  },
  SumoLogic_LOGS: {
    customMetrics: {
      enabled: true
    },
    queryAndRecords: {
      enabled: true
    },
    sideNav: {
      shouldBeAbleToDeleteLastMetric: false,
      enableDefaultGroupName: true
    }
  }
}
