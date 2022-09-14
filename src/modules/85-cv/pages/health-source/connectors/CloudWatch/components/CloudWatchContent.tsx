import { Container } from '@harness/uicore'
import React from 'react'
import AWSRegionSelector from './components/AWSRegionSelector'
import CloudWatchCustomMetrics from './components/CloudWatchCustomMetrics'

export default function CloudWatchContent(): JSX.Element {
  return (
    <Container>
      <AWSRegionSelector />
      <CloudWatchCustomMetrics />
    </Container>
  )
}
