import { useContext } from 'react'
import type { CustomMetricsV2HelperContextType } from '../CustomMetric.types'
import { CustomMetricsV2HelperContext } from '../CustomMetricV2.constants'

export default function useCustomMetricV2HelperContext(): CustomMetricsV2HelperContextType {
  const contextValues = useContext(CustomMetricsV2HelperContext)

  if (!contextValues) {
    throw Error('useCustomMetricV2HelperContext must be used in scope of CustomMetricsV2HelperContext')
  }

  return contextValues
}
