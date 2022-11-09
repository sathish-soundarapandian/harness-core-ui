/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import { isEmpty } from 'lodash-es'
import type { IconName } from '@harness/uicore'
import { yupToFormErrors, FormikErrors } from 'formik'
import { StepViewType, StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { StringsMap } from 'stringTypes'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { isValueRuntimeInput } from '@common/utils/utils'
import TerraformPlanRef from './TerraformPlanRef'

export class TerraformPlan extends PipelineStep<any> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected type = StepType.TerraformPlan
  protected stepIcon: IconName = 'terraform-plan'
  protected stepName = 'IACM Terraform Plan'
  protected stepDescription: keyof StringsMap = 'cd.azureArm.description'

  protected defaultValues = {
    type: StepType.TerraformPlan,
    name: '',
    identifier: '',
    timeout: '10m',
    spec: {
      provisionerIdentifier: '',
      configuration: {
        connectorRef: '',
        template: {},
        scope: {
          type: 'ResourceGroup',
          spec: {}
        }
      }
    }
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<any>): FormikErrors<any> {
    const errors = {} as any
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm

    if (isValueRuntimeInput(template?.timeout as string) && isRequired) {
      const timeout = Yup.object().shape({
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString?.('validation.timeout10SecMinimum'))
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

    if (isEmpty(errors.spec)) {
      delete errors.spec
    }
    return errors
  }

  private getInitialValues(data: any) {
    return data
  }

  renderStep({
    initialValues,
    onUpdate,
    onChange,
    allowableTypes,
    stepViewType,
    formikRef,
    isNewStep,
    readonly,
  }: StepProps<any>): JSX.Element {
    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return <>Hello world</>
    } else if (stepViewType === StepViewType.InputVariable) {
      return <>Hello world</>
    }

    return (
      <TerraformPlanRef
        initialValues={this.getInitialValues(initialValues)}
        onUpdate={onUpdate}
        onChange={onChange}
        allowableTypes={allowableTypes}
        isNewStep={isNewStep}
        ref={formikRef}
        readonly={readonly}
        stepViewType={stepViewType}
      />
    )
  }
}
