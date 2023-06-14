/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, screen } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'
import { StepViewType, StepFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { SscaOrchestrationStep } from '../SscaOrchestrationStep/SscaOrchestrationStep'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const runtimeValues = {
  identifier: 'Ssca_Orchestration_Step',
  name: 'SSCA Orchestration Step',
  timeout: RUNTIME_INPUT_VALUE,
  spec: {
    tool: {
      type: 'Syft',
      spec: {
        format: 'cyclonedx-json'
      }
    },
    source: {
      type: 'image',
      spec: {
        connector: RUNTIME_INPUT_VALUE,
        image: RUNTIME_INPUT_VALUE
      }
    },
    attestation: {
      type: 'cosign',
      spec: {
        privateKey: RUNTIME_INPUT_VALUE,
        password: RUNTIME_INPUT_VALUE
      }
    }
  }
}

const fixedValues = {
  identifier: 'Ssca_Orchestration_Step',
  name: 'SSCA Orchestration Step',
  timeout: '10s',
  spec: {
    tool: {
      type: 'Syft',
      spec: {
        format: 'spdx-json'
      }
    },
    source: {
      type: 'image'
    },
    attestation: {
      type: 'cosign',
      spec: {
        privateKey: 'testKey',
        password: 'testPassword'
      }
    }
  }
}

describe('Ssca Orchestration Step', () => {
  beforeAll(() => {
    factory.registerStep(new SscaOrchestrationStep())
  })

  test('edit view as new step', () => {
    render(<TestStepWidget initialValues={{}} type={StepType.SscaOrchestration} stepViewType={StepViewType.Edit} />)
    expect(screen.getByText('pipelineSteps.stepNameLabel')).toBeInTheDocument()
  })

  test('edit view renders with runtime inputs', async () => {
    const onUpdate = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    render(
      <TestStepWidget
        initialValues={runtimeValues}
        template={runtimeValues}
        type={StepType.SscaOrchestration}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        ref={ref}
      />
    )

    await act(() => ref.current?.submitForm()!)
    expect(onUpdate).toHaveBeenCalledWith(runtimeValues)
  })

  test('input set view', async () => {
    render(<TestStepWidget initialValues={{}} type={StepType.SscaOrchestration} stepViewType={StepViewType.InputSet} />)
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
  })

  test('variable view', async () => {
    render(
      <TestStepWidget
        initialValues={fixedValues}
        type={StepType.SscaOrchestration}
        stepViewType={StepViewType.InputVariable}
      />
    )
    expect(screen.queryByText('pipelineSteps.stepNameLabel')).not.toBeInTheDocument()
  })
})
