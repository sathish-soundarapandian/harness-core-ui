import { createContext } from 'react'
import type { DynatraceMetricThresholdContextType } from '../../DynatraceHealthSource.types'

export const MetricThresholdContext = createContext<DynatraceMetricThresholdContextType>(
  {} as DynatraceMetricThresholdContextType
)
MetricThresholdContext.displayName = 'DynatraceMetricThreshold'
