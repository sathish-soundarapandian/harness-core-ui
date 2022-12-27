/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { IconName, getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import { defaultTo, set } from 'lodash-es'
import * as Yup from 'yup'
import { FormikErrors, yupToFormErrors } from 'formik'
import { StepProps, StepViewType, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'

import type { StringsMap } from 'stringTypes'
import type { StepElementConfig, TasCanaryAppSetupStepInfo } from 'services/cd-ng'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { TasCanaryAppSetupWidgetWithRef } from './TasCanaryAppSetupWidget'
import {
  InstancesType,
  ResizeStrategyType,
  TASBasicAppSetupTemplate
} from '../TASBasicAppSetupStep/TASBasicAppSetupTypes'
import { checkEmptyOrLessThan } from '../PipelineStepsUtil'
import TasBasicAppSetupInputSet from '../TASBasicAppSetupStep/TasBasicAppSetupInputSet'
import pipelineVariablesCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export interface TasCanaryAppSetupData extends StepElementConfig {
  spec: TasCanaryAppSetupStepInfo
}

export interface TasCanaryAppSetupVariableStepProps {
  initialValues: TasCanaryAppSetupData
  stageIdentifier: string
  onUpdate?(data: TasCanaryAppSetupData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: TasCanaryAppSetupData
}

export class TasCanaryAppSetupStep extends PipelineStep<TasCanaryAppSetupData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected type = StepType.CanaryAppSetup
  protected stepName = 'Canary App Setup'
  protected stepIcon: IconName = 'tasCanarySetup'
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.TASCanaryAppSetup'
  protected isHarnessSpecific = false
  protected invocationMap: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  > = new Map()

  protected defaultValues: TasCanaryAppSetupData = {
    identifier: '',
    timeout: '10m',
    name: '',
    type: StepType.CanaryAppSetup,
    spec: {
      tasInstanceCountType: InstancesType.FromManifest,
      existingVersionToKeep: 3,
      resizeStrategy: ResizeStrategyType.DownScaleOldFirst
    }
  }

  processFormData(data: TasCanaryAppSetupData): TasCanaryAppSetupData {
    return data
  }

  renderStep(props: StepProps<TasCanaryAppSetupData>): JSX.Element {
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
        <TasBasicAppSetupInputSet<TasCanaryAppSetupStepInfo>
          initialValues={initialValues}
          onUpdate={data => onUpdate?.(this.processFormData(data))}
          stepViewType={stepViewType}
          readonly={!!inputSetData?.readonly}
          template={inputSetData?.template}
          path={inputSetData?.path || ''}
          allowableTypes={allowableTypes}
        />
      )
    }

    if (stepViewType === StepViewType.InputVariable) {
      const { variablesData, metadataMap } = customStepProps as TasCanaryAppSetupVariableStepProps
      return (
        <VariablesListTable
          className={pipelineVariablesCss.variablePaddingL3}
          data={variablesData}
          originalData={initialValues}
          metadataMap={metadataMap}
        />
      )
    }

    return (
      <TasCanaryAppSetupWidgetWithRef
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
  }: ValidateInputSetProps<TasCanaryAppSetupData>): FormikErrors<TasCanaryAppSetupData> {
    const errors: FormikErrors<TASBasicAppSetupTemplate<TasCanaryAppSetupStepInfo>> = {}
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
      getMultiTypeFromValue(template?.spec?.existingVersionToKeep) === MultiTypeInputType.RUNTIME &&
      isRequired &&
      checkEmptyOrLessThan(data?.spec?.existingVersionToKeep, 1)
    ) {
      set(
        errors,
        'spec.existingVersionToKeep',
        getString?.('cd.ElastigroupStep.valueCannotBeLessThan', {
          value: getString('cd.steps.tas.existingVersionToKeep'),
          value2: 1
        })
      )
    }

    // Additional Routes
    return errors
  }
}
