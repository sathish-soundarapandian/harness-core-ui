/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState, useContext, useCallback, useEffect } from 'react'
import { noop } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { GetDataError } from 'restful-react'
import {
  Container,
  Accordion,
  SelectOption,
  Utils,
  Button,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Layout
} from '@wings-software/uicore'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import SelectHealthSourceServices from '@cv/pages/health-source/common/SelectHealthSourceServices/SelectHealthSourceServices'
import GroupName from '@cv/components/GroupName/GroupName'
import MetricLineChart from '@cv/pages/health-source/common/MetricLineChart/MetricLineChart'
import { SetupSourceCardHeader } from '@cv/components/CVSetupSourcesView/SetupSourceCardHeader/SetupSourceCardHeader'
import { QueryViewer } from '@cv/components/QueryViewer/QueryViewer'
import { InputWithDynamicModalForJsonMultiType } from '@cv/components/InputWithDynamicModalForJson/InputWithDynamicModalForJsonMultiType'
import { NameId } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { useStrings } from 'framework/strings'
import {
  NewRelicMetricDefinition,
  TimeSeriesSampleDTO,
  useFetchParsedSampleData,
  useGetMetricPacks,
  useGetSampleDataForNRQL
} from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { initializeGroupNames } from '@cv/pages/health-source/common/GroupName/GroupName.utils'
import { NewRelicHealthSourceFieldNames } from '../../NewRelicHealthSource.constants'
import { getOptionsForChart } from './NewRelicCustomMetricForm.utils'
import type { NewRelicCustomFormInterface } from './NewRelicCustomMetricForm.types'
import { shouldFetchApplication } from '../../NewRelicHealthSource.utils'
import css from '../../NewrelicMonitoredSource.module.scss'

