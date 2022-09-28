/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useEffect } from 'react'
import { useFormikContext } from 'formik'

import IgnoreThresholdsFieldArray from '@cv/pages/health-source/common/MetricThresholds/Components/IgnoreThresholdsFieldArray'
import { MetricThresholdContext } from '../MetricThresholds.constants'
import type { MapCustomHealthToService } from '../../../CustomHealthSource.types'

export default function IgnoreThresholdContent(): JSX.Element {
  const { values: formValues } = useFormikContext<MapCustomHealthToService>()

  const { groupedCreatedMetrics, setThresholdState } = useContext(MetricThresholdContext)

  useEffect(() => {
    /* istanbul ignore next */
    setThresholdState(previousValues => ({
      ...previousValues,
      ignoreThresholds: formValues.ignoreThresholds
    }))
  }, [formValues.ignoreThresholds, setThresholdState])

  return (
    <IgnoreThresholdsFieldArray
      formValues={formValues}
      groupedCreatedMetrics={groupedCreatedMetrics}
      isOnlyCustomMetricHealthSource
    />
  )
}
