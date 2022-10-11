/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
// import userEvent from '@testing-library/user-event'
import { RUNTIME_INPUT_VALUE } from '@wings-software/uicore'

import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
// import { UpdateReleaseRepoInputStep } from '../UpdateReleaseRepoInputStep'
import { UpdateReleaseRepo } from '../UpdateReleaseRepo'

// const allValuesCommon = {
//   type: 'ShellScript',
//   identifier: 'ShellScript',
//   name: 'SSH',
//   timeout: '10m',
//   spec: {
//     shell: 'Bash',
//     onDelegate: 'targethost',
//     source: {
//       type: 'Inline',
//       spec: {
//         script: 'test script'
//       }
//     },
//     executionTarget: {
//       host: 'targethost',
//       connectorRef: 'connectorRef',
//       workingDirectory: './temp'
//     },
//     environmentVariables: [
//       {
//         name: 'testInput1',
//         type: 'String',
//         value: 'Test_A'
//       },
//       {
//         name: 'testInput2',
//         type: 'String',
//         value: 'Test_B'
//       }
//     ],
//     outputVariables: [
//       {
//         name: 'testOutput1',
//         type: 'String',
//         value: 'Test_C'
//       },
//       {
//         name: 'testOutput2',
//         type: 'String',
//         value: 'Test_D'
//       }
//     ]
//   }
// }

jest.mock('@common/components/MonacoEditor/MonacoEditor')
jest.mock('@common/components/YAMLBuilder/YamlBuilder')

factory.registerStep(new UpdateReleaseRepo())

describe('UpdateReleaseREpoInput tests', () => {
  test('renders runtime inputs', () => {
    const initialValues = {
      type: StepType.GitOpsUpdateReleaseRepo,
      identifier: 'GitOpsUpdateReleaseRepo',
      name: 'UpdateReleaseRepo',
      timeout: '10m',
      spec: {
        variables: [
          {
            name: 'testInput1',
            type: 'String',
            value: RUNTIME_INPUT_VALUE
          }
        ]
      }
    }
    const { container } = render(
      <TestStepWidget
        initialValues={initialValues}
        type={StepType.GitOpsUpdateReleaseRepo}
        stepViewType={StepViewType.Edit}
      />
    )

    expect(container).toMatchSnapshot()
  })

  test('renders input sets', () => {
    const onUpdate = jest.fn()
    const initialValues = {
      type: StepType.GitOpsUpdateReleaseRepo,
      identifier: 'GitOpsUpdateReleaseRepo',
      name: 'UpdateReleaseRepo',
      timeout: RUNTIME_INPUT_VALUE,
      spec: {
        variables: [
          {
            name: 'testInput1',
            type: 'String',
            value: 'test'
          }
        ]
      }
    }

    const { container } = render(
      <TestStepWidget
        initialValues={{}}
        template={initialValues}
        type={StepType.GitOpsUpdateReleaseRepo}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdate}
      />
    )

    expect(container).toMatchSnapshot()
  })

  test('renders empty input sets', () => {
    const initialValues = {
      type: StepType.GitOpsUpdateReleaseRepo,
      identifier: 'GitOpsUpdateReleaseRepo',
      name: 'UpdateReleaseRepo',
      timeout: RUNTIME_INPUT_VALUE,
      spec: {
        variables: [
          {
            name: RUNTIME_INPUT_VALUE,
            type: RUNTIME_INPUT_VALUE,
            value: RUNTIME_INPUT_VALUE
          }
        ]
      }
    }
    const { container } = render(
      <TestStepWidget
        initialValues={initialValues}
        type={StepType.GitOpsUpdateReleaseRepo}
        stepViewType={StepViewType.InputSet}
      />
    )

    expect(container).toMatchSnapshot()
  })

  test('input sets should not render', () => {
    const template = {
      type: StepType.GitOpsUpdateReleaseRepo,
      identifier: 'test'
    }
    const allValues = {
      type: StepType.GitOpsUpdateReleaseRepo,
      identifier: 'test',
      name: 'test',
      spec: {
        variables: [
          {
            name: 'testInput1',
            type: 'String',
            value: 'Test_A'
          }
        ],
        timeout: '10m'
      }
    }

    const onUpdate = jest.fn()

    const { container } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.GitOpsUpdateReleaseRepo}
        stepViewType={StepViewType.InputSet}
        template={template}
        allValues={allValues}
        onUpdate={onUpdate}
      />
    )

    expect(container).toMatchSnapshot()
  })
})
