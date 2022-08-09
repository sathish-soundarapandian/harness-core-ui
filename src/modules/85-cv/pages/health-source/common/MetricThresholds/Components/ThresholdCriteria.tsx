/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo } from 'react'
import { useFormikContext } from 'formik'
import { FormInput, Layout, SelectOption } from '@harness/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import type { MetricThresholdCriteria } from 'services/cv'
import type { AppDynamicsFomikFormInterface } from '@cv/pages/health-source/connectors/AppDynamics/AppDHealthSource.types'
import { AppDynamicsMonitoringSourceFieldNames as FieldName } from '@cv/pages/health-source/connectors/AppDynamics/AppDHealthSource.constants'
import ThresholdSelect from './ThresholdSelect'
import type { CriteriaThresholdValues, ThresholdCriteriaPropsType } from '../MetricThresholds.types'
import {
  getCriterialItems,
  getCriteriaPercentageDropdownOptions,
  getIsShowGreaterThan,
  getIsShowLessThan
} from '../MetricThresholds.utils'
import { MetricCriteriaValues, PercentageCriteriaDropdownValues as PercentageType } from '../MetricThresholds.constants'
import css from './MetricThreshold.module.scss'

export default function ThresholdCriteria(props: ThresholdCriteriaPropsType): JSX.Element {
  const { index, thresholdTypeName, criteriaType, criteriaPercentageType, replaceFn } = props

  const { values: formValues, setFieldTouched, setFieldValue } = useFormikContext<AppDynamicsFomikFormInterface>()

  const { getString } = useStrings()

  const isAbsoluteSelected = criteriaType === MetricCriteriaValues.Absolute

  const criteriaSpecValue = formValues[thresholdTypeName][index].criteria.spec

  const showGreaterThan = useMemo(
    () => getIsShowGreaterThan(criteriaType, criteriaPercentageType, criteriaSpecValue),
    [criteriaType, criteriaPercentageType, criteriaSpecValue]
  )

  const showLessThan = useMemo(
    () => getIsShowLessThan(criteriaType, criteriaPercentageType, criteriaSpecValue),
    [criteriaType, criteriaPercentageType, criteriaSpecValue]
  )

  useEffect(() => {
    setFieldTouched(`${thresholdTypeName}.${index}.criteria.spec.${FieldName.METRIC_THRESHOLD_GREATER_THAN}`, true)
    setFieldTouched(`${thresholdTypeName}.${index}.criteria.spec.${FieldName.METRIC_THRESHOLD_LESS_THAN}`, true)

    // This is to set criteriaPercentageType during edit
    if (!isAbsoluteSelected && !criteriaPercentageType) {
      setFieldValue(
        `${thresholdTypeName}.${index}.criteria.${FieldName.METRIC_THRESHOLD_CRITERIA_PERCENTAGE_TYPE}`,
        showGreaterThan ? PercentageType.GreaterThan : PercentageType.LessThan
      )
    }
  }, [
    index,
    setFieldTouched,
    thresholdTypeName,
    isAbsoluteSelected,
    criteriaPercentageType,
    setFieldValue,
    showGreaterThan
  ])

  const handleCriteriaUpdate = (selectedValue: MetricThresholdCriteria['type']): void => {
    if (selectedValue === MetricCriteriaValues.Absolute) {
      return void 0
    }

    const clonedThresholdValue = [...formValues[thresholdTypeName]]

    const updatedThresholds = { ...clonedThresholdValue[index] }

    const criteriaDetails = updatedThresholds.criteria

    // whenever the criteria value is changed to Percentage, Greater than value is set as default and Less than is set to undefined
    criteriaDetails.type = selectedValue
    criteriaDetails.criteriaPercentageType = PercentageType.GreaterThan

    if (!criteriaDetails.spec) {
      criteriaDetails.spec = {}
    }

    criteriaDetails.spec.lessThan = undefined

    clonedThresholdValue[index] = updatedThresholds

    replaceFn(updatedThresholds)
  }

  const handleCriteriaPercentageUpdate = (selectedValue: CriteriaThresholdValues): void => {
    const clonedThresholdValue = [...formValues[thresholdTypeName]]

    const updatedThresholds = { ...clonedThresholdValue[index] }
    const criteriaDetails = updatedThresholds.criteria
    criteriaDetails.criteriaPercentageType = selectedValue

    if (!criteriaDetails.spec) {
      criteriaDetails.spec = {}
    }

    if (selectedValue === PercentageType.GreaterThan) {
      criteriaDetails.spec.lessThan = undefined
    } else if (selectedValue === PercentageType.LessThan) {
      criteriaDetails.spec.greaterThan = undefined
    }

    clonedThresholdValue[index] = updatedThresholds

    replaceFn(updatedThresholds)
  }

  return (
    <Layout.Horizontal style={{ alignItems: 'center' }}>
      <ThresholdSelect
        items={getCriterialItems(getString)}
        className={cx(css.metricThresholdSelect, css.metricThresholdCriteria)}
        key={criteriaType || undefined}
        onChange={({ value }: SelectOption) => handleCriteriaUpdate(value as MetricThresholdCriteria['type'])}
        name={`${thresholdTypeName}.${index}.${FieldName.METRIC_THRESHOLD_CRITERIA}.type`}
      />
      {criteriaType === MetricCriteriaValues.Percentage && (
        <ThresholdSelect
          items={getCriteriaPercentageDropdownOptions(getString)}
          className={cx(css.metricThresholdSelect, css.metricThresholdCriteria)}
          onChange={({ value }: SelectOption) => handleCriteriaPercentageUpdate(value as CriteriaThresholdValues)}
          name={`${thresholdTypeName}.${index}.${FieldName.METRIC_THRESHOLD_CRITERIA}.${FieldName.METRIC_THRESHOLD_CRITERIA_PERCENTAGE_TYPE}`}
        />
      )}
      {showGreaterThan && (
        <FormInput.Text
          inline
          className={css.metricThresholdInput}
          label={isAbsoluteSelected ? getString('cv.monitoringSources.appD.greaterThan') : null}
          inputGroup={{ type: 'number', min: 1 }}
          name={`${thresholdTypeName}.${index}.criteria.spec.${FieldName.METRIC_THRESHOLD_GREATER_THAN}`}
        />
      )}

      {showLessThan && (
        <FormInput.Text
          inline
          className={css.metricThresholdInput}
          label={isAbsoluteSelected ? getString('cv.monitoringSources.appD.lesserThan') : null}
          inputGroup={{ type: 'number', min: 1 }}
          name={`${thresholdTypeName}.${index}.criteria.spec.${FieldName.METRIC_THRESHOLD_LESS_THAN}`}
        />
      )}
    </Layout.Horizontal>
  )
}
