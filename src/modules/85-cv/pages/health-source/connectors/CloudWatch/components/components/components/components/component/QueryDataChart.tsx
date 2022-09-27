import React, { useContext } from 'react'
import { useFormikContext } from 'formik'
import { useParams } from 'react-router-dom'
import { Button, Utils } from '@harness/uicore'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { CloudWatchFormType } from '@cv/pages/health-source/connectors/CloudWatch/CloudWatch.types'
import { useGetSampleDataForQuery } from 'services/cv'
import MetricLineChart from '@cv/pages/health-source/common/MetricLineChart/MetricLineChart'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'

const guid = Utils.randomId()

export default function QueryDataChart(): JSX.Element {
  const { values: formValues } = useFormikContext<CloudWatchFormType>()

  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const { customMetrics, selectedCustomMetricIndex, region } = formValues

  const selectedMetric = customMetrics?.[selectedCustomMetricIndex]
  const { metricName, identifier, expression } = selectedMetric

  const { sourceData } = useContext(SetupSourceTabsContext)

  const {
    refetch: fetchSampleData,
    data: sampleData,
    loading,
    error
  } = useGetSampleDataForQuery({
    lazy: true,
    queryParams: {
      expression: 'SELECT AVG(CPUUtilization) FROM SCHEMA("AWS/EC2", InstanceId)',
      region: 'us-east-1',
      accountId: 'kmpySmUISimoRrJL6NL73w',
      orgIdentifier: 'default',
      projectIdentifier: 'cw',
      connectorIdentifier: 'aws1',
      metricIdentifier: 'cwmetric4',
      metricName: 'cw-metric-4',
      requestGuid: guid
    }
    // queryParams: {
    //   expression: expression || '',
    //   region,
    //   accountId,
    //   orgIdentifier,
    //   projectIdentifier,
    //   metricName,
    //   metricIdentifier: identifier,
    //   requestGuid: guid,
    //   connectorIdentifier: sourceData?.connectorRef
    // }
  })

  const options = [
    [1664307420000, 16],
    [1664307480000, 16],
    [1664307540000, 16],
    [1664307600000, 16],
    [1664307660000, 16],
    [1664307720000, 17],
    [1664307780000, 16],
    [1664307840000, 16],
    [1664307900000, 15],
    [1664307960000, 17],
    [1664308020000, 16],
    [1664308080000, 16],
    [1664308140000, 16],
    [1664308200000, 16],
    [1664308260000, 16],
    [1664308320000, 16],
    [1664308380000, 16],
    [1664308440000, 15],
    [1664308500000, 16],
    [1664308560000, 15],
    [1664308620000, 17],
    [1664308680000, 16],
    [1664308740000, 16],
    [1664308800000, 16],
    [1664308860000, 16],
    [1664308920000, 16],
    [1664308980000, 16],
    [1664309040000, 16],
    [1664309100000, 15],
    [1664309160000, 16]
  ]

  return (
    <>
      <Button margin={{ bottom: 'large' }} intent="primary" onClick={() => fetchSampleData()}>
        Fetch records
      </Button>
      <MetricLineChart loading={false} options={options} error={error} />
    </>
  )
}
