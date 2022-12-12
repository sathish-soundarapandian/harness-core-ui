/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { IconName, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { defaultTo, isEmpty, set } from 'lodash-es'
import * as Yup from 'yup'
import { FormikErrors, yupToFormErrors } from 'formik'
import { StepProps, StepViewType, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'

import type { StringsMap } from 'stringTypes'
import { checkEmptyOrNegative, ElastigroupSetupData, ElastigroupSetupTemplate } from './ElastigroupSetupTypes'
import { ElastigroupSetupWidgetWithRef } from './ElastigroupSetupWidget'
import { ElastigroupSetupVariablesView, ElastigroupSetupVariablesViewProps } from './ElastigroupSetupVariablesView'
import ElastigroupSetupInputSet from './ElastigroupSetupInputSet'

export class ElastigroupSetupStep extends PipelineStep<ElastigroupSetupData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  renderStep(props: StepProps<ElastigroupSetupData>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      onChange,
      allowableTypes,
      stepViewType,
      inputSetData,
      formikRef,
      customStepProps,
      isNewStep,
      readonly
    } = props

    if (this.isTemplatizedView(stepViewType)) {
      return (
        <ElastigroupSetupInputSet
          initialValues={initialValues}
          onUpdate={/* istanbul ignore next */ data => onUpdate?.(this.processFormData(data))}
          stepViewType={stepViewType}
          readonly={!!inputSetData?.readonly}
          template={inputSetData?.template}
          path={inputSetData?.path || ''}
          allowableTypes={allowableTypes}
        />
      )
    }

    if (stepViewType === StepViewType.InputVariable) {
      return (
        <ElastigroupSetupVariablesView
          {...(customStepProps as ElastigroupSetupVariablesViewProps)}
          originalData={initialValues}
        />
      )
    }

    return (
      <ElastigroupSetupWidgetWithRef
        initialValues={initialValues}
        onUpdate={data => onUpdate?.(this.processFormData(data))}
        onChange={data => onChange?.(this.processFormData(data))}
        allowableTypes={allowableTypes}
        stepViewType={stepViewType}
        isNewStep={defaultTo(isNewStep, true)}
        readonly={readonly}
        ref={formikRef}
      />
    )
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<ElastigroupSetupData>): FormikErrors<ElastigroupSetupData> {
    const errors: FormikErrors<ElastigroupSetupTemplate> = {}
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    /* istanbul ignore else */
    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      let timeoutSchema = getDurationValidationSchema({ minimum: '10s' })
      /* istanbul ignore else */
      if (isRequired) {
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
    /* istanbul ignore else */
    if (
      getMultiTypeFromValue(template?.spec?.name) === MultiTypeInputType.RUNTIME &&
      isRequired &&
      isEmpty(data?.spec?.name)
    ) {
      set(errors, 'spec.name', getString?.('fieldRequired', { field: getString('cd.ElastigroupStep.appName') }))
    }

    /* istanbul ignore else */
    if (
      getMultiTypeFromValue(template?.spec?.instances.spec.desired) === MultiTypeInputType.RUNTIME &&
      isRequired &&
      checkEmptyOrNegative(data?.spec?.instances.spec.desired)
    ) {
      set(
        errors,
        'spec.instances.spec.desired',
        getString?.('cd.ElastigroupStep.valueCannotBe', {
          value: getString('cd.ElastigroupStep.desiredInstances')
        })
      )
    }

    /* istanbul ignore else */
    if (
      getMultiTypeFromValue(template?.spec?.instances.spec.max) === MultiTypeInputType.RUNTIME &&
      isRequired &&
      checkEmptyOrNegative(data?.spec?.instances.spec.max)
    ) {
      set(
        errors,
        'spec.instances.spec.max',
        getString?.('cd.ElastigroupStep.valueCannotBe', {
          value: getString('cd.ElastigroupStep.maxInstances')
        })
      )
    }

    /* istanbul ignore else */
    if (
      getMultiTypeFromValue(template?.spec?.instances.spec.min) === MultiTypeInputType.RUNTIME &&
      isRequired &&
      checkEmptyOrNegative(data?.spec?.instances.spec.min)
    ) {
      set(
        errors,
        'spec.instances.spec.min',
        getString?.('cd.ElastigroupStep.valueCannotBe', {
          value: getString('cd.ElastigroupStep.minInstances')
        })
      )
    }

    return errors
  }

  protected type = StepType.ElastigroupSetup
  protected stepName = 'Elastigroup Setup'
  protected stepIcon: IconName = 'service-elastigroup' //todoels
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.ElastigroupSetup' //todoels
  protected referenceId = 'ElastigroupSetupHelpPanel' //todoels
  protected isHarnessSpecific = false
  protected invocationMap: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  > = new Map()

  protected defaultValues: ElastigroupSetupData = {
    identifier: '',
    timeout: '10m',
    name: '',
    type: StepType.ElastigroupSetup,
    spec: {
      name: '',
      instances: {
        type: 'Fixed',
        spec: {
          desired: 1,
          max: 1,
          min: 1
        }
      }
    }
  }

  processFormData(data: ElastigroupSetupData): ElastigroupSetupData {
    const modifiedData = {
      ...data,
      spec: {
        ...data.spec,
        instances: {
          type: data.spec.instances.type,
          spec:
            data.spec.instances.type === 'Fixed'
              ? {
                  ...data.spec.instances.spec
                }
              : {}
        }
      }
    }
    return modifiedData
  }
}
