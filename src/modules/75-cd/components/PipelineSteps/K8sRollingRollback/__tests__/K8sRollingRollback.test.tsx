/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, act, screen } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import userEvent from '@testing-library/user-event'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { K8sRollingRollback } from '../K8sRollingRollback.stories'
import { K8sRollingRollbackStep } from '../K8sRollingRollback'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('Test K8sRollingRollback Step', () => {
  beforeEach(() => {
    factory.registerStep(new K8sRollingRollbackStep())
  })
  test('should render edit view', async () => {
    const { container } = render(
      <K8sRollingRollback
        type={StepType.K8sRollingRollback}
        initialValues={{ identifier: 'Test_A', type: StepType.K8sRollingRollback }}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()

    userEvent.click(screen.getByTestId('optional-config-summary'))

    expect(await screen.findByRole('checkbox', { name: 'cd.steps.common.enableKubernetesPruning' })).toBeInTheDocument()
  })
  test('should render inputSet view', () => {
    const { container } = render(
      <K8sRollingRollback
        type={StepType.K8sRollingRollback}
        initialValues={{ identifier: 'Test_A', type: StepType.K8sRollingRollback }}
        stepViewType={StepViewType.InputSet}
        path=""
        template={{
          identifier: 'Test_A',
          type: StepType.K8sRollingRollback,
          timeout: RUNTIME_INPUT_VALUE,
          spec: { skipDryRun: RUNTIME_INPUT_VALUE }
        }}
        allValues={{
          type: StepType.K8sRollingRollback,
          name: 'Test A',
          identifier: 'Test_A',
          spec: { timeout: RUNTIME_INPUT_VALUE }
        }}
      />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render inputSet view and test validation', async () => {
    const { container, getByText } = render(
      <K8sRollingRollback
        type={StepType.K8sRollingRollback}
        initialValues={{ identifier: 'Test_A', type: StepType.K8sRollingRollback }}
        stepViewType={StepViewType.InputSet}
        path=""
        template={{
          identifier: 'Test_A',
          type: StepType.K8sRollingRollback,
          spec: { timeout: RUNTIME_INPUT_VALUE }
        }}
        allValues={{
          type: StepType.K8sRollingRollback,
          name: 'Test A',
          identifier: 'Test_A',
          spec: { timeout: RUNTIME_INPUT_VALUE }
        }}
      />
    )
    await act(async () => {
      fireEvent.click(getByText('Submit'))
    })
    expect(container).toMatchSnapshot()
  })

  test('should render variable view', () => {
    const { container } = render(
      <K8sRollingRollback
        initialValues={{
          identifier: 'Test_A',
          type: StepType.K8sRollingRollback,
          spec: {
            timeout: '10m',
            skipDryRun: false
          }
        }}
        customStepProps={{
          stageIdentifier: 'qaStage',
          metadataMap: {
            'step-name': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.rollingRollback.name',
                localName: 'step.rollingRollback.name'
              }
            },

            'step-timeout': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.rollingRollback.timeout',
                localName: 'step.rollingRollback.timeout'
              }
            },
            'step-skip': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.rollingRollback.skipDryRun',
                localName: 'step.rollingRollback.skipDryRun'
              }
            }
          },
          variablesData: {
            name: 'Test_A',
            identifier: 'rollingDeploy',
            type: 'K8sRollingRollback',
            spec: {
              timeout: 'step-timeout',
              skipDryRun: 'step-skip'
            }
          }
        }}
        type={StepType.K8sRollingRollback}
        stepViewType={StepViewType.InputVariable}
      />
    )
    expect(container).toMatchSnapshot()
  })
  test('Validate timeout is min 10s with runtime', () => {
    const response = new K8sRollingRollbackStep().validateInputSet({
      data: {
        name: 'Test A',
        identifier: 'Test A',
        timeout: '5s',
        type: StepType.K8sRollingRollback,
        spec: {
          skipDryRun: false
        }
      },
      template: {
        name: 'Test A',
        identifier: 'Test A',
        timeout: '<+input>',
        type: StepType.K8sRollingRollback,
        spec: {
          skipDryRun: false
        }
      },
      viewType: StepViewType.TriggerForm
    })
    expect(response).toMatchSnapshot()
  })
  test('inputSet', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container } = render(
      <TestStepWidget
        initialValues={{ identifier: 'Test_A', type: 'K8sRollingRollback', spec: { skipDryRun: false } }}
        template={{
          identifier: 'Test_A',
          type: 'K8sRollingRollback',
          timeout: RUNTIME_INPUT_VALUE,
          spec: { skipDryRun: RUNTIME_INPUT_VALUE }
        }}
        allValues={{
          type: 'K8sRollingRollback',
          name: 'Test A',
          identifier: 'Test_A',
          spec: { skipDryRun: RUNTIME_INPUT_VALUE, timeout: '<+input>' }
        }}
        type={StepType.K8sRollingRollback}
        stepViewType={StepViewType.InputSet}
        formikRef={ref}
        path={'/abc'}
      />
    )
    expect(container).toMatchSnapshot()
  })
  test('on edit view update', async () => {
    const onUpdate = jest.fn()
    const onChange = jest.fn()
    const ref = React.createRef<StepFormikRef<unknown>>()

    const { container } = render(
      <TestStepWidget
        initialValues={{
          name: 'Test A',
          identifier: 'Test A',
          timeout: '5s',
          type: StepType.K8sRollingRollback,
          spec: {
            skipDryRun: false,
            timeout: '10m'
          }
        }}
        type={StepType.K8sRollingRollback}
        stepViewType={StepViewType.Edit}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
      />
    )
    await act(async () => ref.current?.submitForm())
    expect(container).toMatchSnapshot()
  })
})
