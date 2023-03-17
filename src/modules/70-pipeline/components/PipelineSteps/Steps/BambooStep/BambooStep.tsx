/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { IconName, SelectOption, getMultiTypeFromValue, MultiTypeInputType, AllowedTypes } from '@harness/uicore'
import * as Yup from 'yup'
import { connect, FormikErrors, FormikProps, yupToFormErrors } from 'formik'
import { isArray, isEmpty } from 'lodash-es'
import type { StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import type { StringsMap } from 'stringTypes'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { BambooStepBaseWithRef } from './BambooStepBase'
import BambooStepInputStep from './BambooStepInputSet'
import { BambooStepVariables, BambooStepVariablesProps } from './BambooStepVariables'
import type { BambooStepData } from './types'
import { variableSchema } from './helper'

const BambooStepInputSet = connect(BambooStepInputStep)

export interface BambooStepProps {
  initialValues: BambooStepData
  template?: BambooStepData
  path?: string
  readonly?: boolean
  isNewStep?: boolean
  stepViewType: StepViewType
  onUpdate?: (data: BambooStepData) => void
  onChange?: (data: BambooStepData) => void
  allowableTypes: AllowedTypes
  formik?: FormikProps<BambooStepData>
}

export class BambooStep extends PipelineStep<BambooStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
    this.invocationMap = new Map()
  }

  protected type = StepType.BambooBuild
  protected stepName = 'Bamboo'
  protected stepIcon: IconName = 'service-bamboo'
  // to be edited in strings.en.yaml file in future
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.Bamboo'
  protected stepPaletteVisible = false

  protected defaultValues: BambooStepData = {
    identifier: '',
    type: StepType.BambooBuild as string,
    spec: {
      connectorRef: '',
      planName: '',
      planParameter: [],
      delegateSelectors: [],
      unstableStatusAsSuccess: false,
      useConnectorUrlForJobExecution: false
    }
  }

  /* istanbul ignore next */
  processFormData(data: BambooStepData): BambooStepData {
    return {
      ...data,
      spec: {
        ...data.spec,
        connectorRef:
          getMultiTypeFromValue(data.spec.connectorRef as SelectOption) === MultiTypeInputType.FIXED
            ? (data.spec.connectorRef as SelectOption)?.value?.toString()
            : data.spec.connectorRef,
        planName:
          ((data.spec.planName as unknown as SelectOption).label as string) || (data.spec.planName as unknown as string)
      }
    }
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<BambooStepData>): FormikErrors<BambooStepData> {
    const errors: FormikErrors<BambooStepData> = {}
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
      typeof template?.spec?.planName === 'string' &&
      getMultiTypeFromValue(template?.spec?.planName) === MultiTypeInputType.RUNTIME &&
      isRequired &&
      isEmpty(data?.spec?.planName)
    ) {
      errors.spec = {
        planName: getString?.('pipeline.bambooStep.validations.planName')
      }
    }

    /* istanbul ignore else */
    if (isArray(template?.spec?.planParameter) && getString) {
      try {
        const schema = Yup.object().shape({
          spec: Yup.object().shape({
            planParameter: variableSchema(getString)
          })
        })
        schema.validateSync(data)
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

  renderStep(props: StepProps<BambooStepData>): JSX.Element {
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
        <BambooStepInputSet
          initialValues={initialValues}
          template={inputSetData?.template || null}
          path={inputSetData?.path || ''}
          inputSetData={inputSetData}
          readonly={!!inputSetData?.readonly}
          stepViewType={stepViewType}
          onUpdate={(values: BambooStepData) => onUpdate?.(this.processFormData(values))}
          onChange={(values: BambooStepData) => onChange?.(this.processFormData(values))}
          allowableTypes={allowableTypes}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <BambooStepVariables
          {...(customStepProps as BambooStepVariablesProps)}
          initialValues={initialValues}
          onUpdate={(values: BambooStepData) => onUpdate?.(this.processFormData(values))}
        />
      )
    }

    return (
      <BambooStepBaseWithRef
        initialValues={initialValues}
        allowableTypes={allowableTypes}
        onChange={(values: BambooStepData) => onChange?.(this.processFormData(values))}
        stepViewType={stepViewType || StepViewType.Edit}
        onUpdate={(values: BambooStepData) => onUpdate?.(this.processFormData(values))}
        ref={formikRef}
        isNewStep={isNewStep}
        readonly={readonly}
      />
    )
  }
}
