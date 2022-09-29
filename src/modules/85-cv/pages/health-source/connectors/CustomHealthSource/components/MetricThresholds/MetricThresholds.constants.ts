import { createContext } from 'react'
import type { CustomHealthThresholdContextType } from '../../CustomHealthSource.types'

export const MetricThresholdContext = createContext<CustomHealthThresholdContextType>(
  {} as CustomHealthThresholdContextType
)
