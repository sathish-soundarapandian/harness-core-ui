/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import { Formik, FormikForm } from '@harness/uicore'
import type { FormikHelpers } from 'formik'
import { checkIfRunTimeInput } from '@cv/components/PipelineSteps/ContinousVerification/utils'
import ServiceEnvironmentInputSet from '@cv/pages/monitored-service/MonitoredServiceInputSetsTemplate/components/ServiceEnvironmentInputSet/ServiceEnvironmentInputSet'

interface ServiceEnvironmentInputSetWrapperProps {
  prefix: string
  serviceRef?: string
  environmentRef?: string
  onChange: FormikHelpers<{ serviceRef?: string; environmentRef?: string }>['setFieldValue']
}
export const ServiceEnvironmentInputSetWrapper = ({
  prefix,
  onChange,
  serviceRef,
  environmentRef
}: ServiceEnvironmentInputSetWrapperProps): JSX.Element => {
  const serviceValue = checkIfRunTimeInput(serviceRef) ? '' : serviceRef
  const environmentValue = checkIfRunTimeInput(environmentRef) ? '' : environmentRef

  return (
    <Formik
      formName="ServiceEnvironmentInputSetWrapper"
      onSubmit={noop}
      initialValues={{
        serviceRef: serviceValue,
        environmentRef: environmentValue
      }}
    >
      <FormikForm>
        <ServiceEnvironmentInputSet
          serviceValue={serviceValue}
          serviceKey={`${prefix}spec.monitoredService.spec.templateInputs.serviceRef`}
          environmentValue={environmentValue}
          environmentKey={`${prefix}spec.monitoredService.spec.templateInputs.environmentRef`}
          onChange={onChange}
          isReadOnlyInputSet={false}
        />
      </FormikForm>
    </Formik>
  )
}
