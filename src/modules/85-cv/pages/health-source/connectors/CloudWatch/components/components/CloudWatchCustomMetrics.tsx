import React from 'react'

import CustomMetricV2 from '@cv/pages/health-source/common/CustomMetricV2/CustomMetricV2'

import { useStrings } from 'framework/strings'
import type { CloudWatchFormType } from '../../CloudWatch.types'
import CloudWatchForm from './components/CloudWatchForm'
import { getDefaultValuesForNewCustomMetric } from '../../CloudWatch.utils'

export default function CloudWatchCustomMetrics(): JSX.Element {
  const { getString } = useStrings()

  return (
    <CustomMetricV2<CloudWatchFormType>
      headingText={getString('cv.monitoringSources.prometheus.querySpecificationsAndMappings')}
      subHeading={getString('cv.monitoringSources.prometheus.customizeQuery')}
      newCustomMetricDefaultValues={getDefaultValuesForNewCustomMetric()}
    >
      <CloudWatchForm />
    </CustomMetricV2>
  )
}
