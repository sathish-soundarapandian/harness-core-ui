import { createContext } from 'react'
import type { MetricThresholdCommonProps } from '../../CloudWatch.types'

export const MetricThresholdContext = createContext<MetricThresholdCommonProps>({} as MetricThresholdCommonProps)
