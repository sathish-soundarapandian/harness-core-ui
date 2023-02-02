import type { MultiSelectOption } from '@harness/uicore'
import { mapClusterType } from '@cv/components/ExecutionVerification/components/LogAnalysisContainer/LogAnalysis.utils'
import { getEventTypeChartColor } from '@cv/utils/CommonUtils'
import type {
  AnalyzedRadarChartLogDataDTO,
  FrequencyDTO,
  LogAnalysisRadarChartListDTO,
  RestResponseAnalyzedRadarChartLogDataWithCountDTO,
  RestResponseLogAnalysisRadarChartListWithCountDTO
} from 'services/cv'
import type { LogAnalysisRowData } from './LogAnalysisForServiceHealth.types'

function getFrequencyDataValues(frequencyData?: number[] | FrequencyDTO[], isServicePage?: boolean): number[] {
  if (!isServicePage || typeof frequencyData === 'undefined') return frequencyData as number[]

  return (frequencyData as FrequencyDTO[]).map((datum: FrequencyDTO) => datum.count) as number[]
}

export const getSingleLogData = (
  logData: LogAnalysisRadarChartListDTO | AnalyzedRadarChartLogDataDTO,
  isServicePage?: boolean
): LogAnalysisRowData => {
  const { clusterType, count, message, frequencyData, clusterId, risk } =
    (logData as AnalyzedRadarChartLogDataDTO) || {}
  return {
    clusterType: mapClusterType(clusterType as string),
    count: count as number,
    message: message as string,
    messageFrequency: [
      {
        name: 'testData',
        type: 'column',
        color: getEventTypeChartColor(clusterType),
        data: getFrequencyDataValues(frequencyData, isServicePage)
      }
    ],
    clusterId,
    riskStatus: risk
  }
}

export function getLogAnalysisData(
  data: RestResponseLogAnalysisRadarChartListWithCountDTO | RestResponseAnalyzedRadarChartLogDataWithCountDTO | null,
  isServicePage?: boolean
): LogAnalysisRowData[] {
  return (
    data?.resource?.logAnalysisRadarCharts?.content?.map(
      (datum: LogAnalysisRadarChartListDTO | AnalyzedRadarChartLogDataDTO) => getSingleLogData(datum, isServicePage)
    ) ?? []
  )
}

export function getInitialNodeName(selectedHostName?: string): MultiSelectOption[] {
  if (!selectedHostName) {
    return []
  }

  return [
    {
      label: selectedHostName,
      value: selectedHostName
    }
  ]
}
