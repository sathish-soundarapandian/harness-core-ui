import React from 'react'
import { Color, Container, Tabs, Text } from '@harness/uicore'
import { useFormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import type { CommonFormTypesForMetricThresholds, MetricThresholdsTabProps } from '../MetricThresholds.types'
import css from '../MetricThresholds.module.scss'

export default function MetricThresholdTab<T>(props: MetricThresholdsTabProps): JSX.Element {
  const { IgnoreThresholdTabContent, FailFastThresholdTabContent } = props
  const { getString } = useStrings()

  const { values: formValues } = useFormikContext<T & CommonFormTypesForMetricThresholds>()

  const ignoreThresholdsLength = formValues?.ignoreThresholds?.length
  const failFastThresholdsLength = formValues?.failFastThresholds?.length

  return (
    <Tabs
      id={'horizontalTabs'}
      defaultSelectedTabId={getString('cv.monitoringSources.appD.ignoreThresholds')}
      className={css.metricThresholdContentTabs}
      tabList={[
        {
          id: getString('cv.monitoringSources.appD.ignoreThresholds'),
          title: `${getString('cv.monitoringSources.appD.ignoreThresholds')} (${ignoreThresholdsLength})`,
          panel: (
            <Container margin={{ top: 'large' }}>
              <Text color={Color.BLACK}>{getString('cv.monitoringSources.appD.ignoreThresholdHint')}</Text>
              <Container>
                <IgnoreThresholdTabContent />
              </Container>
            </Container>
          )
        },
        {
          id: getString('cv.monitoringSources.appD.failFastThresholds'),
          title: `${getString('cv.monitoringSources.appD.failFastThresholds')} (${failFastThresholdsLength})`,
          panel: (
            <Container margin={{ top: 'large' }}>
              <Text color={Color.BLACK}>{getString('cv.monitoringSources.appD.failFastThresholdHint')}</Text>
              <Container>
                <FailFastThresholdTabContent />
              </Container>
            </Container>
          )
        }
      ]}
    />
  )
}
