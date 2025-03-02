/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useFormikContext } from 'formik'
import { Container, MultiTypeInputType, getMultiTypeFromValue } from '@harness/uicore'
import {
  TimeSeries,
  useGetSampleMetricData,
  useGetSampleRawRecord,
  QueryRecordsRequest,
  useGetRiskCategoryForCustomHealthMetric,
  HealthSourceParamValuesRequest
} from 'services/cv'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { CommonQueryViewer } from '@cv/components/CommonQueryViewer/CommonQueryViewer'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { getIsLogsTableVisible } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.utils'
import type { CommonCustomMetricFormikInterface } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import { CustomMetricFormFieldNames } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.constants'
import CommonChart from '../../CommonChart/CommonChart'
import type { CommonCustomMetricFormContainerProps } from './CommonCustomMetricFormContainer.types'
import LogsTableContainer from '../../LogsTable/LogsTableContainer'
import {
  shouldAutoBuildChart,
  shouldShowChartComponent,
  getRecordsRequestBody,
  getHealthsourceType
} from './CommonCustomMetricFormContainer.utils'
import { useCommonHealthSource } from '../../CommonHealthSourceContext/useCommonHealthSource'
import AssignQuery from '../../Assign/AssignQuery'
import CommonHealthSourceField from './components/CommonHealthSourceField/CommonHealthSourceField'

