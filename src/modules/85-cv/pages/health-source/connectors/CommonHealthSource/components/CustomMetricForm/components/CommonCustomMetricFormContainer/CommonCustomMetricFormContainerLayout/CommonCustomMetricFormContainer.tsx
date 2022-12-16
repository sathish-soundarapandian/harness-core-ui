/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useContext, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useFormikContext } from 'formik'
import { Container } from '@harness/uicore'
import { HealthSourceRecordsRequest, TimeSeries, useGetSampleMetricData, useGetSampleRawRecord } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { CommonCustomMetricFormikInterface } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { CommonQueryViewer } from '@cv/components/CommonQueryViewer/CommonQueryViewer'
import type { CommonCustomMetricFormContainerProps } from './CommonCustomMetricFormContainer.types'
import CommonChart from '../../CommonChart/CommonChart'
import { shouldAutoBuildChart, shouldShowChartComponent } from './CommonCustomMetricFormContainer.utils'

export default function CommonCustomMetricFormContainer(props: CommonCustomMetricFormContainerProps): JSX.Element {
  const { values } = useFormikContext<CommonCustomMetricFormikInterface>()
  const {
    sourceData: { product, sourceType }
  } = useContext(SetupSourceTabsContext)
  const { connectorIdentifier, isTemplate, expressions, isConnectorRuntimeOrExpression, customMetricsConfig } = props
  const [records, setRecords] = useState<Record<string, any>[]>([])
  const [isQueryExecuted, setIsQueryExecuted] = useState(false)
  const [healthSourceTimeSeriesData, setHealthSourceTimeSeriesData] = useState<TimeSeries[] | undefined>()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const chartConfig = customMetricsConfig?.metricsChart
  const providerType = `${sourceType?.toUpperCase()}_${product?.value}`

  const query = useMemo(() => (values?.query?.length ? values.query : ''), [values])
  const sampleRecord = useMemo(() => (records?.length ? records[0] : null), [records])

  const {
    mutate: queryHealthSource,
    loading,
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

  const handleBuildChart = useCallback(() => {
    const currentTime = new Date()
    const startTime = currentTime.setHours(currentTime.getHours() - 2)

    const fetchMetricsRecordsRequestBody = {
      connectorIdentifier,
      endTime: Date.now(),
      startTime,
      providerType: providerType as HealthSourceRecordsRequest['providerType'],
      query
    }

    fetchHealthSourceTimeSeriesData(fetchMetricsRecordsRequestBody).then(data => {
      setHealthSourceTimeSeriesData(data?.resource?.timeSeriesData)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, sampleRecord])

  const handleFetchRecords = async (): Promise<void> => {
    setIsQueryExecuted(true)
    const currentTime = new Date()
    const startTime = currentTime.setHours(currentTime.getHours() - 2)

    const fetchRecordsRequestBody = {
      connectorIdentifier,
      endTime: Date.now(),
      startTime,
      providerType: providerType as HealthSourceRecordsRequest['providerType'],
      query
    }
    const recordsData = await queryHealthSource(fetchRecordsRequestBody)
    if (recordsData) {
      setRecords(recordsData?.resource?.rawRecords as Record<string, any>[])
      if (shouldAutoBuildChart(chartConfig)) {
        handleBuildChart()
      }
    }
  }

  return (
    <Container padding={'small'} margin={'small'}>
      <CommonQueryViewer
        isQueryExecuted={isQueryExecuted}
        records={records}
        fetchRecords={handleFetchRecords}
        loading={loading}
        error={error}
        query={query}
        dataTooltipId={'healthSourceQuery'}
        isTemplate={isTemplate}
        expressions={expressions}
        isConnectorRuntimeOrExpression={isConnectorRuntimeOrExpression}
      />
      {/* Field Mappings component Can be added here along with build chart/ get message button */}
      {shouldShowChartComponent(chartConfig, records) ? (
        <CommonChart
          timeSeriesDataLoading={timeSeriesDataLoading}
          timeseriesDataError={timeseriesDataError}
          healthSourceTimeSeriesData={healthSourceTimeSeriesData}
        />
      ) : null}
      {/* Logs Table Can be added here */}
    </Container>
  )
}
