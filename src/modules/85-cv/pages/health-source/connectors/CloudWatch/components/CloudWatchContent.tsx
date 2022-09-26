import { Container, FormError } from '@harness/uicore'
import { useFormikContext } from 'formik'
import React from 'react'
import type { CloudWatchFormType } from '../CloudWatch.types'
import { CustomMetricsValidationName } from '../CloudWatchConstants'
import AWSRegionSelector from './components/AWSRegionSelector'
import CloudWatchCustomMetrics from './components/CloudWatchCustomMetrics'

export default function CloudWatchContent(): JSX.Element {
  const { errors } = useFormikContext<CloudWatchFormType>()

  return (
    <Container>
      <AWSRegionSelector />
      <CloudWatchCustomMetrics />

      {/* ⭐️ Error display for empty Custom metric ⛔️ */}
      <FormError
        name={CustomMetricsValidationName}
        // TS Ignored to display error for HealthSourceServicesV2
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        errorMessage={errors[CustomMetricsValidationName]}
      />
    </Container>
  )
}
