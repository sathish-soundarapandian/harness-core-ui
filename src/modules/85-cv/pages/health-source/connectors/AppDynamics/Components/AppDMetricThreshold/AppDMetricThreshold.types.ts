import type { GroupedCreatedMetrics } from '@cv/pages/health-source/common/CustomMetric/CustomMetric.types'
import type { TimeSeriesMetricPackDTO } from 'services/cv'
import type { AppDynamicsFomikFormInterface, NonCustomFeildsInterface } from '../../AppDHealthSource.types'

export interface SelectItem {
  label: string
  value: string
}

export interface AppDMetricThresholdPropsType {
  formikValues: AppDynamicsFomikFormInterface
  metricPacks: TimeSeriesMetricPackDTO[]
  groupedCreatedMetrics: GroupedCreatedMetrics
  setNonCustomFeilds: React.Dispatch<React.SetStateAction<NonCustomFeildsInterface>>
}

export type AppDMetricThresholdContextType = AppDMetricThresholdPropsType
