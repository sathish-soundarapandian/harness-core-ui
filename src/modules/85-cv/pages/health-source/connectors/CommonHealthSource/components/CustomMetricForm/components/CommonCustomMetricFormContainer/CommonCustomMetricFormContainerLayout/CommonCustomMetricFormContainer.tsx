/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useFormikContext } from 'formik'
import { Container } from '@harness/uicore'
import {
  TimeSeries,
  useGetSampleMetricData,
  useGetSampleRawRecord,
  QueryRecordsRequest,
  useGetRiskCategoryForCustomHealthMetric
} from 'services/cv'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { CommonQueryViewer } from '@cv/components/CommonQueryViewer/CommonQueryViewer'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { getIsLogsTableVisible } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.utils'
import type { CommonCustomMetricFormikInterface } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import CommonChart from '../../CommonChart/CommonChart'
import type { CommonCustomMetricFormContainerProps } from './CommonCustomMetricFormContainer.types'
import LogsTableContainer from '../../LogsTable/LogsTableContainer'
import {
  shouldAutoBuildChart,
  shouldShowChartComponent,
  getRecordsRequestBody
} from './CommonCustomMetricFormContainer.utils'
import { useCommonHealthSource } from '../../CommonHealthSourceContext/useCommonHealthSource'
import { HEALTHSOURCE_TYPE_TO_PROVIDER_MAPPING } from './CommonCustomMetricFormContainer.constants'
import AssignQuery from '../../Assign/AssignQuery'

export default function CommonCustomMetricFormContainer(props: CommonCustomMetricFormContainerProps): JSX.Element {
  const { values } = useFormikContext<CommonCustomMetricFormikInterface>()
  const { sourceData } = useContext(SetupSourceTabsContext)
  const { product } = sourceData || {}
  const { connectorIdentifier, isConnectorRuntimeOrExpression, healthSourceConfig } = props
  const { getString } = useStrings()
  const [records, setRecords] = useState<Record<string, any>[]>([])
  const [isQueryExecuted, setIsQueryExecuted] = useState<boolean>(false)
  const [healthSourceTimeSeriesData, setHealthSourceTimeSeriesData] = useState<TimeSeries[] | undefined>()
  const { isQueryRuntimeOrExpression } = useCommonHealthSource()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const chartConfig = healthSourceConfig?.customMetrics?.metricsChart
  const providerType = HEALTHSOURCE_TYPE_TO_PROVIDER_MAPPING[product?.value]
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

      // Fetch the records for latest query
      if (query && !isConnectorRuntimeOrExpression && !isQueryRuntimeOrExpression) {
        handleFetchRecords()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values?.identifier])

  const handleBuildChart = async (): Promise<void> => {
    const fetchMetricsRecordsRequestBody = getRecordsRequestBody(connectorIdentifier, providerType, query)
    fetchHealthSourceTimeSeriesData(fetchMetricsRecordsRequestBody).then(data => {
      setHealthSourceTimeSeriesData(data?.resource?.timeSeriesData)
    })
  }

  const handleFetchRecords = async (): Promise<void> => {
    if (query) {
      setIsQueryExecuted(true)
      const fetchRecordsRequestBody = getRecordsRequestBody(connectorIdentifier, providerType, query)
      const recordsData = await queryHealthSource(fetchRecordsRequestBody)
      if (recordsData?.resource?.rawRecords) {
        setRecords(recordsData?.resource?.rawRecords as Record<string, any>[])
        if (shouldAutoBuildChart(chartConfig)) {
          handleBuildChart()
        }
      }
    }
  }

  const isDataAvailableForLogsTable = Boolean(!fetchingSampleRecordLoading && !error && records?.length)
  const { sli, healthScore, riskCategory, serviceInstance, continuousVerification } = values

  return (
    <Container key={values?.identifier} padding={'small'} margin={'small'}>
      <CommonQueryViewer
        isQueryExecuted={isQueryExecuted}
        records={records}
        fetchRecords={handleFetchRecords}
        loading={fetchingSampleRecordLoading}
        error={error}
        query={query}
        dataTooltipId={'healthSourceQuery'}
        isConnectorRuntimeOrExpression={isConnectorRuntimeOrExpression}
        // Refactor this after passing healthSourceConfig in context
        querySectionTitle={getString(
          healthSourceConfig?.customMetrics?.queryAndRecords?.titleStringKey ||
            'cv.monitoringSources.commonHealthSource.querySectionSecondaryTitle'
        )}
      />
      {shouldShowChartComponent(chartConfig, isQueryRuntimeOrExpression) ? (
        <CommonChart
          timeSeriesDataLoading={timeSeriesDataLoading}
          timeseriesDataError={timeseriesDataError}
          healthSourceTimeSeriesData={healthSourceTimeSeriesData}
        />
      ) : null}
      {isLogsTableVisible && (
        <LogsTableContainer
          fieldMappings={healthSourceConfig?.customMetrics?.fieldMappings}
          providerType={providerType as QueryRecordsRequest['providerType']}
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
            serviceInstance,
            sli: Boolean(sli),
            healthScore: Boolean(healthScore),
            continuousVerification: Boolean(continuousVerification)
          }}
          riskProfileResponse={riskProfileResponse}
          hideCV={healthSourceConfig.customMetrics?.assign?.hideCV}
          hideServiceIdentifier={healthSourceConfig.customMetrics?.assign?.hideServiceIdentifier}
          hideSLIAndHealthScore={healthSourceConfig.customMetrics?.assign?.hideSLIAndHealthScore}
          defaultServiceInstance={healthSourceConfig.customMetrics?.assign?.defaultServiceInstance}
        />
      )}
    </Container>
  )
}
