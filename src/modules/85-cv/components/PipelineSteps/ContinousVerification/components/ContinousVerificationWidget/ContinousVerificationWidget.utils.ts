/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import type { FormikErrors } from 'formik'
import type { StringKeys } from 'framework/strings'
import type { ContinousVerificationData, VerifyStepMonitoredService } from '../../types'
import { isAnExpression } from './components/ContinousVerificationWidgetSections/components/MonitoredService/MonitoredService.utils'
import { MONITORED_SERVICE_TYPE } from './components/ContinousVerificationWidgetSections/components/SelectMonitoredServiceType/SelectMonitoredServiceType.constants'

export function healthSourcesValidation(
  monitoredServiceRef: string | undefined,
  healthSources: { identifier: string }[] | undefined,
  spec: any,
  getString: (key: StringKeys) => string,
  errors: FormikErrors<ContinousVerificationData>
): any {
  if (
    monitoredServiceRef !== RUNTIME_INPUT_VALUE &&
    !isAnExpression(monitoredServiceRef as string) &&
    monitoredServiceRef &&
    !healthSources?.length
  ) {
    spec = {
      ...spec,
      healthSources: getString('connectors.cdng.validations.healthSourceRequired')
    }
    errors['spec'] = spec
  }
  return spec
}

export function monitoredServiceRefValidation(
  monitoredServiceRef: string | undefined,
  spec: any,
  errors: FormikErrors<ContinousVerificationData>
): any {
  if (!monitoredServiceRef) {
    spec = {
      ...spec,
      monitoredServiceRef: 'Monitored service is required'
    }
    errors['spec'] = spec
  }
  return spec
}

export function configuredMonitoredServiceRefValidation(
  monitoredServiceRef: string | undefined,
  spec: any,
  errors: FormikErrors<ContinousVerificationData>
): any {
  if (!monitoredServiceRef) {
    spec = {
      monitoredService: {
        spec: {
          monitoredServiceRef: 'Monitored service is required'
        }
      }
    }
    errors['spec'] = spec
  }
  return spec
}

export function getMonitoredServiceRefFromType(
  monitoredService: VerifyStepMonitoredService,
  type: string,
  formData: ContinousVerificationData
): string {
  let monitoredServiceRef = monitoredService?.spec?.monitoredServiceRef as string
  if (type === MONITORED_SERVICE_TYPE.DEFAULT) {
    monitoredServiceRef = formData?.spec?.monitoredServiceRef as string
  }
  return monitoredServiceRef
}
