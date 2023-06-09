/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@harness/icons'
import { Color } from '@harness/design-system'
import type { FormikErrors } from 'formik'
import React from 'react'
import { defaultTo } from 'lodash-es'
import { StepViewType, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { PipelineStep, StepProps } from '@pipeline/components/PipelineSteps/PipelineStep'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { getFormValuesInCorrectFormat } from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import type { StringsMap } from 'stringTypes'
import { VariableListTableProps, VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { flatObject } from '@pipeline/components/PipelineSteps/Steps/Common/ApprovalCommons'
import { validateInputSet } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import {
  getInputSetViewValidateFieldsConfig,
  transformValuesFieldsConfig
} from '../SscaEnforcementStep/SscaEnforcementStepFunctionConfigs'
import { SscaEnforcementStepEditWithRef } from '../SscaEnforcementStep/SscaEnforcementStepEdit'
import type { SscaEnforcementStepData } from '../SscaEnforcementStep/SscaEnforcementStep'
import { commonDefaultEnforcementSpecValues } from '../utils'
import SscaEnforcementStepInputSet from '../SscaEnforcementStep/SscaEnforcementStepInputSet'

export class CdSscaEnforcementStep extends PipelineStep<SscaEnforcementStepData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this.invocationMap = new Map()
  }

  protected type = StepType.CdSscaEnforcement
  protected stepName = 'Ssca Enforcement'
  protected stepIcon: IconName = 'ssca-enforce'
  protected stepIconColor = Color.GREY_600
  protected stepDescription: keyof StringsMap = 'pipeline.stepDescription.SscaEnforcement'
  protected stepPaletteVisible = false
  protected defaultValues: SscaEnforcementStepData = {
    type: StepType.CdSscaEnforcement,
    identifier: '',
    spec: {
      ...commonDefaultEnforcementSpecValues,
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
    }
  }

  /* istanbul ignore next */
  processFormData<T>(data: T): SscaEnforcementStepData {
    return getFormValuesInCorrectFormat<T, SscaEnforcementStepData>(data, transformValuesFieldsConfig(this?.type))
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<SscaEnforcementStepData>): FormikErrors<SscaEnforcementStepData> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    if (getString) {
      return validateInputSet(
        data,
        template,
        getInputSetViewValidateFieldsConfig(this.type)(isRequired),
        { getString },
        viewType
      )
    }

    /* istanbul ignore next */
    return {}
  }

  renderStep(props: StepProps<SscaEnforcementStepData>): JSX.Element {
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
        <SscaEnforcementStepInputSet
          initialValues={initialValues}
          template={inputSetData?.template}
          path={inputSetData?.path || ''}
          readonly={!!inputSetData?.readonly}
          stepViewType={stepViewType}
          onUpdate={onUpdate}
          onChange={onChange}
          allowableTypes={allowableTypes}
          stepType={this.type}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <VariablesListTable
          data={flatObject(defaultTo(initialValues, {}))}
          originalData={initialValues}
          metadataMap={(customStepProps as Pick<VariableListTableProps, 'metadataMap'>)?.metadataMap}
        />
      )
    }

    return (
      <SscaEnforcementStepEditWithRef
        initialValues={initialValues}
        allowableTypes={allowableTypes}
        onChange={onChange}
        stepViewType={defaultTo(stepViewType, StepViewType.Edit)}
        onUpdate={onUpdate}
        readonly={readonly}
        isNewStep={isNewStep}
        ref={formikRef}
        stepType={this.type}
      />
    )
  }
}
