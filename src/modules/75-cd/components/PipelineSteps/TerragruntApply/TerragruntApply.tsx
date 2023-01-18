/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { IconName, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import * as Yup from 'yup'
import { v4 as uuid } from 'uuid'
import { get, isEmpty } from 'lodash-es'
import { yupToFormErrors, FormikErrors } from 'formik'
import { PipelineStep, StepProps } from '@pipeline/components/PipelineSteps/PipelineStep'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { StepViewType, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import type { StringNGVariable } from 'services/pipeline-ng'
import type { StringsMap } from 'framework/strings/StringsContext'
import TerragruntInputStep from '../Common/Terragrunt/InputSteps/TerragruntInputStep'
import { ConfigurationTypes } from '../Common/Terraform/TerraformInterfaces'
import type { TerragruntData, TerragruntVariableStepProps } from '../Common/Terragrunt/TerragruntInterface'
import { onSubmitTerragruntData } from '../Common/Terragrunt/TerragruntHelper'
import { TerragruntVariableStep } from '../Common/Terragrunt/VariableView/TerragruntVariableView'
import TerragruntEditView from '../Common/Terragrunt/EditView/TerragruntEditView'

const TerragruntApplyWidgetWithRef = React.forwardRef(TerragruntEditView)

export class TerragruntApply extends PipelineStep<TerragruntData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }
  protected type = StepType.TerragruntApply
  protected referenceId = 'terragruntApplyStep'
  protected defaultValues: TerragruntData = {
    identifier: '',
    timeout: '10m',
    name: '',
    type: StepType.TerragruntApply,
    spec: {
      configuration: {
        type: ConfigurationTypes.Inline,
        spec: {
          configFiles: {
            store: {
              type: 'Git',
              spec: {
                gitFetchType: 'Branch'
              }
            }
          },
          moduleConfig: {
            terragruntRunType: 'RunModule',
            path: ''
          }
        }
      },
      provisionerIdentifier: ''
    }
  }
  protected stepIcon: IconName = 'terragrunt-apply'
  protected stepName = 'Terragrunt Apply'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.TerragruntApply'

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<TerragruntData>): FormikErrors<TerragruntData> {
    const errors = {} as any
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (getMultiTypeFromValue(get(template, 'timeout')) === MultiTypeInputType.RUNTIME) {
      let timeoutSchema = getDurationValidationSchema({ minimum: '10s' })
      /* istanbul ignore next */
      if (isRequired) {
        timeoutSchema = timeoutSchema.required(getString?.('validation.timeout10SecMinimum'))
      }
      const timeout = Yup.object().shape({
        timeout: timeoutSchema
      })
      try {
        timeout.validateSync(data)
      } /* istanbul ignore next */ catch (e) {
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

  private getInitialValues(data: TerragruntData): TerragruntData {
    const configData = data.spec.configuration
    const envVars = get(configData, 'spec.environmentVariables') as StringNGVariable[]
    const isTargetRunTime = getMultiTypeFromValue(get(configData, 'spec.targets') as any) === MultiTypeInputType.RUNTIME
    const formData = {
      ...data,
      spec: {
        ...data.spec,
        configuration: {
          ...configData,
          spec: {
            ...configData?.spec,
            targets: !isTargetRunTime
              ? Array.isArray(get(configData, 'spec.targets'))
                ? (get(configData, 'spec.targets') as string[]).map((target: string) => ({
                    value: target,
                    id: uuid()
                  }))
                : [{ value: '', id: uuid() }]
              : get(configData, 'spec.targets'),
            environmentVariables: Array.isArray(envVars)
              ? envVars.map(variable => ({
                  key: variable.name,
                  value: variable.value,
                  id: uuid()
                }))
              : [{ key: '', value: '', id: uuid() }]
          }
        }
      }
    }

    return formData
  }
  /* istanbul ignore next */
  processFormData(data: any): TerragruntData {
    return onSubmitTerragruntData(data)
  }

  renderStep(props: StepProps<TerragruntData, unknown>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      onChange,
      allowableTypes,
      stepViewType,
      formikRef,
      inputSetData,
      customStepProps,
      isNewStep,
      path,
      readonly
    } = props
    if (this.isTemplatizedView(stepViewType)) {
      return (
        <TerragruntInputStep
          initialValues={initialValues}
          onUpdate={/* istanbul ignore next*/ data => onUpdate?.(this.processFormData(data))}
          onChange={/* istanbul ignore next*/ data => onChange?.(this.processFormData(data))}
          allowableTypes={allowableTypes}
          stepViewType={stepViewType}
          readonly={get(inputSetData, 'readonly')}
          inputSetData={inputSetData}
          path={path}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <TerragruntVariableStep
          {...(customStepProps as TerragruntVariableStepProps)}
          initialValues={initialValues}
          onUpdate={/* istanbul ignore next*/ data => onUpdate?.(this.processFormData(data))}
        />
      )
    }
    return (
      <TerragruntApplyWidgetWithRef
        initialValues={this.getInitialValues(initialValues)}
        onUpdate={data => onUpdate?.(this.processFormData(data))}
        onChange={(data: any) => onChange?.(this.processFormData(data))}
        allowableTypes={allowableTypes}
        isNewStep={isNewStep}
        stepViewType={stepViewType}
        stepType={StepType.TerragruntApply}
        ref={formikRef}
        readonly={readonly}
      />
    )
  }
}
