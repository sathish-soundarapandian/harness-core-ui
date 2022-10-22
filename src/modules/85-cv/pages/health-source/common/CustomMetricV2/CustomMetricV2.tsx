import React, { useCallback, useMemo } from 'react'
import { useFormikContext } from 'formik'
import { Container } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import CardWithOuterTitle from '@common/components/CardWithOuterTitle/CardWithOuterTitle'
import CustomMetricSideNav from './components/CustomMetricSideNav'
import CustomMetricDetails from './components/CustomMetricDetails'
import type { CommonCustomMetricPropertyType, CommonCustomMetricsType } from './CustomMetric.types'
import {
  getIsCustomMetricPresent,
  getIsGivenMetricPresent,
  getNewMetricIdentifier,
  getNewMetricName,
  getUpdatedSelectedMetricIndex
} from './CustomMetric.utils'
import { defaultNewCustomMetricIdentifier, defaultNewCustomMetricName } from './CustomMetricV2.constants'
import AddCustomMetricButton from './components/AddCustomMetricsButton'
import css from './CustomMetricV2.module.scss'

export interface CustomMetricV2Props {
  headingText: string
  subHeading?: string
  newCustomMetricDefaultValues: CommonCustomMetricsType
  children: React.ReactNode
}

export default function CustomMetricV2<T extends CommonCustomMetricPropertyType>(
  props: CustomMetricV2Props
): JSX.Element {
  const { headingText, subHeading, newCustomMetricDefaultValues, children } = props
  const { values: formikValues, setValues } = useFormikContext<T>()

  const { getString } = useStrings()

  const onAddMetric = useCallback(() => {
    if (Array.isArray(formikValues.customMetrics)) {
      const updatedCustomMetric = [...formikValues.customMetrics]

      updatedCustomMetric.push({
        ...newCustomMetricDefaultValues,
        metricName: getNewMetricName(formikValues.customMetrics, defaultNewCustomMetricName),
        identifier: getNewMetricIdentifier(formikValues.customMetrics, defaultNewCustomMetricIdentifier)
      })

      setValues({
        ...formikValues,
        customMetrics: updatedCustomMetric,
        selectedCustomMetricIndex: updatedCustomMetric.length - 1
      })
    }
  }, [formikValues, setValues, newCustomMetricDefaultValues])

  const onDeleteMetric = useCallback(
    (customMetricNameToRemove: string) => {
      if (getIsGivenMetricPresent(formikValues.customMetrics, customMetricNameToRemove)) {
        const clonedCustomMetrics = [...formikValues.customMetrics]
        const filteredCustomMetrics = clonedCustomMetrics.filter(
          customMetric => customMetric.metricName !== customMetricNameToRemove
        )

        setValues({
          ...formikValues,
          customMetrics: filteredCustomMetrics,
          selectedCustomMetricIndex: getUpdatedSelectedMetricIndex(formikValues.selectedCustomMetricIndex)
        })
      }
    },
    [formikValues, setValues]
  )

  const isCustomMetricsPresent = useMemo(
    () => getIsCustomMetricPresent(formikValues?.customMetrics),
    [formikValues?.customMetrics]
  )

  if (!isCustomMetricsPresent) {
    return (
      <CardWithOuterTitle title={getString('cv.healthSource.connectors.customMetricsWithoutOptional')}>
        <AddCustomMetricButton onClick={onAddMetric} />
      </CardWithOuterTitle>
    )
  }

  return (
    <Container className={css.customMetricV2}>
      <CustomMetricSideNav<T> onAddMetric={onAddMetric} onDeleteMetric={onDeleteMetric} />
      <CustomMetricDetails headingText={headingText} subHeading={subHeading}>
        {children}
      </CustomMetricDetails>
    </Container>
  )
}
