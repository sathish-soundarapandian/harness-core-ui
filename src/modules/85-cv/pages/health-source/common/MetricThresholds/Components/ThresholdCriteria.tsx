/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useFormikContext } from 'formik'
import { FormInput, Layout, SelectOption } from '@harness/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import type { AppDynamicsFomikFormInterface } from '@cv/pages/health-source/connectors/AppDynamics/AppDHealthSource.types'
import { AppDynamicsMonitoringSourceFieldNames as FieldName } from '@cv/pages/health-source/connectors/AppDynamics/AppDHealthSource.constants'
import type { MetricThresholdCriteria } from 'services/cv'
import ThresholdSelect from './ThresholdSelect'
import type { ThresholdCriteriaPropsType } from '../MetricThresholds.types'
import { getCriterialItems, handleCriteriaPercentageUpdate } from '../MetricThresholds.utils'
import { MetricCriteriaValues, MetricThresholdPropertyName } from '../MetricThresholds.constants'
import css from './MetricThreshold.module.scss'

export default function ThresholdCriteria(props: ThresholdCriteriaPropsType): JSX.Element {
  const { index, thresholdTypeName, criteriaType, replaceFn } = props

  const { values: formValues } = useFormikContext<AppDynamicsFomikFormInterface>()

  const { getString } = useStrings()

  const isAbsoluteSelected = criteriaType === MetricCriteriaValues.Absolute

  const isIgnoreThresholdTab = thresholdTypeName === MetricThresholdPropertyName.IgnoreThreshold
  const isFailFastThresholdTab = thresholdTypeName === MetricThresholdPropertyName.FailFastThresholds

  const showGreaterThan = isFailFastThresholdTab || isAbsoluteSelected

  const showLessThan = isIgnoreThresholdTab || isAbsoluteSelected

  const handleCriteriaUpdate = (selectedValue: MetricThresholdCriteria['type']): void => {
    if (selectedValue === MetricCriteriaValues.Absolute) {
      return void 0
    }

    handleCriteriaPercentageUpdate({
      thresholds: formValues[thresholdTypeName],
      isIgnoreThresholdTab,
      isFailFastThresholdTab,
      index,
      selectedValue,
      replaceFn
    })
  }

  return (
    <Layout.Horizontal style={{ alignItems: 'center' }}>
      <ThresholdSelect
        items={getCriterialItems(getString)}
        className={cx(css.metricThresholdContentSelect, css.metricThresholdContentCriteria)}
        key={criteriaType || undefined}
        onChange={({ value }: SelectOption) => handleCriteriaUpdate(value as MetricThresholdCriteria['type'])}
        name={`${thresholdTypeName}.${index}.${FieldName.METRIC_THRESHOLD_CRITERIA}.type`}
      />

      {showGreaterThan && (
        <FormInput.Text
          inline
          className={css.metricThresholdContentInput}
          label={getString('cv.monitoringSources.appD.greaterThan')}
          inputGroup={{ type: 'number', min: 1 }}
          name={`${thresholdTypeName}.${index}.criteria.spec.${FieldName.METRIC_THRESHOLD_GREATER_THAN}`}
        />
      )}

      {showLessThan && (
        <FormInput.Text
          inline
          className={css.metricThresholdContentInput}
          label={getString('cv.monitoringSources.appD.lesserThan')}
          inputGroup={{ type: 'number', min: 1 }}
          name={`${thresholdTypeName}.${index}.criteria.spec.${FieldName.METRIC_THRESHOLD_LESS_THAN}`}
        />
      )}
    </Layout.Horizontal>
  )
}
