import React, { useCallback, useMemo } from 'react'
import cx from 'classnames'
import { useFormikContext } from 'formik'
import { Layout } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import type { GroupedMetric } from '@cv/components/MultiItemsSideNav/components/SelectedAppsSideNav/components/GroupedSideNav/GroupedSideNav.types'
import GroupedSideNav from '@cv/components/MultiItemsSideNav/components/SelectedAppsSideNav/components/GroupedSideNav/GroupedSideNav'
import AddCustomMetricButton from '../AddCustomMetricsButton'
import { getCurrentSelectedMetricName, getGroupedCustomMetrics } from '../../CustomMetric.utils'
import type { CommonCustomMetricPropertyType } from '../../CustomMetric.types'
import { selectedIndexFormikPropertyName } from '../../CustomMetricV2.constants'
import css from '@cv/components/MultiItemsSideNav/components/SelectedAppsSideNav/SelectedAppsSideNav.module.scss'
import customCSS from '../../CustomMetricV2.module.scss'

export interface CustomMetricSideNavProps {
  onAddMetric: () => void
  onDeleteMetric: (customMetricNameToRemove: string) => void
}

export default function CustomMetricSideNav<T extends CommonCustomMetricPropertyType>(
  props: CustomMetricSideNavProps
): JSX.Element {
  const { onAddMetric, onDeleteMetric } = props

  const { getString } = useStrings()

  const { values: formValues, setFieldValue, isValid: isFormValid } = useFormikContext<T>()

  const onMetricNameSelect = useCallback(
    selectedMetricName => {
      const selectedMetricNameIndex = formValues.customMetrics.findIndex(
        customMetric => customMetric.metricName === selectedMetricName
      )

      if (selectedMetricNameIndex !== -1) {
        setFieldValue(selectedIndexFormikPropertyName, selectedMetricNameIndex)
      }
    },
    [formValues.customMetrics, setFieldValue]
  )

  const groupedCreatedMetrics = useMemo(
    () => getGroupedCustomMetrics(formValues.customMetrics, getString),
    [formValues, getString]
  )

  const currentSelectedMetricName = useMemo(() => {
    return getCurrentSelectedMetricName(formValues.customMetrics, formValues.selectedCustomMetricIndex)
  }, [formValues.customMetrics, formValues.selectedCustomMetricIndex])

  const groupedEntries = Object.entries(groupedCreatedMetrics)

  return (
    <Layout.Vertical className={cx(css.main, customCSS.sideNav)} spacing="medium">
      <AddCustomMetricButton disabled={!isFormValid} onClick={onAddMetric} />
      <GroupedSideNav
        onSelect={onMetricNameSelect}
        selectedItem={currentSelectedMetricName}
        onRemoveItem={onDeleteMetric}
        groupedSelectedAppsList={groupedEntries as [string, GroupedMetric[]][]}
        isMetricThresholdEnabled={false}
      />
    </Layout.Vertical>
  )
}
