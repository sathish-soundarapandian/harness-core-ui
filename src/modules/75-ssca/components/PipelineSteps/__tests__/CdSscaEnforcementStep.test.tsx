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
import { CdSscaEnforcementStep } from '../CdSscaEnforcementStep/CdSscaEnforcementStep'

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
    },
    infrastructure: {
      type: 'KubernetesDirect',
      spec: {
        connectorRef: RUNTIME_INPUT_VALUE,
        namespace: RUNTIME_INPUT_VALUE,
        resources: {
          limits: {
            cpu: RUNTIME_INPUT_VALUE,
            memory: RUNTIME_INPUT_VALUE
          }
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
    },
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

describe('CD Ssca Enforcement Step', () => {
  beforeAll(() => {
    factory.registerStep(new CdSscaEnforcementStep())
  })

  test('edit view as new step', () => {
    render(<TestStepWidget initialValues={{}} type={StepType.CdSscaEnforcement} stepViewType={StepViewType.Edit} />)
    expect(screen.getByText('pipelineSteps.stepNameLabel')).toBeInTheDocument()
  })

  test('edit view renders with runtime inputs', async () => {
    const onUpdate = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()
    render(
      <TestStepWidget
        initialValues={runtimeValues}
        template={runtimeValues}
        type={StepType.CdSscaEnforcement}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        ref={ref}
      />
    )

    await act(() => ref.current?.submitForm()!)
    expect(onUpdate).toBeCalledWith(runtimeValues)
  })

  test('input set view', async () => {
    render(<TestStepWidget initialValues={{}} type={StepType.CdSscaEnforcement} stepViewType={StepViewType.InputSet} />)
    expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
  })

  test('input set view validation for timeout', () => {
    const response = new CdSscaEnforcementStep().validateInputSet({
      data: {
        name: 'CdSscaEnforcement',
        identifier: 'CdSscaEnforcement',
        timeout: '1s',
        type: 'CdSscaEnforcement',
        spec: {}
      } as any,
      template: {
        timeout: RUNTIME_INPUT_VALUE,
        spec: {}
      } as any,
      getString: jest.fn().mockImplementation(val => val),
      viewType: StepViewType.TriggerForm
    })
    expect(response.timeout).toBe('Value must be greater than or equal to "10s"')
  })

  test('variable view', async () => {
    render(
      <TestStepWidget
        initialValues={fixedValues}
        type={StepType.CdSscaEnforcement}
        stepViewType={StepViewType.InputVariable}
      />
    )
    expect(screen.queryByText('pipelineSteps.stepNameLabel')).not.toBeInTheDocument()
  })
})
