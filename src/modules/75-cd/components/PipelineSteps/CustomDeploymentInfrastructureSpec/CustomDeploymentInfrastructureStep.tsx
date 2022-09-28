/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { IconName } from '@wings-software/uicore'
import * as Yup from 'yup'
import { FormikErrors, yupToFormErrors } from 'formik'

import { isEmpty } from 'lodash-es'
import { StepViewType, StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'

import type {
  CustomDeploymentInfrastructureSpecEditableProps,
  CustomDeploymentInfrastructureStep
} from './CustomDeploymentInfrastructureInterface'
import { CustomDeploymentInfrastructureSpecEditable } from './CustomDeploymentInfrastructureSpecEditable'
import { CustomDeploymentInfrastructureSpecInputForm } from './CustomDeploymentInfrastructureSpecInputForm'
import { variableSchema } from '../ShellScriptStep/shellScriptTypes'

const CustomDeploymentInfrastructureSpecVariablesForm: React.FC<CustomDeploymentInfrastructureSpecEditableProps> = ({
  metadataMap,
  variablesData,
  initialValues
}) => {
  const infraVariables = variablesData?.infrastructureDefinition?.spec
  return infraVariables ? (
    /* istanbul ignore next */ <VariablesListTable
      data={infraVariables}
      originalData={initialValues?.infrastructureDefinition?.spec || initialValues}
      metadataMap={metadataMap}
    />
  ) : null
}

interface CustomDeploymentInfrastructureSpecStep extends CustomDeploymentInfrastructureStep {
  name?: string
  identifier?: string
}

export class CustomDeploymentInfrastructureSpec extends PipelineStep<CustomDeploymentInfrastructureSpecStep> {
  lastFetched: number
  protected type = StepType.CustomDeployment
  protected defaultValues: CustomDeploymentInfrastructureStep = {
    variables: []
  }

  protected stepIcon: IconName = 'template-library'
  protected stepName = 'Specify your Custom Deployment Type'
  protected stepPaletteVisible = false
  protected invocationMap: Map<
    RegExp,
    (path: string, yaml: string, params: Record<string, unknown>) => Promise<CompletionItemInterface[]>
  > = new Map()

  constructor() {
    super()
    this.lastFetched = new Date().getTime()
    this._hasStepVariables = true
  }

  validateInputSet({
    data,
    getString,
    viewType
  }: ValidateInputSetProps<CustomDeploymentInfrastructureStep>): FormikErrors<CustomDeploymentInfrastructureStep> {
    const errors: Partial<CustomDeploymentInfrastructureStep> = {}
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm

    if (!isEmpty(data) && isRequired && getString) {
      const variables = Yup.object().shape({
        variables: variableSchema(getString)
      })

      try {
        variables.validateSync(data, { abortEarly: false })
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors, err)
        }
      }
    }
    return errors as any
  }
  renderStep(props: StepProps<CustomDeploymentInfrastructureStep>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, customStepProps, readonly, allowableTypes, factory } =
      props
    if (this.isTemplatizedView(stepViewType)) {
      return (
        <CustomDeploymentInfrastructureSpecInputForm
          {...(customStepProps as CustomDeploymentInfrastructureSpecEditableProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          readonly={inputSetData?.readonly}
          template={inputSetData?.template}
          allValues={inputSetData?.allValues}
          path={inputSetData?.path || ''}
          allowableTypes={allowableTypes}
          factory={factory}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <CustomDeploymentInfrastructureSpecVariablesForm
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          template={inputSetData?.template}
          {...(customStepProps as CustomDeploymentInfrastructureSpecEditableProps)}
          initialValues={initialValues}
        />
      )
    }

    return (
      <CustomDeploymentInfrastructureSpecEditable
        onUpdate={onUpdate}
        readonly={readonly}
        factory={factory}
        stepViewType={stepViewType}
        {...(customStepProps as CustomDeploymentInfrastructureSpecEditableProps)}
        initialValues={initialValues}
        allowableTypes={allowableTypes}
      />
    )
  }
}
