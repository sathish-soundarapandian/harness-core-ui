import React from 'react'
import { Tabs } from '@harness/uicore'
import { useFormikContext } from 'formik'
import { useStrings } from 'framework/strings'
import type { AppDynamicsFomikFormInterface } from '@cv/pages/health-source/connectors/AppDynamics/AppDHealthSource.types'
import AppDIgnoreThresholdTabContent from './AppDIgnoreThresholdTabContent'
import AppDFailFastThresholdTabContent from './AppDFailFastThresholdTabContent'
import css from '../AppDMetricThresholdContent.module.scss'

export default function AppDMetricThresholdTab(): JSX.Element {
  const { getString } = useStrings()

  const { values: formValues } = useFormikContext<AppDynamicsFomikFormInterface>()

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
          panel: <AppDIgnoreThresholdTabContent />
        },
        {
          id: getString('cv.monitoringSources.appD.failFastThresholds'),
          title: `${getString('cv.monitoringSources.appD.failFastThresholds')} (${failFastThresholdsLength})`,
          panel: <AppDFailFastThresholdTabContent />
        }
      ]}
    />
  )
}
