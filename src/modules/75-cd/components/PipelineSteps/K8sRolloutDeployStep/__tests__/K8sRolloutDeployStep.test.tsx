/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { K8RolloutDeployStep } from '../K8sRolloutDeployStep'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('Test K8sRolloutDeployStep', () => {
  beforeEach(() => {
    factory.registerStep(new K8RolloutDeployStep())
  })
  test('should render edit view as new step', () => {
    const { container } = render(
      <TestStepWidget initialValues={{}} type={StepType.K8sRollingDeploy} stepViewType={StepViewType.Edit} />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render edit view as edit step', async () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'K8sRollingDeploy',
          name: 'Test A',
          identifier: 'Test_A',
          spec: { skipDryRun: RUNTIME_INPUT_VALUE, timeout: '10m' }
        }}
        type={StepType.K8sRollingDeploy}
        stepViewType={StepViewType.Edit}
      />
    )
    expect(container).toMatchSnapshot()

    userEvent.click(screen.getByTestId('optional-config-summary'))

    expect(await screen.findByRole('checkbox', { name: 'cd.steps.common.enableKubernetesPruning' })).toBeInTheDocument()
  })
  test('should render variable view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{
          type: 'K8sRollingDeploy',
          name: 'Test A',
          identifier: 'Test_A',
          spec: { skipDryRun: true, timeout: '10m' }
        }}
        customStepProps={{
          stageIdentifier: 'qaStage',
          metadataMap: {
            'step-skip': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.rolloutDeployment.skipDryRun',
                localName: 'step.rolloutDeployment.skipDryRun'
              }
            },

            'step-timeout': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.rolloutDeployment.timeout',
                localName: 'step.rolloutDeployment.timeout'
              }
            },
            'step-name': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.rolloutDeployment.name',
                localName: 'step.rolloutDeployment.name'
              }
            }
          },
          variablesData: {
            name: 'step-name',
            identifier: 'rolloutDeployment',
            type: 'K8sRollingDeploy',
            spec: {
              timeout: 'step-timeout',
              skipDryRun: 'step-skip'
            }
          }
        }}
        type={StepType.K8sRollingDeploy}
        stepViewType={StepViewType.InputVariable}
      />
    )
    expect(container).toMatchSnapshot()
  })
  test('should render edit view', () => {
    const { container } = render(
      <TestStepWidget
        initialValues={{ identifier: 'Test_A', type: 'K8sRollingDeploy', spec: { skipDryRun: false } }}
        template={{
          identifier: 'Test_A',
          type: 'K8sRollingDeploy',
          timeout: RUNTIME_INPUT_VALUE,
          spec: { skipDryRun: RUNTIME_INPUT_VALUE }
        }}
        allValues={{
          type: 'K8sRollingDeploy',
          name: 'Test A',
          identifier: 'Test_A',
          spec: { skipDryRun: RUNTIME_INPUT_VALUE, timeout: '10m' }
        }}
        path=""
        type={StepType.K8sRollingDeploy}
        stepViewType={StepViewType.InputSet}
      />
    )
    expect(container).toMatchSnapshot()
  })
  test('Validate timeout is min 10s with runtime', () => {
    const response = new K8RolloutDeployStep().validateInputSet({
      data: {
        name: 'Test A',
        identifier: 'Test A',
        timeout: '5s',
        type: StepType.K8sRollingDeploy,
        spec: {
          skipDryRun: false
        }
      },
      template: {
        name: 'Test A',
        identifier: 'Test A',
        timeout: '<+input>',
        type: StepType.K8sRollingDeploy,
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
        initialValues={{ identifier: 'Test_A', type: 'K8sRollingDeploy', spec: { skipDryRun: false } }}
        template={{
          identifier: 'Test_A',
          type: 'K8sRollingDeploy',
          timeout: RUNTIME_INPUT_VALUE,
          spec: { skipDryRun: RUNTIME_INPUT_VALUE }
        }}
        allValues={{
          type: 'K8sRollingDeploy',
          name: 'Test A',
          identifier: 'Test_A',
          spec: { skipDryRun: RUNTIME_INPUT_VALUE, timeout: '<+input>' }
        }}
        type={StepType.K8sRollingDeploy}
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
          type: StepType.K8sRollingDeploy,
          spec: {
            skipDryRun: false,
            timeout: '10m'
          }
        }}
        type={StepType.K8sRollingDeploy}
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
