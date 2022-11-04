/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { IconName } from '@harness/icons'
import { FormikErrors, yupToFormErrors } from 'formik'
import { getMultiTypeFromValue, MultiTypeInputType } from '@harness/uicore'
import * as Yup from 'yup'
import { get, has, isEmpty } from 'lodash-es'
import { StepViewType, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { PipelineStep, StepProps } from '@pipeline/components/PipelineSteps/PipelineStep'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { ElastigroupDeployStepInfo } from 'services/cd-ng'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/helper'
import { getInstanceDropdownSchema } from '@common/components/InstanceDropdownField/InstanceDropdownField'
import { InstanceTypes } from '@common/constants/InstanceTypes'
import { ElastigroupDeployStepEditRef } from './ElastigroupDeployStepEdit'
import { ElastigroupDeployInputStep } from './ElastigroupDeployInputStep'
import type { ElastigroupDeployVariableStepProps } from './ElastigroupDeployInterface'

export class ElastigroupDeploy extends PipelineStep<
  ElastigroupDeployStepInfo & { name?: string; identifier?: string }
> {
  protected type = StepType.ElastigroupDeploy
  protected stepIcon: IconName = 'service-elastigroup'
  protected stepName = 'Elastigroup Deploy'
  protected defaultValues: ElastigroupDeployStepInfo = {
    type: StepType.ElastigroupDeploy,
    name: '',
    identifier: '',
    timeout: '10m',
    spec: {
      newService: {
        spec: {
          count: 1
        },
        type: 'Count'
      },
      oldService: {
        spec: {
          count: 0
        },
        type: 'Count'
      }
    }
  }

  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<ElastigroupDeployStepInfo>): FormikErrors<ElastigroupDeployStepInfo> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors = { spec: {} } as any
    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      let timeoutSchema = getDurationValidationSchema({ minimum: '10s' })
      if (isRequired) {
        timeoutSchema = timeoutSchema.required(getString?.('validation.timeout10SecMinimum'))
      }
      const timeout = Yup.object().shape({
        timeout: timeoutSchema
      })

      try {
        timeout.validateSync(data.spec)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors, err)
        }
      }
    }

    if (
      getMultiTypeFromValue(template?.spec?.newService?.spec?.count) === MultiTypeInputType.RUNTIME ||
      getMultiTypeFromValue(template?.spec?.newService?.spec?.percentage) === MultiTypeInputType.RUNTIME
    ) {
      const newService = Yup.object().shape({
        newService: getInstanceDropdownSchema(
          {
            required: true,
            requiredErrorMessage: getString?.('fieldRequired', { field: 'New service instances' })
          },
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          getString!
        )
      })

      try {
        newService.validateSync(data?.spec)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors.spec, err)
        }
      }
    }

    if (
      getMultiTypeFromValue(template?.spec?.oldService?.spec?.count) === MultiTypeInputType.RUNTIME ||
      getMultiTypeFromValue(template?.spec?.oldService?.spec?.percentage) === MultiTypeInputType.RUNTIME
    ) {
      const oldService = Yup.object().shape({
        oldService: getInstanceDropdownSchema(
          {
            required: true,
            requiredErrorMessage: getString?.('fieldRequired', { field: 'Old service instances' })
          },
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          getString!
        )
      })

      try {
        oldService.validateSync(data?.spec)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors.spec, err)
        }
      }
    }
    /* istanbul ignore else */
    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    return errors
  }

  processFormData(values: ElastigroupDeployStepInfo): ElastigroupDeployStepInfo {
    if (
      get(values, 'spec.newService.type') === InstanceTypes.Instances &&
      has(values, 'spec.newService.spec.percentage')
    ) {
      delete values.spec.newService.spec.percentage
    }

    if (get(values, 'spec.newService.type') === InstanceTypes.Percentage && has(values, 'spec.newService.spec.count')) {
      delete values.spec.newService.spec.count
    }

    if (
      get(values, 'spec.oldService.type') === InstanceTypes.Instances &&
      has(values, 'spec.oldService.spec.percentage')
    ) {
      delete values.spec.oldService.spec.percentage
    }

    if (get(values, 'spec.oldService.type') === InstanceTypes.Percentage && has(values, 'spec.oldService.spec.count')) {
      delete values.spec.oldService.spec.count
    }

    return values
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
    inputSetData,
    path,
    customStepProps
  }: StepProps<ElastigroupDeployStepInfo>): JSX.Element {
    if (this.isTemplatizedView(stepViewType)) {
      return (
        <ElastigroupDeployInputStep
          initialValues={initialValues}
          onUpdate={onUpdate}
          allowableTypes={allowableTypes}
          stepViewType={stepViewType}
          template={inputSetData?.template}
          readonly={inputSetData?.readonly}
          path={path}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      const { variablesData, metadataMap } = customStepProps as ElastigroupDeployVariableStepProps
      return <VariablesListTable data={variablesData} originalData={initialValues} metadataMap={metadataMap} />
    }

    return (
      <ElastigroupDeployStepEditRef
        initialValues={initialValues}
        onUpdate={values => onUpdate?.(this.processFormData(values))}
        isNewStep={isNewStep}
        allowableTypes={allowableTypes}
        onChange={values => onChange?.(this.processFormData(values))}
        stepViewType={stepViewType}
        ref={formikRef}
        readonly={readonly}
        formikFormName={'ElastigroupDeployStepForm'}
      />
    )
  }
}
