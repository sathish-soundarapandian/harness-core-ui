/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { isEmpty, set } from 'lodash-es'
import type { FormikErrors } from 'formik'
import { getMultiTypeFromValue, IconName, MultiTypeInputType } from '@harness/uicore'

import type { K8sDirectInfra, StepGroupElementConfig } from 'services/cd-ng'
import { InputSetData, StepProps, StepViewType, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { StepGroupStepEditRef } from './StepGroupStepEdit'
import { StepGroupStepInputSetMode } from './StepGroupStepInputSetMode'
import { getModifiedFormikValues, K8sDirectInfraStepGroupElementConfig, StepGroupFormikValues } from './StepGroupUtil'

export class StepGroupStep extends PipelineStep<StepGroupElementConfig> {
  protected type = StepType.StepGroup
  protected stepName = 'Step Group'
  protected stepIcon: IconName = 'step-group'
  protected stepPaletteVisible = false

  protected defaultValues: StepGroupElementConfig = {
    identifier: '',
    name: '',
    steps: []
  }

  constructor() {
    super()
    this._hasDelegateSelectionVisible = true
  }

  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<StepGroupElementConfig>): FormikErrors<StepGroupElementConfig> {
    const isRequired = viewType === StepViewType.DeploymentForm || viewType === StepViewType.TriggerForm
    const errors: FormikErrors<StepGroupElementConfig> = {}
    const stepGroupInfraTemplate = template?.stepGroupInfra as K8sDirectInfra
    const stepGroupInfraData = data?.stepGroupInfra as K8sDirectInfra
    if (
      isRequired &&
      getMultiTypeFromValue((stepGroupInfraTemplate as K8sDirectInfra)?.spec.connectorRef) ===
        MultiTypeInputType.RUNTIME &&
      isEmpty(stepGroupInfraData?.spec?.connectorRef)
    ) {
      set(
        errors,
        'stepGroupInfra.spec.connectorRef',
        getString?.('common.validation.fieldIsRequired', { name: getString?.('connectors.title.k8sCluster') })
      )
    }

    if (
      isRequired &&
      getMultiTypeFromValue(stepGroupInfraTemplate?.spec?.namespace) === MultiTypeInputType.RUNTIME &&
      isEmpty(stepGroupInfraData?.spec?.namespace)
    ) {
      set(
        errors,
        'stepGroupInfra.spec.namespace',
        getString?.('common.validation.fieldIsRequired', { name: getString?.('common.namespace') })
      )
    }

    if (isEmpty(errors.stepGroupInfra)) {
      delete errors.stepGroupInfra
    }

    return errors
  }

  renderStep(props: StepProps<StepGroupElementConfig>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, formikRef, isNewStep, readonly, allowableTypes, inputSetData } =
      props

    if (this.isTemplatizedView(stepViewType)) {
      return (
        <StepGroupStepInputSetMode
          allowableTypes={allowableTypes}
          inputSetData={inputSetData as InputSetData<K8sDirectInfraStepGroupElementConfig>}
        />
      )
    }

    return (
      <StepGroupStepEditRef
        initialValues={initialValues as K8sDirectInfraStepGroupElementConfig}
        onUpdate={(formData: StepGroupFormikValues) => onUpdate?.(this.processFormData(formData))}
        isNewStep={isNewStep}
        stepViewType={stepViewType}
        ref={formikRef}
        readonly={readonly}
        allowableTypes={allowableTypes}
      />
    )
  }

  processFormData(formData: any): StepGroupElementConfig {
    return getModifiedFormikValues(
      formData as StepGroupFormikValues,
      (formData as StepGroupFormikValues)?.type === 'KubernetesDirect'
    )
  }
}
