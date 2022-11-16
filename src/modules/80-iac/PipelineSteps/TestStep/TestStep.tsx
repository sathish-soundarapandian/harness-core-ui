/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Suspense, forwardRef } from 'react'
import { connect } from 'formik'
import type { IconName } from '@harness/icons'
import { StepViewType, StepProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { StringsMap } from 'stringTypes'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { IacStepUtils, StepVariableView, TestInputStep } from '@iac/RouteDestinations'
import { TestComponent } from '.'

export class TestStep extends PipelineStep<any> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
    this.setValidate()
  }

  TestStepRef = forwardRef(TestComponent)
  TestStepConnect = connect(TestInputStep)

  protected type = StepType.CreateAzureARMResource
  protected stepIcon: IconName = 'lab-test'
  protected stepName = 'test'
  protected stepDescription: keyof StringsMap = 'cd.azureArm.description'

  validateFunc: (args: unknown) => void = () => void 0

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

  async setValidate(): Promise<void> {
    const { validateInputSet } = (await IacStepUtils) as unknown as { validateInputSet: (args: unknown) => void }
    this.validateFunc = validateInputSet
  }

  validateInputSet({ data, template, viewType }: any): any {
    return this.validateFunc({ data, template, viewType })
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
    path,
    inputSetData,
    customStepProps
  }: StepProps<any>): JSX.Element {
    const { TestStepConnect, TestStepRef } = this
    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <Suspense fallback={<div>Loading ... </div>}>
          <TestStepConnect
            initialValues={initialValues}
            allowableTypes={allowableTypes}
            allValues={inputSetData?.allValues}
            stepViewType={stepViewType}
            readonly={inputSetData?.readonly}
            inputSetData={inputSetData}
            path={path}
          />
        </Suspense>
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <Suspense fallback={<div>Loading ... </div>}>
          <StepVariableView {...(customStepProps as any)} initialValues={initialValues} />
        </Suspense>
      )
    }
    return (
      <Suspense fallback={<div>Loading ... </div>}>
        <TestStepRef
          initialValues={initialValues}
          onUpdate={onUpdate}
          onChange={onChange}
          allowableTypes={allowableTypes}
          isNewStep={isNewStep}
          ref={formikRef}
          readonly={readonly}
          stepViewType={stepViewType}
        />
      </Suspense>
    )
  }
}
