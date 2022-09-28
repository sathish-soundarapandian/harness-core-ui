import React, { useContext, useMemo, useState } from 'react'
import { useFormikContext } from 'formik'
import { useParams } from 'react-router-dom'
import { Button, Container, Text, Utils } from '@harness/uicore'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { CloudWatchFormType, SampleDataType } from '@cv/pages/health-source/connectors/CloudWatch/CloudWatch.types'
import { useGetSampleDataForQuery } from 'services/cv'
import MetricLineChart from '@cv/pages/health-source/common/MetricLineChart/MetricLineChart'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { getSampleDataHightchartPoints } from '@cv/pages/health-source/connectors/CloudWatch/CloudWatch.utils'
import { useStrings } from 'framework/strings'
import css from './QueryDataChart.module.scss'

const guid = Utils.randomId()

export default function QueryDataChart(): JSX.Element {
  const { values: formValues } = useFormikContext<CloudWatchFormType>()

  const { getString } = useStrings()

  const [isQueryExectuted, setIsQueryExectuted] = useState(false)

  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const { customMetrics, selectedCustomMetricIndex, region } = formValues

  const selectedMetric = customMetrics?.[selectedCustomMetricIndex]
  const { metricName, identifier, expression } = selectedMetric

  const { sourceData } = useContext(SetupSourceTabsContext)

  const queryParams = useMemo(() => {
    return {
      expression: expression || '',
      region,
      accountId,
      orgIdentifier,
      projectIdentifier,
      metricName,
      metricIdentifier: identifier,
      requestGuid: guid,
      connectorIdentifier: sourceData?.connectorRef
    }
  }, [
    accountId,
    expression,
    identifier,
    metricName,
    orgIdentifier,
    projectIdentifier,
    region,
    sourceData?.connectorRef
  ])

  const {
    refetch: fetchSampleData,
    data: sampleData,
    loading,
    error
  } = useGetSampleDataForQuery({
    lazy: true,
    queryParams
  })

  const fetchSampleDataForQuery = (): ReturnType<typeof fetchSampleData> => {
    setIsQueryExectuted(true)
    return fetchSampleData({
      queryParams
    })
  }

  const options = getSampleDataHightchartPoints(sampleData?.data as SampleDataType)

  const tooltipText = !expression ? getString('cv.monitoringSources.gco.manualInputQueryModal.validation.query') : ''

  return (
    <>
      <Button
        margin={{ bottom: 'medium' }}
        intent="primary"
        disabled={!expression}
        tooltip={tooltipText}
        onClick={fetchSampleDataForQuery}
        data-testid="fetchRecordsButton"
      >
        {getString('cv.monitoringSources.gcoLogs.fetchRecords')}
      </Button>
      <Container className={css.fetchDataMessage}>
        {!isQueryExectuted && (
          <Text data-testid="querySubmitText" icon="timeline-line-chart" iconProps={{ size: 50, intent: 'success' }}>
            {getString('cv.healthSource.connectors.CloudWatch.validationMessage.submitQuery')}
          </Text>
        )}
        {isQueryExectuted && <MetricLineChart loading={loading} options={options} error={error} />}
      </Container>
    </>
  )
}