export default function NewRelicCustomMetricForm(props: NewRelicCustomFormInterface): JSX.Element {
  const { connectorIdentifier, mappedMetrics, selectedMetric, formikSetField, formikValues, isTemplate, expressions } =
    props
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const isConnectorRuntimeOrExpression = getMultiTypeFromValue(connectorIdentifier) !== MultiTypeInputType.FIXED

  const metricPackResponse = useGetMetricPacks({
    queryParams: { projectIdentifier, orgIdentifier, accountId, dataSourceType: 'NEW_RELIC' }
  })

  const [newRelicGroupName, setNewRelicGroupName] = useState<SelectOption[]>(
    initializeGroupNames(mappedMetrics, getString)
  )

  const [isQueryExecuted, setIsQueryExecuted] = useState(false)
  const query = useMemo(() => (formikValues?.query?.length ? formikValues.query.trim() : ''), [formikValues])

  const queryParamsForNRQL = useMemo(
    () => ({
      accountId,
      projectIdentifier,
      orgIdentifier,
      requestGuid: Utils.randomId(),
      connectorIdentifier,
      nrql: query
    }),

    [accountId, projectIdentifier, orgIdentifier, connectorIdentifier, query]
  )
  const {
    data: nrqlResponse,
    refetch: fetchRecords,
    loading,
    error
  } = useGetSampleDataForNRQL({
    queryParams: queryParamsForNRQL,
    lazy: true
  })

  const sampleRecord = nrqlResponse?.data as Record<string, any>

  const queryParamsForTimeSeriesData = useMemo(
    () => ({
      accountId,
      orgIdentifier,
      projectIdentifier
    }),

    [accountId, orgIdentifier, projectIdentifier]
  )

  const [newRelicTimeSeriesData, setNewRelicTimeSeriesData] = useState<TimeSeriesSampleDTO[] | undefined>()

  const {
    mutate: fetchNewRelicTimeSeriesData,
    loading: timeSeriesDataLoading,
    error: timeseriesDataError
  } = useFetchParsedSampleData({
    queryParams: queryParamsForTimeSeriesData
  })

  const fetchNewRelicResponse = useCallback(async () => {
    fetchRecords({ queryParams: queryParamsForNRQL })
    setIsQueryExecuted(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParamsForNRQL])

  useEffect(() => {
    if (shouldFetchApplication(query, isConnectorRuntimeOrExpression)) {
      fetchNewRelicResponse()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleBuildChart = useCallback(() => {
    fetchNewRelicTimeSeriesData({
      groupName: formikValues?.groupName?.value,
      jsonResponse: JSON.stringify(sampleRecord),
      metricValueJSONPath: formikValues?.metricValue,
      timestampJSONPath: formikValues?.timestamp
    }).then(data => {
      setNewRelicTimeSeriesData(data.data)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchNewRelicResponse, fetchNewRelicTimeSeriesData, formikValues, sampleRecord])

  const options = useMemo(() => {
    return newRelicTimeSeriesData ? getOptionsForChart(newRelicTimeSeriesData) : []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newRelicTimeSeriesData])

  const isSelectingJsonPathDisabled = !isQueryExecuted || loading || !sampleRecord

  const {
    sourceData: { existingMetricDetails }
  } = useContext(SetupSourceTabsContext)
  const metricDefinitions = existingMetricDetails?.spec?.newRelicMetricDefinitions
  const currentSelectedMetricDetail = metricDefinitions?.find(
    (metricDefinition: NewRelicMetricDefinition) =>
      metricDefinition.metricName === mappedMetrics.get(selectedMetric || '')?.metricName
  )

  const showMetricChart =
    getMultiTypeFromValue(formikValues.timestamp) === MultiTypeInputType.FIXED &&
    getMultiTypeFromValue(formikValues.metricValue) === MultiTypeInputType.FIXED

  return (
    <Container className={css.main}>
      <SetupSourceCardHeader
        mainHeading={getString('cv.monitoringSources.prometheus.querySpecificationsAndMappings')}
        subHeading={getString('cv.monitoringSources.prometheus.customizeQuery')}
      />
      <Container className={css.content}>
        <Accordion activeId="metricToService" className={css.accordian}>
          <Accordion.Panel
            id="metricToService"
            summary={getString('cv.monitoringSources.mapMetricsToServices')}
            details={
              <>
                <NameId
                  nameLabel={getString('cv.monitoringSources.metricNameLabel')}
                  identifierProps={{
                    inputName: NewRelicHealthSourceFieldNames.METRIC_NAME,
                    idName: NewRelicHealthSourceFieldNames.METRIC_IDENTIFIER,
                    isIdentifierEditable: Boolean(!currentSelectedMetricDetail?.identifier)
                  }}
                />
                <GroupName
                  groupNames={newRelicGroupName}
                  onChange={formikSetField}
                  item={formikValues?.groupName}
                  setGroupNames={setNewRelicGroupName}
                  label={getString('cv.monitoringSources.prometheus.groupName')}
                  title={getString('cv.healthSource.connectors.NewRelic.groupName')}
                  fieldName={'groupName'}
                />
              </>
            }
          />
          <Accordion.Panel
            id="querySpecificationsAndMapping"
            summary={getString('cv.healthSource.connectors.NewRelic.queryMapping')}
            details={
              <>
                <QueryViewer
                  key={formikValues?.metricIdentifier}
                  recordsClassName={css.recordsClassName}
                  queryLabel={getString('cv.healthSource.connectors.NewRelic.nrqlQuery')}
                  isQueryExecuted={isQueryExecuted}
                  queryNotExecutedMessage={
                    getMultiTypeFromValue(formikValues?.query) !== MultiTypeInputType.FIXED
                      ? getString('cv.customHealthSource.chartRuntimeWarning')
                      : getString('cv.healthSource.connectors.NewRelic.submitQueryNoRecords')
                  }
                  records={[sampleRecord] as Record<string, any>[]}
                  fetchRecords={!isConnectorRuntimeOrExpression ? fetchNewRelicResponse : noop}
                  loading={loading}
                  error={error}
                  query={query}
                  fetchEntityName={getString('cv.response')}
                  dataTooltipId={'newRelicQuery'}
                  isTemplate={isTemplate}
                  expressions={expressions}
                  isConnectorRuntimeOrExpression={isConnectorRuntimeOrExpression}
                />
              </>
            }
          />
          <Accordion.Panel
            id="metricChart"
            summary={getString('cv.healthSource.connectors.NewRelic.metricValueAndCharts')}
            details={
              <Layout.Vertical key={formikValues?.metricIdentifier}>
                <InputWithDynamicModalForJsonMultiType
                  onChange={formikSetField}
                  fieldValue={formikValues?.metricValue}
                  isQueryExecuted={isQueryExecuted}
                  isDisabled={isSelectingJsonPathDisabled}
                  sampleRecord={sampleRecord}
                  inputName={NewRelicHealthSourceFieldNames.METRIC_VALUE}
                  inputLabel={getString('cv.healthSource.connectors.NewRelic.metricFields.metricValueJsonPath.label')}
                  recordsModalHeader={getString(
                    'cv.healthSource.connectors.NewRelic.metricFields.metricValueJsonPath.recordsModalHeader'
                  )}
                  dataTooltipId={'metricValueJsonPath'}
                  showExactJsonPath={true}
                  isMultiType={Boolean(isTemplate)}
                  expressions={expressions}
                  allowableTypes={
                    isConnectorRuntimeOrExpression
                      ? [MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
                      : [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
                  }
                />
                <InputWithDynamicModalForJsonMultiType
                  onChange={formikSetField}
                  fieldValue={formikValues?.timestamp}
                  isQueryExecuted={isQueryExecuted}
                  isDisabled={isSelectingJsonPathDisabled}
                  sampleRecord={sampleRecord}
                  inputName={NewRelicHealthSourceFieldNames.TIMESTAMP_LOCATOR}
                  inputLabel={getString('cv.healthSource.connectors.NewRelic.metricFields.timestampJsonPath.label')}
                  recordsModalHeader={getString(
                    'cv.healthSource.connectors.NewRelic.metricFields.timestampJsonPath.recordsModalHeader'
                  )}
                  dataTooltipId={'timestampJsonPath'}
                  showExactJsonPath={true}
                  isMultiType={Boolean(isTemplate)}
                  expressions={expressions}
                  allowableTypes={
                    isConnectorRuntimeOrExpression
                      ? [MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
                      : [MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]
                  }
                />
                {showMetricChart && (
                  <Button
                    intent="primary"
                    text={getString('cv.healthSource.connectors.buildChart')}
                    onClick={handleBuildChart}
                    disabled={!formikValues.query?.trim().length || isConnectorRuntimeOrExpression}
                  />
                )}
                {showMetricChart && (
                  <Container padding={{ top: 'small' }}>
                    <MetricLineChart
                      loading={timeSeriesDataLoading}
                      error={timeseriesDataError as GetDataError<Error>}
                      options={options}
                    />
                  </Container>
                )}
              </Layout.Vertical>
            }
          />
          <Accordion.Panel
            id="riskProfile"
            summary={getString('cv.monitoringSources.assign')}
            details={
              <>
                <SelectHealthSourceServices
                  values={{
                    sli: !!formikValues?.sli,
                    riskCategory: formikValues?.riskCategory,
                    healthScore: !!formikValues?.healthScore,
                    continuousVerification: !!formikValues?.continuousVerification
                  }}
                  metricPackResponse={metricPackResponse}
                  hideServiceIdentifier={true}
                />
              </>
            }
          />
        </Accordion>
      </Container>
    </Container>
  )
}
