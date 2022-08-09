import React from 'react'
import { Accordion, Container } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import PrometheusMetricThresholdContent from './Components/PrometheusMetricThresholdContent'
import type { PrometheusMetricThresholdPropsType } from './PrometheusMetricThreshold.types'
import { PrometheusMetricThresholdContext } from './PrometheusMetricThresholdConstants'

export default function PrometheusMetricThreshold({
  formikValues,
  groupedCreatedMetrics,
  setMetricThresholds
}: PrometheusMetricThresholdPropsType): JSX.Element {
  const { getString } = useStrings()
  return (
    <Container style={{ marginBottom: '120px' }} padding="large">
      <Accordion activeId="advancedPrometheus">
        <Accordion.Panel
          id="advancedPrometheus"
          summary={getString('cv.monitoringSources.appD.advancedOptional')}
          details={
            <PrometheusMetricThresholdContext.Provider
              value={{ formikValues, groupedCreatedMetrics, setMetricThresholds }}
            >
              <PrometheusMetricThresholdContent />
            </PrometheusMetricThresholdContext.Provider>
          }
        ></Accordion.Panel>
      </Accordion>
    </Container>
  )
}
