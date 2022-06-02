/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import BaseContinousVerification from './components/BaseContinousVerification/BaseContinousVerification'
import type { ContinousVerificationWidgetSectionsProps } from './types'
import SelectVerificationType from './components/SelectVerificationType/SelectVerificationType'
import ConfigureFields from './components/ConfigureFields/ConfigureFields'
import MonitoredService from './components/MonitoredService/MonitoredService'
import SelectMonitoredServiceType from './components/SelectMonitoredServiceType/SelectMonitoredServiceType'

export function ContinousVerificationWidgetSections({
  formik,
  isNewStep,
  stepViewType,
  allowableTypes
}: ContinousVerificationWidgetSectionsProps): JSX.Element {
  return (
    <>
      <BaseContinousVerification
        formik={formik}
        isNewStep={isNewStep}
        stepViewType={stepViewType}
        allowableTypes={allowableTypes}
      />
      <SelectVerificationType />
      <SelectMonitoredServiceType />
      <MonitoredService formik={formik} />
      {formik?.values?.spec?.type ? <ConfigureFields formik={formik} allowableTypes={allowableTypes} /> : null}
    </>
  )
}
