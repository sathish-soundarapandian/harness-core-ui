/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { CHART_VISIBILITY_ENUM, FIELD_ENUM } from '../CommonHealthSource.constants'
import type { HealthSourcesConfig } from '../CommonHealthSource.types'

export const healthSourcesConfig: HealthSourcesConfig = {
  SumoLogic_METRICS: {
    addQuery: {
      label: 'Metric',
      enableDefaultGroupName: false
    },
    customMetrics: {
      enabled: true,
      queryAndRecords: {
        enabled: true,
        titleStringKey: 'cv.monitoringSources.commonHealthSource.defineQueryDescriptionMetrics'
      },
      metricsChart: {
        enabled: true,
        chartVisibilityMode: CHART_VISIBILITY_ENUM.AUTO
      }
    },
    metricPacks: {
      enabled: false
    },
    sideNav: {
      shouldBeAbleToDeleteLastMetric: true
    },
    metricThresholds: {
      enabled: true
    }
  },
  SumoLogic_LOGS: {
    addQuery: {
      label: 'Log',
      enableDefaultGroupName: true
    },
    customMetrics: {
      enabled: true,
      fieldMappings: [
        {
          type: 'JsonSelector' as FIELD_ENUM.JSON_SELECTOR,
          label: 'Identifier service path',
          identifier: 'serviceInstance',
          defaultValue: '_sourcehost'
        }
      ],
      logsTable: {
        enabled: true
      },
      queryAndRecords: {
        enabled: true,
        titleStringKey: 'cv.monitoringSources.commonHealthSource.defineQuerySubDescription'
      }
    },

    sideNav: {
      shouldBeAbleToDeleteLastMetric: false
    },
    metricPacks: {
      enabled: false
    },
    metricThresholds: {
      enabled: false
    }
  }
}
