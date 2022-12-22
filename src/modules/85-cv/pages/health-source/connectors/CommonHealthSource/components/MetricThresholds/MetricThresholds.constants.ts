import { createContext } from 'react'
import type { CommonMetricThresholdProviderProps } from '../../CommonHealthSource.types'

export const MetricThresholdContext = createContext<CommonMetricThresholdProviderProps>(
  {} as CommonMetricThresholdProviderProps
)
