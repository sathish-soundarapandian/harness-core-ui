import React from 'react'
import { Accordion, Container } from '@harness/uicore'
import MetricThresholdTab from '@cv/pages/health-source/common/MetricThresholds/Components/MetricThresholdsTab'
import MetricThresholdContent from '@cv/pages/health-source/common/MetricThresholds/MetricThresholdsContent'
import { useStrings } from 'framework/strings'
import type { PrometheusMetricThresholdPropsType } from './PrometheusMetricThreshold.types'
import { PrometheusMetricThresholdContext } from './PrometheusMetricThresholdConstants'
import IgnoreThresholdContent from './Components/IgnoreThresholdsContent'
import FailFastThresholdContent from './Components/FailFastThresholdsContent'

export default function PrometheusMetricThreshold(props: PrometheusMetricThresholdPropsType): JSX.Element {
  const { getString } = useStrings()
  return (
    <Container style={{ marginBottom: 'huge' }} padding="large">
      <Accordion activeId="advancedPrometheus">
        <Accordion.Panel
          id="advancedPrometheus"
          summary={getString('cv.monitoringSources.appD.advancedOptional')}
          details={
            <PrometheusMetricThresholdContext.Provider value={{ ...props }}>
              <MetricThresholdContent>
                <MetricThresholdTab
                  IgnoreThresholdTabContent={IgnoreThresholdContent}
                  FailFastThresholdTabContent={FailFastThresholdContent}
                />
              </MetricThresholdContent>
            </PrometheusMetricThresholdContext.Provider>
          }
        ></Accordion.Panel>
      </Accordion>
    </Container>
  )
}
