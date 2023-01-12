/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { getMultiTypeFromValue, IconName, MultiTypeInputType } from '@harness/uicore'
import { FormikErrors, yupToFormErrors } from 'formik'
import * as Yup from 'yup'
import type { StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import type { StringsMap } from 'stringTypes'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/helper'
import { ContainerStepBaseWithRef } from './ContainerStepBase'
import ContainerStepInputSet from './ContainerStepInputSet'
import { processFormData } from './helper'
import type { ContainerStepData, ContainerStepVariableProps } from './types'
export class ContainerStep extends PipelineStep<ContainerStepData> {
  protected type = StepType.Container
  protected stepName = 'Configure Container Step'
  protected stepIcon: IconName = 'run-ci-step'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.Container'
  protected stepPaletteVisible = false
  protected stepIconSize = 34
  constructor() {
    super()
    this._hasStepVariables = true
  }
  protected defaultValues: ContainerStepData = {
    identifier: '',
    type: StepType.Container as string,
    spec: {
      connectorRef: '',
      image: '',
      command: '',
      shell: 'Sh',
      infrastructure: {
        type: 'KubernetesDirect',
        spec: {
          connectorRef: '',
          namespace: '',
          resources: {
            limits: {
              cpu: '0.5',
              memory: '500Mi'
            }
          }
        }
      }
    },
    name: ''
  }

  /* istanbul ignore next */
  processFormData(data: ContainerStepData): ContainerStepData {
    return processFormData(data)
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<ContainerStepData>): FormikErrors<ContainerStepData> {
    const errors = {} as any
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
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
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors, err)
        }
      }
    }
    return errors
  }

  renderStep(props: StepProps<ContainerStepData>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      stepViewType,
      inputSetData,
      formikRef,
      customStepProps,
      readonly,
      isNewStep,
      onChange,
      allowableTypes
    } = props
    if (this.isTemplatizedView(stepViewType)) {
      return (
        <ContainerStepInputSet
          initialValues={initialValues}
          onUpdate={values => onUpdate?.(this.processFormData(values))}
          onChange={values => onChange?.(this.processFormData(values))}
          allowableTypes={allowableTypes}
          stepViewType={stepViewType}
          readonly={inputSetData?.readonly}
          template={inputSetData?.template}
          path={inputSetData?.path}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      const { variablesData, metadataMap, originalData } = customStepProps as ContainerStepVariableProps
      return <VariablesListTable data={variablesData} originalData={originalData} metadataMap={metadataMap} />
    }

    return (
      <ContainerStepBaseWithRef
        initialValues={initialValues}
        allowableTypes={allowableTypes}
        onUpdate={values => onUpdate?.(this.processFormData(values))}
        onChange={values => onChange?.(this.processFormData(values))}
        stepViewType={stepViewType || StepViewType.Edit}
        readonly={readonly}
        isNewStep={isNewStep}
        ref={formikRef}
      />
    )
  }
}
