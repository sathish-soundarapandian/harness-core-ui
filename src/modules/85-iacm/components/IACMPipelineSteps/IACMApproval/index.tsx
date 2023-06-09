import React from 'react'
import * as Yup from 'yup'
import { MultiTypeInputType, getMultiTypeFromValue } from '@harness/uicore'
import type { IconName } from '@harness/icons'
import { FormikErrors, yupToFormErrors } from 'formik'

import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { PipelineStep, StepProps } from '@pipeline/components/PipelineSteps/PipelineStep'
import { ValidateInputSetProps, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { StringsMap } from 'stringTypes'

import StepMode from './StepMode'
import type { IACMApprovalData } from './types'

export class IACMApprovalStep extends PipelineStep<IACMApprovalData> {
  protected defaultValues = {
    identifier: '',
    name: '',
    timeout: '1d'
  }

  protected type = StepType.IACMApproval
  protected stepIcon: IconName = 'iacm'
  protected stepIconSize = 32
  protected stepName = 'IACM Approval'
  protected stepDescription: keyof StringsMap = 'iacm.pipelineSteps.approvalDescription'

  validateInputSet(args: ValidateInputSetProps<IACMApprovalData>): FormikErrors<IACMApprovalData> {
    const { template, viewType, getString, data } = args
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    const errors: FormikErrors<IACMApprovalData> = {}

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

    return {}
  }

  renderStep(this: IACMApprovalStep, props: StepProps<IACMApprovalData, unknown>): JSX.Element {
    const { formikRef, stepViewType, ...rest } = props

    return <StepMode ref={formikRef} stepViewType={stepViewType || StepViewType.Edit} {...rest} />
  }
}
