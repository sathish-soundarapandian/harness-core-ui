/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { IconName, AllowedTypes } from '@harness/uicore'
import type { FormikErrors } from 'formik'
import { defaultTo, isEmpty } from 'lodash-es'
import { StepViewType, StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import type { AsgBlueGreenSwapServiceStepInfo, StepElementConfig } from 'services/cd-ng'

import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import type { StringsMap } from 'stringTypes'
import { AsgSwapServiceInputStep } from './AsgSwapServiceInputSet'
import { AsgSwapServiceWidget } from './AsgSwapServiceEditWidget'
import { validateGenericFields } from '../Common/GenericExecutionStep/utils'
import pipelineVariablesCss from '@pipeline/components/PipelineStudio/PipelineVariables/PipelineVariables.module.scss'

export interface AsgSwapServiceData extends StepElementConfig {
  spec: AsgBlueGreenSwapServiceStepInfo
  identifier: string
}

export interface AsgSwapServiceVariableStepProps {
  initialValues: AsgSwapServiceData
  onUpdate?(data: AsgSwapServiceData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: AsgSwapServiceData
}

export interface AsgSwapServiceProps {
  initialValues: AsgSwapServiceData
  onUpdate?: (data: AsgSwapServiceData) => void
  onChange?: (data: AsgSwapServiceData) => void
  allowableTypes: AllowedTypes
  stepViewType?: StepViewType
  isNewStep?: boolean
  template?: AsgSwapServiceData
  readonly?: boolean
  path?: string
}

const AsgSwapServiceVariableStep: React.FC<AsgSwapServiceVariableStepProps> = ({
  variablesData,
  metadataMap,
  initialValues
}) => {
  return (
    <VariablesListTable
      data={variablesData.spec}
      originalData={initialValues.spec}
      metadataMap={metadataMap}
      className={pipelineVariablesCss.variablePaddingL3}
    />
  )
}

const AsgSwapServiceWidgetWithRef = React.forwardRef(AsgSwapServiceWidget)
export class AsgSwapService extends PipelineStep<AsgSwapServiceData> {
  protected type = StepType.AsgBlueGreenSwapService
  protected stepName = 'Asg Swap Service'
  protected referenceId = 'asgSwapService'
  protected stepIcon: IconName = 'asg-swap'
  protected stepDescription: keyof StringsMap = 'cd.asgBlueGreenSwapServiceStepDescription'
  protected isHarnessSpecific = false
  protected defaultValues: AsgSwapServiceData = {
    identifier: '',
    timeout: '10m',
    name: '',
    type: StepType.AsgBlueGreenSwapService,
    spec: {
      downsizeOldAsg: false
    }
  }

  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }
  renderStep(props: StepProps<AsgSwapServiceData>): JSX.Element {
    const {
      initialValues,
      onUpdate,
      stepViewType,
      inputSetData,
      formikRef,
      customStepProps,
      isNewStep,
      readonly,
      allowableTypes,
      onChange
    } = props
    if (this.isTemplatizedView(stepViewType)) {
      return (
        <AsgSwapServiceInputStep
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          template={inputSetData?.template}
          readonly={inputSetData?.readonly}
          path={inputSetData?.path}
          allowableTypes={allowableTypes}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <AsgSwapServiceVariableStep
          {...(customStepProps as AsgSwapServiceVariableStepProps)}
          initialValues={initialValues}
          onUpdate={onUpdate}
        />
      )
    }
    return (
      <AsgSwapServiceWidgetWithRef
        initialValues={initialValues}
        onUpdate={onUpdate}
        isNewStep={isNewStep}
        stepViewType={defaultTo(stepViewType, StepViewType.Edit)}
        allowableTypes={allowableTypes}
        onChange={onChange}
        ref={formikRef}
        readonly={readonly}
      />
    )
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<AsgSwapServiceData>): FormikErrors<AsgSwapServiceData> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors = validateGenericFields({
      data,
      template,
      getString,
      viewType
    }) as any
    /* istanbul ignore next  */
    if (isEmpty(errors.spec)) {
      delete errors.spec
    }

    return errors
  }
}
