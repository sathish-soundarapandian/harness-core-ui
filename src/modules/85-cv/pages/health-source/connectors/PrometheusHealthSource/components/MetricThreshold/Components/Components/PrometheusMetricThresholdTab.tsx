import React from 'react'
import { Tabs } from '@harness/uicore'
import { useFormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import type { MapPrometheusQueryToService } from '@cv/pages/health-source/connectors/PrometheusHealthSource/PrometheusHealthSource.constants'
import PrometheusDIgnoreThresholdTabContent from './PrometheusIgnoreThresholdTabContent'
import PrometheusFailFastThresholdTabContent from './PrometheusFailFastThresholdTabContent'
import css from '../PrometheusMetricThresholdContent.module.scss'

export default function PrometheusMetricThresholdTab(): JSX.Element {
  const { getString } = useStrings()

  const { values: formValues } = useFormikContext<MapPrometheusQueryToService>()

  const ignoreThresholdsLength = formValues.ignoreThresholds.length
  const failFastThresholdsLength = formValues.failFastThresholds.length

  return (
    <Tabs
      id={'horizontalTabs'}
      defaultSelectedTabId={getString('cv.monitoringSources.appD.ignoreThresholds')}
      className={css.appDMetricThresholdContentTabs}
      tabList={[
        {
          id: getString('cv.monitoringSources.appD.ignoreThresholds'),
          title: `${getString('cv.monitoringSources.appD.ignoreThresholds')} (${ignoreThresholdsLength})`,
          panel: <PrometheusDIgnoreThresholdTabContent />
        },
        {
          id: getString('cv.monitoringSources.appD.failFastThresholds'),
          title: `${getString('cv.monitoringSources.appD.failFastThresholds')} (${failFastThresholdsLength})`,
          panel: <PrometheusFailFastThresholdTabContent />
        }
      ]}
    />
  )
}
