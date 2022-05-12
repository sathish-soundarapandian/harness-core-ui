/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { FormikProps } from 'formik'
import { CreateSLOEnum } from './CreateSLO.constants'
import type { SLOForm } from './CreateSLO.types'

export const isFormDataValid = (formikProps: FormikProps<SLOForm>, selectedTabId: CreateSLOEnum): boolean => {
  if (selectedTabId === CreateSLOEnum.NAME) {
    formikProps.setFieldTouched('name', true)
    formikProps.setFieldTouched('userJourneyRef', true)

    const { name, userJourneyRef } = formikProps.values

    if (!name || !userJourneyRef) {
      return false
    }
  }

  if (selectedTabId === CreateSLOEnum.SLI) {
    formikProps.setFieldTouched('monitoredServiceRef', true)
    formikProps.setFieldTouched('healthSourceRef', true)
    formikProps.setFieldTouched('serviceLevelIndicators.spec.spec.eventType', true)
    formikProps.setFieldTouched('serviceLevelIndicators.spec.spec.metric1', true)
    formikProps.setFieldTouched('serviceLevelIndicators.spec.spec.metric2', true)
    formikProps.setFieldTouched('serviceLevelIndicators.spec.objectiveValue', true)
    formikProps.setFieldTouched('serviceLevelIndicators.spec.comparator', true)

    const { monitoredServiceRef, healthSourceRef, serviceLevelIndicators } = formikProps.errors

    if (monitoredServiceRef || healthSourceRef || serviceLevelIndicators) {
      return false
    }
  }

  return true
}
