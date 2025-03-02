/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useEffect } from 'react'
import { useFormikContext } from 'formik'

import type { AppDynamicsFomikFormInterface } from '@cv/pages/health-source/connectors/AppDynamics/AppDHealthSource.types'
import IgnoreThresholdsFieldArray from '@cv/pages/health-source/common/MetricThresholds/Components/IgnoreThresholdsFieldArray'
import { MetricThresholdContext } from '../MetricThresholds.constants'

export default function IgnoreThresholdContent(): JSX.Element {
  const { values: formValues } = useFormikContext<AppDynamicsFomikFormInterface>()

  const { metricPacks, groupedCreatedMetrics, setThresholdState } = useContext(MetricThresholdContext)

  useEffect(() => {
    setThresholdState(previousValues => ({
      ...previousValues,
      ignoreThresholds: formValues.ignoreThresholds
    }))
  }, [formValues.ignoreThresholds, setThresholdState])

  return (
    <IgnoreThresholdsFieldArray
      formValues={formValues}
      groupedCreatedMetrics={groupedCreatedMetrics}
      metricPacks={metricPacks}
    />
  )
}
