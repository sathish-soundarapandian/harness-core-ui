/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { forwardRef } from 'react'
import * as Yup from 'yup'
import { isEmpty } from 'lodash-es'
import { IconName, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { yupToFormErrors, FormikErrors } from 'formik'
import { StepViewType, StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type { StringsMap } from 'stringTypes'
import type {
  IACMTerraformPluginData,
  IACMTerraformPluginStepProps,
  IACMTerraformPluginStepInfo
} from './StepTypes.types'
import { IACMTerraformPlugin } from './IACMTerraformPlugin'
import IACMTerraformPluginInputStep from './IACMTerraformPluginInputStep'
import { IACMTerraformPluginVariableStep } from './IACMTerraformVariableStep'
const IACMTerraformStepWithRef = forwardRef(IACMTerraformPlugin)

export class IACMTerraformPluginStep extends PipelineStep<IACMTerraformPluginStepInfo> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected type = StepType.IACMTerraformPlugin
  protected stepIcon: IconName = 'iacm'
  protected stepName = 'IACM Terraform Plugin'
  protected stepDescription: keyof StringsMap = 'iacm.pipelineSteps.description'
  protected stepIconSize = 32

  protected defaultValues = {
    type: StepType.IACMTerraformPlugin,
    name: '',
    identifier: '',
    spec: {
      command: ''
    }
  }

  /* istanbul ignore next */
  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<IACMTerraformPluginData>): FormikErrors<IACMTerraformPluginStepInfo> {
    const errors = {} as any
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      const timeout = Yup.object().shape({
        timeout: getDurationValidationSchema({ minimum: '10s' }).required(getString?.('validation.timeout10SecMinimum'))
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
    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    if (
      getMultiTypeFromValue(template?.spec?.command) === MultiTypeInputType.RUNTIME &&
      isRequired &&
      isEmpty(data?.spec?.command)
    ) {
      errors.spec = {
        ...errors.spec,
        command: getString?.('iacm.pipelineSteps.required', { name: getString?.('commandLabel') })
      }
    }

    return errors
  }

  renderStep(props: StepProps<any, unknown>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      onChange,
      allowableTypes,
      stepViewType,
      formikRef,
      isNewStep,
      readonly,
      inputSetData,
      path,
      customStepProps
    } = props
    /* istanbul ignore next */
    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <IACMTerraformPluginInputStep
          initialValues={initialValues}
          allowableTypes={allowableTypes}
          allValues={inputSetData?.allValues}
          stepViewType={stepViewType}
          readonly={inputSetData?.readonly}
          inputSetData={inputSetData}
          path={path}
        />
      )
    } else if (/* istanbul ignore next */ stepViewType === StepViewType.InputVariable) {
      return (
        <IACMTerraformPluginVariableStep
          {...(customStepProps as IACMTerraformPluginStepProps)}
          initialValues={initialValues}
        />
      )
    }

    return (
      <IACMTerraformStepWithRef
        initialValues={initialValues}
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
