import React from 'react'
import { Accordion, Container } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import MetricThresholdTab from '@cv/pages/health-source/common/MetricThresholds/Components/MetricThresholdsTab'
import MetricThresholdContent from '@cv/pages/health-source/common/MetricThresholds/MetricThresholdsContent'
import { MetricThresholdContext } from './MetricThresholds.constants'
import IgnoreThresholdContent from './components/IgnoreThresholdsContent'
import FailFastThresholdContent from './components/FailFastThresholdsContent'
import type { MetricThresholdCommonProps } from '../../DatadogMetricsHealthSource.type'

export default function MetricThresholdProvider(props: MetricThresholdCommonProps): JSX.Element {
  const { getString } = useStrings()
  return (
    <Container margin={{ bottom: 'huge' }} padding="large">
      <Accordion activeId="MetricThresholdAdvanced">
        <Accordion.Panel
          id="MetricThresholdAdvanced"
          summary={getString('cv.monitoringSources.appD.advancedOptional')}
          details={
            <MetricThresholdContext.Provider value={{ ...props }}>
              <MetricThresholdContent>
                <MetricThresholdTab
                  IgnoreThresholdTabContent={IgnoreThresholdContent}
                  FailFastThresholdTabContent={FailFastThresholdContent}
                />
              </MetricThresholdContent>
            </MetricThresholdContext.Provider>
          }
        ></Accordion.Panel>
      </Accordion>
    </Container>
  )
}
