/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { FormikErrors, yupToFormErrors } from 'formik'
import * as Yup from 'yup'
import { getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'

import type { StepElementConfig } from 'services/cd-ng'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { ValidateInputSetProps, StepViewType } from '@pipeline/components/AbstractSteps/Step'

export const validateGenericFields = ({
  data,
  template,
  getString,
  viewType
}: ValidateInputSetProps<StepElementConfig>): FormikErrors<StepElementConfig> => {
  const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
  const errors: FormikErrors<StepElementConfig> = {}

  if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
    let timeoutSchema = getDurationValidationSchema({ minimum: '10s' })
    if (isRequired) {
      timeoutSchema = timeoutSchema.required(getString?.('validation.timeout10SecMinimum'))
    }
    const timeout = Yup.object().shape({
      timeout: timeoutSchema
    })
    try {
      timeout.validateSync(data)
    } catch (e) {
      if (e instanceof Yup.ValidationError) {
        const err = yupToFormErrors(e)
        Object.assign(errors, err)
      }
    }
  }
  return errors
}
