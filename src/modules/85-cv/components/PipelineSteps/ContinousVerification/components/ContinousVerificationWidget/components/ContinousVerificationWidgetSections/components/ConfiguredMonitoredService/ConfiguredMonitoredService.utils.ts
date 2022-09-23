/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import type { ContinousVerificationData } from '@cv/components/PipelineSteps/ContinousVerification/types'
import type { ResponseMonitoredServiceResponse } from 'services/cv'
import { isAnExpression } from '../MonitoredService/MonitoredService.utils'

export function isMonitoredServiceFixedInput(monitoredServiceRef: string): boolean {
  return !!(monitoredServiceRef !== RUNTIME_INPUT_VALUE && monitoredServiceRef && !isAnExpression(monitoredServiceRef))
}

export function isFirstTimeOpenForConfiguredMonitoredSvc(
  formValues: ContinousVerificationData,
  monitoredServiceData: ResponseMonitoredServiceResponse | null
): boolean {
  return !!(!formValues?.spec?.monitoredServiceRef && monitoredServiceData?.data?.monitoredService?.identifier)
}
