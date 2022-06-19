/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { FormikErrors, FormikProps, yupToFormErrors } from 'formik'
import { isEmpty } from 'lodash-es'
import * as Yup from 'yup'

import { getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import type { DeploymentStageConfig, EnvironmentResponseDTO } from 'services/cd-ng'

import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'

import { StepViewType, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'

import type { DeployInfrastructureStepConfig } from './DeployInfrastructureStep'

export interface DeployInfrastructureProps {
  initialValues: DeployInfrastructureStepConfig
  onUpdate?: (data: DeployInfrastructureStepConfig) => void
  readonly: boolean
  allowableTypes: MultiTypeInputType[]
  stepViewType?: StepViewType
  inputSetData?: {
    template?: DeployInfrastructureStepConfig
    path?: string
    readonly?: boolean
  }
}

export interface DeployInfrastructureState {
  isEdit: boolean
  isEnvironment: boolean
  formik?: FormikProps<DeploymentStageConfig>
  data?: EnvironmentResponseDTO
}

export function isEditEnvironment(data?: EnvironmentResponseDTO): boolean {
  if (!isEmpty(data?.identifier)) {
    return true
  }
  return false
}

export function isEditEnvironmentOrEnvGroup(data?: EnvironmentResponseDTO): boolean {
  if (!isEmpty(data?.identifier)) {
    return true
  }
  return false
}

export function isEditInfrastructure(data?: string): boolean {
  if (!isEmpty(data)) {
    return true
  }
  return false
}

export function validateStepForm({
  data,
  template,
  getString,
  viewType
}: ValidateInputSetProps<any>): FormikErrors<any> {
  const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const errors = {} as any
  // istanbul ignore next
  // istanbul ignore else
  if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
    // istanbul ignore next
    let timeoutSchema = getDurationValidationSchema({ minimum: '10s' })
    // istanbul ignore next
    if (isRequired) {
      // istanbul ignore next
      timeoutSchema = timeoutSchema.required(getString?.('validation.timeout10SecMinimum'))
    }
    const timeout = Yup.object().shape({
      timeout: timeoutSchema
    })

    try {
      timeout.validateSync(data)
    } catch (e) {
      /* istanbul ignore else */
      if (e instanceof Yup.ValidationError) {
        const err = yupToFormErrors(e)

        Object.assign(errors, err)
      }
    }
  }
  return errors
}
