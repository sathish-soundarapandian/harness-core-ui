/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { forwardRef } from 'react'
import * as Yup from 'yup'
import { isEmpty } from 'lodash-es'
import type { IconName } from '@harness/uicore'
import { yupToFormErrors, FormikErrors } from 'formik'
import { StepViewType, StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { StringsMap } from 'stringTypes'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { getDurationValidationSchema } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { AzureBluePrintRef } from './AzureBluePrintRef'
import { AzureBluePrintVariableView } from './VariableView/VariableView'
import AzureBluePrintInputStep from './InputSteps/InputSteps'
import { AzureBluePrintStepInfo, AzureBluePrintData, ScopeTypes, isRuntime } from './AzureBluePrint.types'
const AzureBluePrintWithRef = forwardRef(AzureBluePrintRef)

export class AzureBluePrintStep extends PipelineStep<AzureBluePrintStepInfo> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }

  protected type = StepType.AzureBluePrint
  protected stepIcon: IconName = 'microsoft-azure'
  protected stepName = 'Azure ARM'
  protected stepDescription: keyof StringsMap = 'cd.azureBluePrint.description'
  protected stepIconSize = 32

  protected defaultValues = {
    type: StepType.AzureBluePrint,
    name: '',
    identifier: '',
    timeout: '10m',
    spec: {
      provisionerIdentifier: '',
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
  }: ValidateInputSetProps<AzureBluePrintData>): FormikErrors<AzureBluePrintStepInfo> {
    const errors = {} as any
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm

    if (
      isRuntime(template?.spec?.provisionerIdentifier) &&
      isRequired &&
      isEmpty(data?.spec?.provisionerIdentifier?.trim())
    ) {
      errors.spec = {
        ...errors.spec,
        provisionerIdentifier: getString?.('common.validation.provisionerIdentifierIsRequired')
      }
    }

    if (
      isRuntime(template?.spec?.configuration?.connectorRef) &&
      isRequired &&
      isEmpty(data?.spec?.configuration?.connectorRef)
    ) {
      errors.spec = {
        ...errors.spec,
        configuration: {
          ...errors.spec?.configuration,
          connectorRef: getString?.('pipelineSteps.build.create.connectorRequiredError')
        }
      }
    }

    if (
      isRuntime(template?.spec?.configuration?.template?.store?.spec?.connectorRef) &&
      isRequired &&
      isEmpty(data?.spec?.configuration?.template?.store?.spec?.connectorRef)
    ) {
      errors.spec = {
        ...errors.spec,
        configuration: {
          ...errors.spec?.configuration,
          template: {
            ...errors.spec?.configuration?.template,
            store: {
              ...errors.spec?.configuration?.template?.store,
              spec: {
                ...errors.spec?.configuration?.template?.store?.spec,
                connectorRef: getString?.('pipelineSteps.build.create.connectorRequiredError')
              }
            }
          }
        }
      }
    }

    if (
      isRuntime(template?.spec?.configuration?.template?.store?.spec?.branch) &&
      isRequired &&
      isEmpty(data?.spec?.configuration?.template?.store?.spec?.branch)
    ) {
      errors.spec = {
        ...errors.spec,
        configuration: {
          ...errors.spec?.configuration,
          template: {
            ...errors.spec?.configuration?.template,
            store: {
              ...errors.spec?.configuration?.template?.store,
              spec: {
                ...errors.spec?.configuration?.template?.store?.spec,
                branch: getString?.('validation.branchName')
              }
            }
          }
        }
      }
    }

    if (
      isRuntime(template?.spec?.configuration?.template?.store?.spec?.repoName) &&
      isRequired &&
      isEmpty(data?.spec?.configuration?.template?.store?.spec?.repoName)
    ) {
      errors.spec = {
        ...errors.spec,
        configuration: {
          ...errors.spec?.configuration,
          template: {
            ...errors.spec?.configuration?.template,
            store: {
              ...errors.spec?.configuration?.template?.store,
              spec: {
                ...errors.spec?.configuration?.template?.store?.spec,
                repoName: getString?.('common.validation.repositoryName')
              }
            }
          }
        }
      }
    }

    if (
      isRuntime(template?.spec?.configuration?.template?.store?.spec?.paths) &&
      isRequired &&
      isEmpty(data?.spec?.configuration?.template?.store?.spec?.paths)
    ) {
      errors.spec = {
        ...errors.spec,
        configuration: {
          ...errors.spec?.configuration,
          template: {
            ...errors.spec?.configuration?.template,
            store: {
              ...errors.spec?.configuration?.template?.store,
              spec: {
                ...errors.spec?.configuration?.template?.store?.spec,
                paths: getString?.('pipeline.startupCommand.scriptFilePath')
              }
            }
          }
        }
      }
    }

    if (isRuntime(template?.timeout) && isRequired) {
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
  private getInitialValues(data: AzureBluePrintData): AzureBluePrintData {
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
  }: StepProps<AzureBluePrintStepInfo>): JSX.Element {
    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <AzureBluePrintInputStep
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
      return <AzureBluePrintVariableView {...(customStepProps as any)} initialValues={initialValues} />
    }

    return (
      <AzureBluePrintWithRef
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
