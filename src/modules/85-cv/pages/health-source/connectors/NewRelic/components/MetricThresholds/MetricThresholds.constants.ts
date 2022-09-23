import { createContext } from 'react'
import type { NewRelicMetricThresholdContextType } from '../../NewRelicHealthSource.types'

export const MetricThresholdContext = createContext<NewRelicMetricThresholdContextType>(
  {} as NewRelicMetricThresholdContextType
)
