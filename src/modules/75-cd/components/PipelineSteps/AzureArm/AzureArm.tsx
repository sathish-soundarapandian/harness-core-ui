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
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { isValueRuntimeInput } from '@common/utils/utils'
import { AzureArmRef } from './AzureArmRef'
import { AzureArmVariableView } from './VariableView/AzureArmVariableView'
import AzureArmInputStep from './InputSteps/InputSteps'
import type { AzureArmData, AzureArmStepInfo, Subscription, ManagementGroup, ResourceGroup } from './AzureArm.types'
const AzureArmWithRef = forwardRef(AzureArmRef)

export class AzureArmStep extends PipelineStep<AzureArmStepInfo> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected type = StepType.CreateAzureARMResource
  protected stepIcon: IconName = 'arm'
  protected stepName = 'Create Azure ARM Resources'
  protected stepDescription: keyof StringsMap = 'cd.azureArm.description'

  protected defaultValues = {
    type: StepType.CreateAzureARMResource,
    name: '',
    identifier: '',
    timeout: '10m',
    spec: {
      provisionerIdentifier: '',
      configuration: {
        connectorRef: '',
        template: {},
        scope: {
          type: 'ResourceGroup',
          spec: {}
        }
      }
    }
  }
  /* istanbul ignore next */
  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<AzureArmData>): FormikErrors<AzureArmStepInfo> {
    const errors = {} as any
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm

    if (
      isValueRuntimeInput(template?.spec?.provisionerIdentifier as string) &&
      isRequired &&
      isEmpty(data?.spec?.provisionerIdentifier?.trim())
    ) {
      set(errors, 'spec.provisionerIdentifier', getString?.('common.validation.provisionerIdentifierIsRequired'))
    }

    if (
      isValueRuntimeInput(template?.spec?.configuration?.connectorRef as string) &&
      isRequired &&
      isEmpty(data?.spec?.configuration?.connectorRef)
    ) {
      set(errors, 'spec.configuration.connectorRef', getString?.('pipelineSteps.build.create.connectorRequiredError'))
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
      isValueRuntimeInput(template?.spec?.configuration?.template?.store?.spec?.paths as string) &&
      isRequired &&
      isEmpty(data?.spec?.configuration?.template?.store?.spec?.paths)
    ) {
      set(errors, 'spec.configuration.template.store.spec.paths', getString?.('pipeline.startupCommand.scriptFilePath'))
    }

    if (
      isValueRuntimeInput(template?.spec?.configuration?.parameters?.store?.spec?.connectorRef as string) &&
      isRequired &&
      isEmpty(data?.spec?.configuration?.parameters?.store?.spec?.connectorRef)
    ) {
      set(
        errors,
        'spec.configuration.parameters.store.spec.connectorRef',
        getString?.('pipelineSteps.build.create.connectorRequiredError')
      )
    }

    if (
      isValueRuntimeInput(template?.spec?.configuration?.parameters?.store?.spec?.branch as string) &&
      isRequired &&
      isEmpty(data?.spec?.configuration?.parameters?.store?.spec?.branch)
    ) {
      set(errors, 'spec.configuration.parameters.store.spec.branch', getString?.('validation.branchName'))
    }

    if (
      isValueRuntimeInput(template?.spec?.configuration?.parameters?.store?.spec?.repoName as string) &&
      isRequired &&
      isEmpty(data?.spec?.configuration?.parameters?.store?.spec?.repoName)
    ) {
      set(errors, 'spec.configuration.parameters.store.spec.repoName', getString?.('common.validation.repositoryName'))
    }

    if (
      isValueRuntimeInput(template?.spec?.configuration?.parameters?.store?.spec?.paths as string) &&
      isRequired &&
      isEmpty(data?.spec?.configuration?.parameters?.store?.spec?.paths)
    ) {
      set(
        errors,
        'spec.configuration.parameters.store.spec.paths',
        getString?.('pipeline.startupCommand.scriptFilePath')
      )
    }

    if (
      isValueRuntimeInput((template?.spec?.configuration?.scope?.spec as Subscription)?.subscription) &&
      isRequired &&
      isEmpty((data?.spec?.configuration?.scope?.spec as Subscription)?.subscription)
    ) {
      set(
        errors,
        'spec.configuration.scope.spec.subscription',
        getString?.('cd.azureArm.required', { name: getString?.('common.plans.subscription') })
      )
    }

    if (
      isValueRuntimeInput((template?.spec?.configuration?.scope?.spec as Subscription)?.location) &&
      isRequired &&
      isEmpty((data?.spec?.configuration?.scope?.spec as Subscription)?.location)
    ) {
      set(
        errors,
        'spec.configuration.scope.spec.location',
        getString?.('cd.azureArm.required', { name: getString?.('cd.azureArm.location') })
      )
    }

    if (
      isValueRuntimeInput((template?.spec?.configuration?.scope?.spec as ManagementGroup)?.managementGroupId) &&
      isRequired &&
      isEmpty((data?.spec?.configuration?.scope?.spec as ManagementGroup)?.managementGroupId)
    ) {
      set(
        errors,
        'spec.configuration.scope.spec.managementGroupId',
        getString?.('cd.azureArm.required', { name: getString?.('cd.azureArm.managementGroup') })
      )
    }

    if (
      isValueRuntimeInput((template?.spec?.configuration?.scope?.spec as ResourceGroup)?.resourceGroup) &&
      isRequired &&
      isEmpty((data?.spec?.configuration?.scope?.spec as ResourceGroup)?.resourceGroup)
    ) {
      set(
        errors,
        'spec.configuration.scope.spec.resourceGroup',
        getString?.('cd.azureArm.required', { name: getString?.('common.resourceGroupLabel') })
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
  private getInitialValues(data: AzureArmData): AzureArmData {
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
  }: StepProps<AzureArmStepInfo>): JSX.Element {
    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <AzureArmInputStep
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
      return <AzureArmVariableView {...(customStepProps as any)} initialValues={initialValues} />
    }

    return (
      <AzureArmWithRef
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
