import { MultiTypeInputType } from '@harness/uicore'
import { isEmpty } from 'lodash-es'
import { CHART_VISIBILITY_ENUM } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import type { HealthSourceRecordsRequest, QueryRecordsRequestRequestBody } from 'services/cv'
import type { FieldMapping } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import type { LogFieldsMultiTypeState } from '../../../CustomMetricForm.types'

export function shouldAutoBuildChart(
  chartConfig: { enabled: boolean; chartVisibilityMode: CHART_VISIBILITY_ENUM } | undefined
): boolean {
  return !!(chartConfig?.enabled && chartConfig?.chartVisibilityMode === CHART_VISIBILITY_ENUM.AUTO)
}

export function shouldShowChartComponent(
  chartConfig: { enabled: boolean; chartVisibilityMode: CHART_VISIBILITY_ENUM } | undefined,
  isQueryRuntimeOrExpression?: boolean,
  isConnectorRuntimeOrExpression?: boolean
  // records: Record<string, any>[],
  // fetchingSampleRecordLoading: boolean,
  // query: string
): boolean {
  // return !!(query && chartConfig?.enabled && records && records?.length && !fetchingSampleRecordLoading)
  return Boolean(chartConfig?.enabled && !(isQueryRuntimeOrExpression || isConnectorRuntimeOrExpression))
}

export function getRecordsRequestBody(
  connectorIdentifier: any,
  providerType: string,
  query: string,
  queryField?: FieldMapping,
  queryFieldValue?: string
): HealthSourceRecordsRequest | QueryRecordsRequestRequestBody {
  const { endTime, startTime } = getStartAndEndTime()
  const { identifier } = (queryField || {}) as FieldMapping

  const recordsRequestBody = {
    connectorIdentifier: connectorIdentifier?.connector?.identifier ?? connectorIdentifier,
    endTime,
    startTime,
    providerType: providerType as HealthSourceRecordsRequest['providerType'],
    query,
    healthSourceQueryParams: {
      ...(identifier && { [identifier]: queryFieldValue })
    }
  }
  return recordsRequestBody
}

export function getStartAndEndTime(): { endTime: number; startTime: number } {
  const currentTime = new Date()
  const startTime = currentTime.setHours(currentTime.getHours() - 2)
  const endTime = Date.now()
  return { endTime, startTime }
}

export const getIsLogsCanBeShown = ({
  isLogsTableEnabled,
  isDataAvailableForLogsTable,
  isQueryRuntimeOrExpression,
  isConnectorRuntimeOrExpression
}: {
  isLogsTableEnabled: boolean
  isDataAvailableForLogsTable: boolean
  isQueryRuntimeOrExpression?: boolean
  isConnectorRuntimeOrExpression?: boolean
}): boolean => {
  return Boolean(
    isLogsTableEnabled && (isDataAvailableForLogsTable || isQueryRuntimeOrExpression || isConnectorRuntimeOrExpression)
  )
}

const getAreAllLogFieldsAreFixed = (multiTypeRecord: LogFieldsMultiTypeState | null): boolean => {
  if (!multiTypeRecord || isEmpty(multiTypeRecord)) {
    return true
  }

  return Object.keys(multiTypeRecord).every(
    fieldName => multiTypeRecord[fieldName as keyof LogFieldsMultiTypeState] === MultiTypeInputType.FIXED
  )
}

export const getCanShowSampleLogButton = ({
  isTemplate,
  isQueryRuntimeOrExpression,
  isConnectorRuntimeOrExpression,
  multiTypeRecord
}: {
  isTemplate?: boolean
  isQueryRuntimeOrExpression?: boolean
  isConnectorRuntimeOrExpression?: boolean
  multiTypeRecord: LogFieldsMultiTypeState | null
}): boolean => {
  return Boolean(
    !isTemplate ||
      (!isQueryRuntimeOrExpression && !isConnectorRuntimeOrExpression && getAreAllLogFieldsAreFixed(multiTypeRecord))
  )
}
