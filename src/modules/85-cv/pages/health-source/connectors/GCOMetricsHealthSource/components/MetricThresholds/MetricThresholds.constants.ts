import { createContext } from 'react'
import type { MetricThresholdContextType } from '../../GCOMetricsHealthSource.type'

export const MetricThresholdContext = createContext<MetricThresholdContextType>({} as MetricThresholdContextType)
