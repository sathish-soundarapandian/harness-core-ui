import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty } from 'lodash-es'
import { useFormikContext } from 'formik'
import { Container, FormError, PageError, Text, Utils } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import type { CloudWatchFormType, SampleDataType } from '@cv/pages/health-source/connectors/CloudWatch/CloudWatch.types'
import {
  getSampleDataHightchartPoints,
  isMultiRecordDataError,
  isRequiredSampleDataPresent
} from '@cv/pages/health-source/connectors/CloudWatch/CloudWatch.utils'
import { useStrings } from 'framework/strings'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { QueryContent } from '@cv/components/QueryViewer/QueryViewer'
import { useGetSampleDataForQuery } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import MetricLineChart from '@cv/pages/health-source/common/MetricLineChart/MetricLineChart'
import { multipleRecordsError } from '@cv/pages/health-source/connectors/CloudWatch/CloudWatchConstants'
import useCustomMetricV2HelperContext from '@cv/pages/health-source/common/CustomMetricV2/hooks/useCustomMetricV2HelperContext'
import css from './CloudWatchQuery.module.scss'

const guid = Utils.randomId()

export default function CloudWatchQuery(): JSX.Element {
  const { values: formValues, setErrors, errors } = useFormikContext<CloudWatchFormType>()

  const { expressions, isConnectorRuntimeOrExpression, isTemplate } = useCustomMetricV2HelperContext()

  const { getString } = useStrings()

  const [isQueryExectuted, setIsQueryExectuted] = useState(false)

  const previousExpression = useRef<string>('')

  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const { customMetrics, selectedCustomMetricIndex, region } = formValues

  const selectedMetric = customMetrics?.[selectedCustomMetricIndex]
  const { expression } = selectedMetric

  const { sourceData } = useContext(SetupSourceTabsContext)

  const recordLimitErrorName = `${multipleRecordsError}-${selectedCustomMetricIndex}` as keyof CloudWatchFormType

  const queryParams = useMemo(() => {
    return {
      expression: expression || '',
      region,
      accountId,
      orgIdentifier,
      projectIdentifier,
      requestGuid: guid,
      connectorIdentifier: sourceData?.connectorRef
    }
  }, [accountId, expression, orgIdentifier, projectIdentifier, region, sourceData?.connectorRef])

  const {
    refetch: fetchSampleData,
    data: sampleData,
    loading,
    error
  } = useGetSampleDataForQuery({
    lazy: true,
    queryParams
  })

  const fetchSampleDataForQuery = useCallback((): void => {
    previousExpression.current = expression as string
    setIsQueryExectuted(true)
    fetchSampleData({
      queryParams
    })
  }, [expression, queryParams])

  useEffect(() => {
    if (
      isMultiRecordDataError({
        expression,
        isQueryExectuted,
        loading,
        isDataPressent: isRequiredSampleDataPresent(sampleData?.data as SampleDataType),
        isMultipleSampleData: sampleData?.data?.MetricDataResults?.length > 1,
        isUpdatedExpression: expression === previousExpression.current
      })
    ) {
      setErrors({
        ...errors,
        [recordLimitErrorName]: getString('cv.monitoringSources.prometheus.validation.recordCount')
      })
    } else {
      const { [recordLimitErrorName]: a, ...restOfTheErrors } = errors
      setErrors({
        ...restOfTheErrors
      })
    }
  }, [
    errors,
    expression,
    formValues?.customMetrics,
    isQueryExectuted,
    loading,
    recordLimitErrorName,
    sampleData?.data,
    selectedCustomMetricIndex
  ])

  const options = getSampleDataHightchartPoints(sampleData?.data as SampleDataType)

  return (
    <>
      {!isTemplate && (
        <Container margin={{ bottom: 'small' }}>
          <Text
            font={{ variation: FontVariation.SMALL_SEMI }}
            tooltipProps={{ dataTooltipId: 'cloudWatchMetricQuery' }}
          >
            {getString('cv.query')}
          </Text>
        </Container>
      )}
      <QueryContent
        handleFetchRecords={fetchSampleDataForQuery}
        loading={loading}
        query={expression || ''}
        isAutoFetch={false}
        isTemplate={isTemplate}
        expressions={expressions}
        isConnectorRuntimeOrExpression={isConnectorRuntimeOrExpression}
        fetchButtonText={getString('cv.healthSource.connectors.CloudWatch.fetchDataButtonText')}
        textAreaName={`customMetrics.${selectedCustomMetricIndex}.expression`}
        isFetchButtonDisabled={!expression || !expression?.trim()?.length || !region}
      />

      <FormError name={recordLimitErrorName} errorMessage={errors[recordLimitErrorName]} />

      <Container className={css.metricChartHolder}>
        {!isQueryExectuted && (
          <Container className={css.fetchDataMessage}>
            <Text
              data-testid="querySubmitText"
              padding="small"
              margin={{ bottom: 'medium' }}
              icon="timeline-line-chart"
              iconProps={{ size: 50, intent: 'success' }}
            >
              {getString('cv.healthSource.connectors.CloudWatch.validationMessage.submitQuery')}
            </Text>
          </Container>
        )}

        {error && (
          <Container className={css.fetchDataMessage}>
            <PageError
              message={getErrorMessage(error)}
              disabled={isEmpty(expression)}
              onClick={fetchSampleDataForQuery}
            />
          </Container>
        )}
        {isQueryExectuted && !error && <MetricLineChart loading={loading} error={error} series={options} />}
      </Container>
    </>
  )
}
