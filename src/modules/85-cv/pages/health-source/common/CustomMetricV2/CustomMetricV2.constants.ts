import React from 'react'
import type { CustomMetricsV2HelperContextType } from './CustomMetric.types'

export const CustomMetricsV2HelperContext = React.createContext<CustomMetricsV2HelperContextType>(
  {} as CustomMetricsV2HelperContextType
)

CustomMetricsV2HelperContext.displayName = 'CustomMetricsV2HelperContext'

export const customMetricsFormikPropertyName = 'customMetrics'
export const selectedIndexFormikPropertyName = 'selectedCustomMetricIndex'

export const defaultNewCustomMetricName = 'customMetric'
export const defaultNewCustomMetricIdentifier = 'customMetric'

export const DefaultCustomMetricGroupName = 'Please Select Group Name'
export const ExceptionGroupName = '+ Add New'

export const RiskProfileBaslineValues = {
  ACT_WHEN_HIGHER: 'ACT_WHEN_HIGHER',
  ACT_WHEN_LOWER: 'ACT_WHEN_LOWER'
}
