import React from 'react'
import MetricPackOptions from './components/MetricPackOptions'
import ThresholdTypes from './components/ThresholdTypes'

export default function RiskProfileV2(): JSX.Element {
  return (
    <>
      <MetricPackOptions />
      <ThresholdTypes />
    </>
  )
}
