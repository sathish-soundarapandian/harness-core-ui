import React, { useCallback, useContext, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { isEmpty } from 'lodash-es'
import { useFormikContext } from 'formik'
import { Container, FontVariation, PageError, Text, Utils } from '@harness/uicore'
import type { CloudWatchFormType, SampleDataType } from '@cv/pages/health-source/connectors/CloudWatch/CloudWatch.types'
import { getSampleDataHightchartPoints } from '@cv/pages/health-source/connectors/CloudWatch/CloudWatch.utils'
import { useStrings } from 'framework/strings'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { QueryContent } from '@cv/components/QueryViewer/QueryViewer'
import { useGetSampleDataForQuery } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import MetricLineChart from '@cv/pages/health-source/common/MetricLineChart/MetricLineChart'
import css from './CloudWatchQuery.module.scss'

const guid = Utils.randomId()

export default function CloudWatchQuery(): JSX.Element {
  const { values: formValues } = useFormikContext<CloudWatchFormType>()

  const { getString } = useStrings()

  const [isQueryExectuted, setIsQueryExectuted] = useState(false)

  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const { customMetrics, selectedCustomMetricIndex, region } = formValues

  const selectedMetric = customMetrics?.[selectedCustomMetricIndex]
  const { expression } = selectedMetric

  const { sourceData } = useContext(SetupSourceTabsContext)

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
    setIsQueryExectuted(true)
    fetchSampleData({
      queryParams
    })
  }, [queryParams])

  const options = getSampleDataHightchartPoints(sampleData?.data as SampleDataType)

  return (
    <>
      <Text font={{ variation: FontVariation.SMALL_SEMI }} margin={{ bottom: 'small' }}>
        {getString('cv.query')}
      </Text>
      <QueryContent
        handleFetchRecords={fetchSampleDataForQuery}
        loading={loading}
        query={expression || ''}
        isAutoFetch={false}
        fetchButtonText={getString('cv.healthSource.connectors.CloudWatch.fetchDataButtonText')}
        textAreaName={`customMetrics.${selectedCustomMetricIndex}.expression`}
        isFetchButtonDisabled={!expression || !region}
      />

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
        {isQueryExectuted && !error && <MetricLineChart loading={loading} error={error} options={options} />}
      </Container>
    </>
  )
}
