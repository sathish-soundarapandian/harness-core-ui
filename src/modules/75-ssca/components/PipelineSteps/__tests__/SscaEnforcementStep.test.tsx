/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, screen } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { StepViewType, StepFormikRef, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { SscaEnforcementStep, SscaEnforcementStepData } from '../SscaEnforcementStep/SscaEnforcementStep'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const runtimeValues = {
  identifier: 'Ssca_Enforcement_Step',
  name: 'Ssca Enforcement Step',
  timeout: RUNTIME_INPUT_VALUE,
  spec: {
    source: {
      type: 'image',
      spec: {
        connector: RUNTIME_INPUT_VALUE,
        image: RUNTIME_INPUT_VALUE
      }
    },
    verifyAttestation: {
      type: 'cosign',
      spec: {
        publicKey: RUNTIME_INPUT_VALUE
      }
    },
    policy: {
      store: {
        type: 'Harness',
        spec: {
          file: 'testFilePath'
        }
      }
    }
  }
}

const fixedValues = {
  identifier: 'Ssca_Enforcement_Step',
  name: 'Ssca Enforcement Step',
  timeout: '10s',
  spec: {
    source: {
      type: 'image',
      spec: {
        connector: 'connector',
        image: 'image'
      }
    },
    verifyAttestation: {
      type: 'cosign',
      spec: {
        publicKey: 'testKey'
      }
    },
    policy: {
      store: {
        type: 'Harness',
        spec: {
          file: 'testFilePath'
        }
      }
    }
  }
}

describe('Ssca Enforcement Step', () => {
  beforeAll(() => {
    factory.registerStep(new SscaEnforcementStep())
  })

  test('edit view as new step', () => {
    render(<TestStepWidget initialValues={{}} type={StepType.SscaEnforcement} stepViewType={StepViewType.Edit} />)
    expect(screen.getByText('pipelineSteps.stepNameLabel')).toBeInTheDocument()
  })

  test('edit view renders with runtime inputs', async () => {
    const onUpdate = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    render(
      <TestStepWidget
        initialValues={runtimeValues}
        template={runtimeValues}
        type={StepType.SscaEnforcement}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        ref={ref}
      />
    )

    await act(() => ref.current?.submitForm()!)
    expect(onUpdate).toHaveBeenLastCalledWith(runtimeValues)
  })

  test('input set view', async () => {
    render(
      <TestStepWidget
        initialValues={runtimeValues}
        type={StepType.SscaEnforcement}
        stepViewType={StepViewType.InputSet}
      />
    )
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
  })

  test('variable view', async () => {
    render(
      <TestStepWidget
        initialValues={fixedValues}
        type={StepType.SscaEnforcement}
        stepViewType={StepViewType.InputVariable}
      />
    )
    expect(screen.queryByText('pipelineSteps.stepNameLabel')).not.toBeInTheDocument()
  })

  test('validates error in inputs set', () => {
    const data = {
      data: {
        type: StepType.SscaEnforcement,
        ...runtimeValues
      },
      template: {
        type: StepType.SscaEnforcement,
        ...fixedValues
      },
      viewType: StepViewType.DeploymentForm,
      getString: jest.fn().mockImplementation(val => val)
    }
    const response = new SscaEnforcementStep().validateInputSet(data as ValidateInputSetProps<SscaEnforcementStepData>)
    expect(response).toEqual({})
    expect(new SscaEnforcementStep().processFormData(runtimeValues)).toEqual(runtimeValues)
  })
})
