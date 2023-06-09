/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { IconName, getMultiTypeFromValue, MultiTypeInputType, AllowedTypes } from '@harness/uicore'
import * as Yup from 'yup'
import { connect, FormikErrors, yupToFormErrors } from 'formik'
import { isEmpty } from 'lodash-es'
import type { StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import type {
  MultiTypeMapUIType,
  MultiTypeListUIType,
  MultiTypeConnectorRef
} from '@pipeline/components/PipelineSteps/Steps/StepsTypes'
import type { StringsMap } from 'stringTypes'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { JenkinsStepBaseWithRef } from './JenkinsStepBase'
import JenkinsStepInputSetBasic from './JenkinsStepInputSet'
import { JenkinsStepVariables, JenkinsStepVariablesProps } from './JenkinsStepVariables'
import type { JenkinsStepSpec, JenkinsStepData } from './types'

const JenkinsStepInputSet = connect(JenkinsStepInputSetBasic)
export interface JenkinsStepSpecUI
  extends Omit<JenkinsStepSpec, 'connectorRef' | 'tags' | 'labels' | 'buildArgs' | 'pull' | 'resources'> {
  connectorRef: MultiTypeConnectorRef
  tags: MultiTypeListUIType
  labels?: MultiTypeMapUIType
  buildArgs?: MultiTypeMapUIType
}

// Interface for the form
export interface JenkinsStepDataUI extends Omit<JenkinsStepData, 'spec'> {
  spec: JenkinsStepSpecUI
}

export interface JenkinsStepProps {
  initialValues: JenkinsStepData
  template?: JenkinsStepData
  path?: string
  readonly?: boolean
  isNewStep?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: JenkinsStepData) => void
  onChange?: (data: JenkinsStepData) => void
  allowableTypes: AllowedTypes
  formik?: any
}

export class JenkinsStep extends PipelineStep<JenkinsStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
    this.invocationMap = new Map()
  }

  protected type = StepType.JenkinsBuild
  protected stepName = 'Jenkins'
  protected stepIcon: IconName = 'service-jenkins'
  // to be edited in strings.en.yaml file in future
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.Jenkins'
  protected stepPaletteVisible = false

  protected defaultValues: JenkinsStepData = {
    identifier: '',
    type: StepType.JenkinsBuild as string,
    spec: {
      connectorRef: '',
      jobName: '',
      jobParameter: [],
      unstableStatusAsSuccess: false,
      useConnectorUrlForJobExecution: false
    }
  }

  /* istanbul ignore next */
  processFormData(data: JenkinsStepData): JenkinsStepData {
    const { identifier, name, type, timeout, failureStrategies, spec } = data
    const {
      connectorRef,
      jobName,
      childJobName,
      jobParameter,
      delegateSelectors,
      unstableStatusAsSuccess,
      useConnectorUrlForJobExecution
    } = spec

    const processedData = {
      identifier,
      name,
      type,
      timeout,
      failureStrategies,
      spec: {
        connectorRef,
        jobName: childJobName
          ? typeof childJobName === 'string'
            ? childJobName
            : childJobName.label
          : typeof jobName === 'string'
          ? jobName
          : jobName.label,
        jobParameter,
        delegateSelectors,
        unstableStatusAsSuccess,
        useConnectorUrlForJobExecution
      }
    } as JenkinsStepData

    return processedData
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<JenkinsStepData>): FormikErrors<JenkinsStepData> {
    const errors: FormikErrors<JenkinsStepData> = {}
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
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

    if (
      typeof template?.spec?.connectorRef === 'string' &&
      getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME &&
      isRequired &&
      isEmpty(data?.spec?.connectorRef)
    ) {
      errors.spec = {
        connectorRef: getString?.('common.validation.connectorRef')
      }
    }

    if (
      typeof template?.spec?.jobName === 'string' &&
      getMultiTypeFromValue(template?.spec?.jobName) === MultiTypeInputType.RUNTIME &&
      isRequired &&
      isEmpty(data?.spec?.jobName)
    ) {
      errors.spec = {
        jobName: getString?.('pipeline.jenkinsStep.validations.jobName')
      }
    }

    return errors
  }

  renderStep(props: StepProps<JenkinsStepData>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      stepViewType,
      inputSetData,
      formikRef,
      customStepProps,
      isNewStep,
      readonly,
      onChange,
      allowableTypes
    } = props

    if (this.isTemplatizedView(stepViewType)) {
      return (
        <JenkinsStepInputSet
          initialValues={initialValues}
          template={inputSetData?.template}
          path={inputSetData?.path || ''}
          inputSetData={inputSetData}
          readonly={!!inputSetData?.readonly}
          stepViewType={stepViewType}
          onUpdate={(values: JenkinsStepData) => onUpdate?.(this.processFormData(values))}
          onChange={(values: JenkinsStepData) => onChange?.(this.processFormData(values))}
          ref={formikRef}
          allowableTypes={allowableTypes}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <JenkinsStepVariables
          {...(customStepProps as JenkinsStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={(values: JenkinsStepData) => onUpdate?.(this.processFormData(values))}
        />
      )
    }

    return (
      <JenkinsStepBaseWithRef
        initialValues={initialValues}
        allowableTypes={allowableTypes}
        onChange={(values: JenkinsStepData) => onChange?.(this.processFormData(values))}
        stepViewType={stepViewType || StepViewType.Edit}
        onUpdate={(values: JenkinsStepData) => onUpdate?.(this.processFormData(values))}
        ref={formikRef}
        isNewStep={isNewStep}
        readonly={readonly}
      />
    )
  }
}
