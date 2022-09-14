import React, { useCallback, useMemo } from 'react'
import { useFormikContext } from 'formik'
import AddCustomMetricButton from '@cv/pages/health-source/common/CustomMetricV2/components/AddCustomMetricsButton'
import CustomMetricV2 from '@cv/pages/health-source/common/CustomMetricV2/CustomMetricV2'
import { getNewMetricIdentifier } from '@cv/pages/health-source/common/CustomMetricV2/CustomMetric.utils'
import { useStrings } from 'framework/strings'
import CardWithOuterTitle from '@cv/pages/health-source/common/CardWithOuterTitle/CardWithOuterTitle'
import { CloudWatchProperties } from '../../CloudWatchConstants'
import type { CloudWatchFormType } from '../../CloudWatch.types'

export default function CloudWatchCustomMetrics(): JSX.Element {
  const { getString } = useStrings()
  const { setFieldValue, values } = useFormikContext<CloudWatchFormType>()

  const addMetric = useCallback(() => {
    const newMetricIdentifier = getNewMetricIdentifier(values.customMetrics, 'cloud watch metric')
    const updatedCustomMetric = [...values.customMetrics]
    updatedCustomMetric.push({
      metricName: newMetricIdentifier,
      identifier: newMetricIdentifier,
      groupName: ''
    })

    setFieldValue(CloudWatchProperties.customMetrics, updatedCustomMetric)
  }, [setFieldValue, values])

  const isCustomMetricsPresent = useMemo(() => values.customMetrics.length, [values.customMetrics])

  return !isCustomMetricsPresent ? (
    <CardWithOuterTitle title={getString('cv.healthSource.connectors.customMetrics')}>
      <AddCustomMetricButton onClick={addMetric} />
    </CardWithOuterTitle>
  ) : (
    <CustomMetricV2
      headingText={getString('cv.monitoringSources.prometheus.querySpecificationsAndMappings')}
      subHeading={getString('cv.monitoringSources.prometheus.customizeQuery')}
    />
  )
}
