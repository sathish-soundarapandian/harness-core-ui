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
import type { StringsMap } from 'stringTypes'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import type { RollbackStackData, RollbackStackStepInfo, RollbackVariableStepProps } from './AzureArmRollback.types'
import { RollbackStack } from './AzureArmRollbackRef'
import { AzureArmRollbackVariableStep } from './AzureArmRollbackVariableView'
import AzureArmRollbackStackInputStep from './AzureArmRollbackInputSteps'
const AzureArmRollbackWithRef = forwardRef(RollbackStack)

export class AzureArmRollback extends PipelineStep<RollbackStackStepInfo> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected type = StepType.AzureArmRollback
  protected stepIcon: IconName = 'azure-arm-rollback'
  protected stepName = 'Azure ARM Rollback'
  protected stepDescription: keyof StringsMap = 'cd.azureArmRollback.description'
  protected stepIconSize = 32

  protected defaultValues = {
    type: StepType.AzureArmRollback,
    name: '',
    identifier: '',
    timeout: '10m',
    spec: {
      provisionerIdentifier: ''
    }
  }

  /* istanbul ignore next */
  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<RollbackStackData>): FormikErrors<RollbackStackStepInfo> {
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
      getMultiTypeFromValue(template?.spec?.provisionerIdentifier) === MultiTypeInputType.RUNTIME &&
      isRequired &&
      isEmpty(data?.spec?.provisionerIdentifier)
    ) {
      errors.spec = {
        ...errors.spec,
        provisionerIdentifier: getString?.('common.validation.provisionerIdentifierIsRequired')
      }
    }

    return errors
  }

  private getInitialValues(data: RollbackStackData): RollbackStackData {
    return data
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

    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <AzureArmRollbackStackInputStep
          initialValues={initialValues}
          allowableTypes={allowableTypes}
          allValues={inputSetData?.allValues}
          stepViewType={stepViewType}
          readonly={inputSetData?.readonly}
          inputSetData={inputSetData}
          path={path}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <AzureArmRollbackVariableStep
          {...(customStepProps as RollbackVariableStepProps)}
          initialValues={initialValues}
        />
      )
    }

    return (
      <AzureArmRollbackWithRef
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
