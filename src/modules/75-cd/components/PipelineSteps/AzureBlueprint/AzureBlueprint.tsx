/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { forwardRef } from 'react'
import * as Yup from 'yup'
import { isEmpty, set } from 'lodash-es'
import type { IconName } from '@harness/uicore'
import { yupToFormErrors, FormikErrors } from 'formik'
import { StepViewType, StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { StringsMap } from 'stringTypes'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { isValueRuntimeInput } from '@common/utils/utils'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { AzureBlueprintRef } from './AzureBlueprintRef'
import { AzureBlueprintVariableView } from './VariableView/VariableView'
import AzureBlueprintInputStep from './InputSteps/InputSteps'
import { AzureBlueprintStepInfo, AzureBlueprintData, ScopeTypes } from './AzureBlueprintTypes.types'
const AzureBlueprintWithRef = forwardRef(AzureBlueprintRef)

export class AzureBlueprintStep extends PipelineStep<AzureBlueprintStepInfo> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected type = StepType.AzureBlueprint
  protected stepIcon: IconName = 'azure-blueprints'
  protected stepName = 'Create Azure BP Resources'
  protected stepDescription: keyof StringsMap = 'cd.azureBlueprint.description'

  protected defaultValues = {
    type: StepType.AzureBlueprint,
    name: '',
    identifier: '',
    timeout: '10m',
    spec: {
      configuration: {
        connectorRef: '',
        assignmentName: '',
        scope: ScopeTypes.Subscription,
        template: {}
      }
    }
  }
  /* istanbul ignore next */
  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<AzureBlueprintData>): FormikErrors<AzureBlueprintStepInfo> {
    const errors = {} as any
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm

    if (
      isValueRuntimeInput(template?.spec?.configuration?.connectorRef as string) &&
      isRequired &&
      isEmpty(data?.spec?.configuration?.connectorRef)
    ) {
      set(errors, 'spec.configuration.connectorRef', getString?.('pipelineSteps.build.create.connectorRequiredError'))
    }

    if (
      isValueRuntimeInput(template?.spec?.configuration?.assignmentName as string) &&
      isRequired &&
      isEmpty(data?.spec?.configuration?.assignmentName)
    ) {
      set(errors, 'spec.configuration.assignmentName', getString?.('cd.azureBlueprint.assignmentNameError'))
    }

    if (
      isValueRuntimeInput(template?.spec?.configuration?.template?.store?.spec?.connectorRef as string) &&
      isRequired &&
      isEmpty(data?.spec?.configuration?.template?.store?.spec?.connectorRef)
    ) {
      set(
        errors,
        'spec.configuration.template.store.spec.connectorRef',
        getString?.('pipelineSteps.build.create.connectorRequiredError')
      )
    }

    if (
      isValueRuntimeInput(template?.spec?.configuration?.template?.store?.spec?.branch as string) &&
      isRequired &&
      isEmpty(data?.spec?.configuration?.template?.store?.spec?.branch)
    ) {
      set(errors, 'spec.configuration.template.store.spec.branch', getString?.('validation.branchName'))
    }

    if (
      isValueRuntimeInput(template?.spec?.configuration?.template?.store?.spec?.repoName as string) &&
      isRequired &&
      isEmpty(data?.spec?.configuration?.template?.store?.spec?.repoName)
    ) {
      set(errors, 'spec.configuration.template.store.spec.repoName', getString?.('common.validation.repositoryName'))
    }

    if (
      isValueRuntimeInput(template?.spec?.configuration?.template?.store?.spec?.folderPath as string) &&
      isRequired &&
      isEmpty(data?.spec?.configuration?.template?.store?.spec?.folderPath)
    ) {
      set(
        errors,
        'spec.configuration.template.store.spec.folderPath',
        getString?.('cd.azureBlueprint.templateFolderPath')
      )
    }

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

  /* istanbul ignore next */
  private getInitialValues(data: AzureBlueprintData): AzureBlueprintData {
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
    inputSetData,
    path,
    customStepProps
  }: StepProps<AzureBlueprintStepInfo>): JSX.Element {
    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <AzureBlueprintInputStep
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
      return <AzureBlueprintVariableView {...(customStepProps as any)} initialValues={initialValues} />
    }

    return (
      <AzureBlueprintWithRef
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
