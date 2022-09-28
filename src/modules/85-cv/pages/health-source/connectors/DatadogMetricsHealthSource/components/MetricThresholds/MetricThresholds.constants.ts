import { createContext } from 'react'
import type { DataDogThresholdContextType } from '../../DatadogMetricsHealthSource.type'

export const MetricThresholdContext = createContext<DataDogThresholdContextType>({} as DataDogThresholdContextType)
