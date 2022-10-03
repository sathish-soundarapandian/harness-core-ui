/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { CustomDeploymentInfrastructureSpec } from '../CustomDeploymentInfrastructureStep'
import type { CustomDeploymentInfrastructureStep } from '../CustomDeploymentInfrastructureInterface'

const getInitialValues = (): CustomDeploymentInfrastructureStep => ({
  customDeploymentRef: {
    templateRef: 'reconcile',
    versionLabel: '1'
  },
  variables: [
    {
      name: 'string',
      type: 'String',
      description: '',
      value: 'string'
    },
    {
      name: 'numberVar',
      type: 'String',
      description: '',
      value: 'number'
    },
    {
      name: 'secret',
      type: 'Secret',
      description: '',
      value: '<+input>'
    },
    {
      name: 'connector',
      type: 'Connector',
      description: '',
      value: '<+input>'
    }
  ],
  allowSimultaneousDeployments: false
})

describe('Test Custom Deployment Infrastructure Spec snapshot', () => {
  beforeEach(() => {
    factory.registerStep(new CustomDeploymentInfrastructureSpec())
  })

  test('Should render edit view with empty initial values', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.CustomDeployment} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })

  test('Should render edit view with values and some runtime variable calues', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        type={StepType.CustomDeployment}
        stepViewType={StepViewType.Edit}
      />
    )

    expect(container).toMatchSnapshot()
  })

  test('Should render variable view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={getInitialValues()}
        template={getInitialValues()}
        allValues={getInitialValues()}
        type={StepType.CustomDeployment}
        stepViewType={StepViewType.InputVariable}
      />
    )

    expect(container).toMatchSnapshot()
  })
})
