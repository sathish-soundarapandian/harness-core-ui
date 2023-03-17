import { MultiTypeInputType } from '@harness/uicore'
import { isEmpty } from 'lodash-es'
import { CHART_VISIBILITY_ENUM } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import type { HealthSourceRecordsRequest, QueryRecordsRequest, QueryRecordsRequestRequestBody } from 'services/cv'
import type { FieldMapping } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import { HealthSourceTypes } from '@cv/pages/health-source/types'
import type { DefineHealthSourceFormInterface } from '@cv/pages/health-source/HealthSourceDrawer/component/defineHealthSource/DefineHealthSource.types'
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
): boolean {
  return Boolean(chartConfig?.enabled && !(isQueryRuntimeOrExpression || isConnectorRuntimeOrExpression))
}

export function getRecordsRequestBody(
  connectorIdentifier: any,
  healthSourceType: string | undefined,
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
    healthSourceType: healthSourceType as QueryRecordsRequest['healthSourceType'],
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

export function getHealthsourceType(
  product: DefineHealthSourceFormInterface['product'],
  sourceType: DefineHealthSourceFormInterface['sourceType']
): QueryRecordsRequest['healthSourceType'] {
  const sourceTypeInfo = product?.value || sourceType
  switch (sourceTypeInfo) {
    case HealthSourceTypes.ElasticSearch_Logs:
      return 'ElasticSearch'
    default:
      return sourceTypeInfo as QueryRecordsRequest['healthSourceType']
  }
}
