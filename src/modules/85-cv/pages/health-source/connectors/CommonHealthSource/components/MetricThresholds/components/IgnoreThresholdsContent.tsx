/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext } from 'react'
import { useFormikContext } from 'formik'

import IgnoreThresholdsFieldArray from '@cv/pages/health-source/common/MetricThresholds/Components/IgnoreThresholdsFieldArray'
import { MetricThresholdContext } from '../MetricThresholds.constants'
import type { CommonHealthSourceConfigurations } from '../../../CommonHealthSource.types'

export default function IgnoreThresholdContent(): JSX.Element {
  const { values: formValues } = useFormikContext<CommonHealthSourceConfigurations>()

  const { metricPacks, groupedCreatedMetrics, isOnlyCustomMetricHealthSource } = useContext(MetricThresholdContext)

  return (
    <IgnoreThresholdsFieldArray
      formValues={formValues}
      groupedCreatedMetrics={groupedCreatedMetrics}
      metricPacks={metricPacks}
      isOnlyCustomMetricHealthSource={isOnlyCustomMetricHealthSource}
    />
  )
}