export default function CommonCustomMetricFormContainer(props: CommonCustomMetricFormContainerProps): JSX.Element {
  const { values, setFieldValue } = useFormikContext<CommonCustomMetricFormikInterface>()
  const { sourceData } = useContext(SetupSourceTabsContext)
  const { product, sourceType } = sourceData || {}
  const { connectorIdentifier, isConnectorRuntimeOrExpression, healthSourceConfig } = props
  const { getString } = useStrings()
  const [records, setRecords] = useState<Record<string, any>[]>([])
  const [isQueryExecuted, setIsQueryExecuted] = useState<boolean>(false)
  const [healthSourceTimeSeriesData, setHealthSourceTimeSeriesData] = useState<TimeSeries[] | undefined>()
  const { isQueryRuntimeOrExpression } = useCommonHealthSource()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const chartConfig = healthSourceConfig?.customMetrics?.metricsChart
  const queryField = healthSourceConfig.customMetrics?.queryAndRecords?.queryField
  const queryFieldValue = (queryField ? values[queryField.identifier] : '') as string
  const healthSourceType = getHealthsourceType(product, sourceType)
  const query = useMemo(() => (values?.query?.length ? values.query : ''), [values])
  const isLogsTableVisible = getIsLogsTableVisible(healthSourceConfig)
  const riskProfileResponse = useGetRiskCategoryForCustomHealthMetric({})
  const {
    mutate: queryHealthSource,
    loading: fetchingSampleRecordLoading,
    error
  } = useGetSampleRawRecord({
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier
  })

  const isDataAvailableForLogsTable = Boolean(!fetchingSampleRecordLoading && !error && records?.length)
  const { sli, healthScore, riskCategory, serviceInstanceField, continuousVerification } = values

  const {
    mutate: fetchHealthSourceTimeSeriesData,
    loading: timeSeriesDataLoading,
    error: timeseriesDataError
  } = useGetSampleMetricData({
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier
  })

  useEffect(() => {
    if (values?.identifier) {
      // Whenever metric changes resetting the records and charts
      setIsQueryExecuted(false)
      setRecords([])
      setHealthSourceTimeSeriesData([])

      const queryFieldValueType = getMultiTypeFromValue(queryFieldValue)

      // Fetch the records for latest query
      if (
        query &&
        !isConnectorRuntimeOrExpression &&
        !isQueryRuntimeOrExpression &&
        (!queryField || queryFieldValueType === MultiTypeInputType.FIXED)
      ) {
        handleFetchRecords()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values?.identifier])

  const handleBuildChart = async (): Promise<void> => {
    const fetchMetricsRecordsRequestBody = getRecordsRequestBody(connectorIdentifier, healthSourceType, query)
    fetchHealthSourceTimeSeriesData(fetchMetricsRecordsRequestBody).then(data => {
      const timeSeriesData = data?.resource?.timeSeriesData || []
      setHealthSourceTimeSeriesData(timeSeriesData)
      setFieldValue(CustomMetricFormFieldNames.RECORD_COUNT, timeSeriesData.length)
    })
  }

  const handleFetchRecords = async (): Promise<void> => {
    if (query) {
      setIsQueryExecuted(true)
      const fetchRecordsRequestBody = getRecordsRequestBody(
        connectorIdentifier,
        healthSourceType,
        query,
        queryField,
        queryFieldValue
      )
      const recordsInfo = await queryHealthSource(fetchRecordsRequestBody)
      const recordsData = recordsInfo?.resource?.rawRecords || []
      if (recordsData.length) {
        setRecords(recordsData as Record<string, any>[])
        if (shouldAutoBuildChart(chartConfig)) {
          handleBuildChart()
        }
      }
    }
  }

  const recordProps = useMemo(
    () => ({
      isRecordsLoading: fetchingSampleRecordLoading,
      isQueryRecordsAvailable: isDataAvailableForLogsTable,
      sampleRecords: records
    }),
    [fetchingSampleRecordLoading, isDataAvailableForLogsTable, records]
  )

  return (
    <Container key={values?.identifier} padding={'small'} margin={'small'}>
      {queryField ? (
        <CommonHealthSourceField
          field={queryField}
          isConnectorRuntimeOrExpression={isConnectorRuntimeOrExpression}
          connectorIdentifier={connectorIdentifier}
          providerType={healthSourceType as HealthSourceParamValuesRequest['providerType']}
        />
      ) : null}
      <CommonQueryViewer
        isQueryExecuted={isQueryExecuted}
        records={records}
        fetchRecords={handleFetchRecords}
        loading={fetchingSampleRecordLoading}
        error={error}
        query={query}
        dataTooltipId={'healthSourceQuery'}
        isConnectorRuntimeOrExpression={isConnectorRuntimeOrExpression}
        healthSourceConfig={healthSourceConfig}
        querySectionTitle={getString(
          healthSourceConfig?.customMetrics?.queryAndRecords?.titleStringKey ||
            'cv.monitoringSources.commonHealthSource.querySectionSecondaryTitle'
        )}
        queryFieldIdentifier={queryField?.identifier}
      />
      {shouldShowChartComponent(chartConfig, isQueryRuntimeOrExpression, isConnectorRuntimeOrExpression) ? (
        <CommonChart
          timeSeriesDataLoading={timeSeriesDataLoading}
          timeseriesDataError={timeseriesDataError}
          healthSourceTimeSeriesData={healthSourceTimeSeriesData}
          isQueryExecuted={isQueryExecuted}
        />
      ) : null}
      {isLogsTableVisible && (
        <LogsTableContainer
          queryField={healthSourceConfig?.customMetrics?.queryAndRecords?.queryField}
          fieldMappings={healthSourceConfig?.customMetrics?.fieldMappings}
          selectOnlyLastKey={healthSourceConfig?.customMetrics?.logsTable?.selectOnlyLastKey}
          showExactJsonPath={healthSourceConfig?.customMetrics?.logsTable?.showExactJsonPath}
          healthSourceType={healthSourceType as QueryRecordsRequest['healthSourceType']}
          connectorIdentifier={connectorIdentifier}
          sampleRecords={records}
          isRecordsLoading={fetchingSampleRecordLoading}
          disableLogFields={!isDataAvailableForLogsTable}
        />
      )}
      {healthSourceConfig.customMetrics?.assign?.enabled && (
        <AssignQuery
          values={{
            riskCategory,
            serviceInstanceField,
            sli: Boolean(sli),
            healthScore: Boolean(healthScore),
            continuousVerification: Boolean(continuousVerification)
          }}
          riskProfileResponse={riskProfileResponse}
          healthSourceConfig={healthSourceConfig}
          recordProps={recordProps}
        />
      )}
    </Container>
  )
}
