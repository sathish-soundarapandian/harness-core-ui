/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'

import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { ContainerStep } from '../ContainerStep'

const initialValues = {
  type: 'containerstep-1',
  identifier: 'containerstep',
  name: 'contaier-step',
  spec: {
    type: 'Container',
    name: 'contaier-step',
    identifier: 'contaier-step',
    spec: {
      connectorRef: 'harnessImg',
      image: 'test',
      command: 'test-command',
      shell: 'sh',
      infrastructure: {
        type: 'KubernetesDirect',
        spec: {
          connectorRef: 'abc',
          namespace: 'test',
          resources: {
            limits: {
              cpu: '0.5',
              memory: '500Mi'
            }
          },
          annotations: {},
          labels: {},
          containerSecurityContext: {
            capabilities: {
              drop: [],
              add: []
            }
          },
          nodeSelector: {},
          outputVariables: [],
          envVariables: {}
        }
      },
      timeout: '10m'
    }
  }
}
describe('container test', () => {
  beforeEach(() => {
    factory.registerStep(new ContainerStep())
  })
  test('should render  view as new step', () => {
    render(<TestStepWidget initialValues={{}} type={StepType.Container} stepViewType={StepViewType.Edit} />)

    expect(screen.getByLabelText('commandLabel')).toBeInTheDocument()
  })

  test('render edit view of container step', () => {
    const { container } = render(
      <TestStepWidget initialValues={initialValues} type={StepType.Container} stepViewType={StepViewType.Edit} />
    )
    expect(screen.getByLabelText('commandLabel')).toBeInTheDocument()

    expect(container.querySelector('input[name="name"]')).toHaveValue('contaier-step')
    expect(container.querySelector('input[name="spec.shell"]')).toHaveValue('common.sh')
    expect(container.querySelector('input[name="spec.infrastructure.spec.resources.limits.cpu"]')).toHaveValue('0.5')
  })

  test('expand optional configuration section', async () => {
    const { getByText } = render(
      <TestStepWidget initialValues={initialValues} type={StepType.Container} stepViewType={StepViewType.Edit} />
    )

    await userEvent.click(getByText('common.optionalConfig'))

    await waitFor(() => {
      expect(screen.getByText('connectors.title.harnessImageConnectorRef')).toBeInTheDocument()
    })
  })
})
