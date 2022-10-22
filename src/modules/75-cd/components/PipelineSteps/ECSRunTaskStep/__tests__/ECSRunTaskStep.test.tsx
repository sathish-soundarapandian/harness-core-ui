/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, findByText, render, waitFor, getByText as getElementByText, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { queryByNameAttribute } from '@common/utils/testUtils'
import { TestStepWidget, factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import connectorsData from '@pipeline/components/ManifestSelection/__tests__/connectors_mock.json'
import { ECSRunTaskStep } from '../ECSRunTaskStep'
import { testTaskDefinitionLastStep, testTaskDefinitionSecondStep } from './TaskDefinitionModal.test'

const fetchConnectors = (): Promise<unknown> => Promise.resolve(connectorsData)
jest.mock('services/cd-ng', () => ({
  getConnectorListPromise: jest.fn().mockImplementation(() => Promise.resolve(connectorsData)),
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectors })),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: { data: connectorsData.data.content[1] }, refetch: fetchConnectors, loading: false }
  }),
  useGetServiceV2: jest.fn().mockImplementation(() => ({ loading: false, data: {}, refetch: jest.fn() }))
}))

factory.registerStep(new ECSRunTaskStep())

const existingInitialValues = {
  identifier: 'Step_1',
  name: 'Step 1',
  timeout: '20m',
  type: StepType.EcsRunTask,
  spec: {
    taskDefinition: {
      type: 'Git',
      spec: {
        branch: 'testBranch',
        connectorRef: 'account.Git_CTR',
        gitFetchType: 'Branch',
        paths: ['test-path']
      }
    }
  }
}
const onUpdate = jest.fn()
const onChange = jest.fn()

describe('ECSRunTaskStep tests', () => {
  beforeEach(() => {
    onUpdate.mockReset()
    onChange.mockReset()
  })
  test('Edit view renders fine', async () => {
    const ref = React.createRef<StepFormikRef<unknown>>()
    const { container, getByText, queryByText } = render(
      <TestStepWidget
        initialValues={{}}
        type={StepType.EcsRunTask}
        onUpdate={onUpdate}
        onChange={onChange}
        ref={ref}
        stepViewType={StepViewType.Edit}
        isNewStep={true}
      />
    )

    // Name
    const nameInput = queryByNameAttribute('name', container)
    userEvent.type(nameInput!, 'Step 1')
    await waitFor(() => expect(nameInput).toHaveDisplayValue('Step 1'))
    expect(getByText('Step_1')).toBeInTheDocument()

    // Timeout
    const timeoutInput = queryByNameAttribute('timeout', container)
    userEvent.clear(timeoutInput!)
    userEvent.type(timeoutInput!, '30m')
    await waitFor(() => expect(timeoutInput).toHaveDisplayValue('30m'))

    // Task Definition
    const addTaskDefinitionBtn = getByText('cd.pipelineSteps.serviceTab.manifest.taskDefinition')
    userEvent.click(addTaskDefinitionBtn)
    const dialogList = document.getElementsByClassName('bp3-dialog')
    const portal = dialogList[0] as HTMLElement
    // Test manifest store tiles, choose Git and fill in Connector field
    await testTaskDefinitionSecondStep(portal)
    // Fill in required field and submit manifest
    await testTaskDefinitionLastStep(portal)
    await waitFor(() => expect(dialogList.length).toBe(0))

    // Optional Configurations
    const optionalConfigAccordionHeader = getByText('common.optionalConfig')
    userEvent.click(optionalConfigAccordionHeader)
    const skipSteadyStateCheck = await queryByText('cd.steps.ecsRunTaskStep.skipSteadyStateCheck')?.parentElement
    userEvent.click(skipSteadyStateCheck!)

    act(() => {
      ref.current?.submitForm()
    })
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Step_1',
        name: 'Step 1',
        timeout: '30m',
        spec: {
          taskDefinition: {
            type: 'Git',
            spec: {
              branch: 'testBranch',
              connectorRef: 'account.Git_CTR',
              gitFetchType: 'Branch',
              paths: ['test-path']
            }
          },
          skipSteadyStateCheck: true
        },
        type: StepType.EcsRunTask
      })
    )
  })

  test('InputSet view renders fine', async () => {
    const { container, getByText, getAllByTestId } = render(
      <TestStepWidget
        initialValues={{
          identifier: 'Step_1',
          name: 'Step 1',
          timeout: '',
          type: StepType.EcsRunTask,
          spec: {
            taskDefinition: {
              type: 'Git',
              spec: {
                branch: '',
                connectorRef: '',
                gitFetchType: 'Branch',
                paths: []
              }
            },
            runTaskRequestDefinition: {
              type: 'Git',
              spec: {
                branch: '',
                connectorRef: '',
                gitFetchType: 'Branch',
                paths: []
              }
            },
            skipSteadyStateCheck: false
          }
        }}
        template={{
          identifier: 'Step_1',
          name: 'Step 1',
          timeout: RUNTIME_INPUT_VALUE,
          type: StepType.EcsRunTask,
          spec: {
            taskDefinition: {
              type: 'Git',
              spec: {
                branch: RUNTIME_INPUT_VALUE,
                connectorRef: RUNTIME_INPUT_VALUE,
                gitFetchType: 'Branch',
                paths: RUNTIME_INPUT_VALUE
              }
            },
            runTaskRequestDefinition: {
              type: 'Git',
              spec: {
                branch: RUNTIME_INPUT_VALUE,
                connectorRef: RUNTIME_INPUT_VALUE,
                gitFetchType: 'Branch',
                paths: RUNTIME_INPUT_VALUE
              }
            },
            skipSteadyStateCheck: false
          }
        }}
        type={StepType.EcsRunTask}
        stepViewType={StepViewType.InputSet}
        onUpdate={onUpdate}
      />
    )

    // Timeout
    const submitBtn = getByText('Submit')
    const timeoutInput = queryByNameAttribute('timeout', container)
    expect(timeoutInput).toBeVisible()

    // Connector
    const connnectorRefInput = getAllByTestId(/connectorRef/)[0]
    expect(connnectorRefInput).toBeTruthy()
    userEvent.click(connnectorRefInput!)
    const connectorSelectorDialog = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement
    const githubConnector1 = await findByText(connectorSelectorDialog, 'Git CTR')
    expect(githubConnector1).toBeTruthy()
    const githubConnector2 = await findByText(connectorSelectorDialog, 'Sample')
    expect(githubConnector2).toBeTruthy()
    userEvent.click(githubConnector1)
    const applySelected = getElementByText(connectorSelectorDialog, 'entityReference.apply')
    userEvent.click(applySelected)
    await waitFor(() => expect(document.getElementsByClassName('bp3-dialog')).toHaveLength(0))

    // Branch
    fireEvent.change(queryByNameAttribute('spec.taskDefinition.spec.branch', container)!, {
      target: { value: 'testBranch' }
    })
    // Path
    fireEvent.change(queryByNameAttribute('spec.taskDefinition.spec.paths[0]', container)!, {
      target: { value: 'test-path' }
    })

    // Starting Run Task REquest Definition from here
    // Connector Ref
    const runTaskRequestConnectorRefInput = getAllByTestId(/connectorRef/)[1]
    expect(runTaskRequestConnectorRefInput).toBeInTheDocument()
    userEvent.click(runTaskRequestConnectorRefInput!)
    const runTaskRequestConnectorSelectorDialog = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement
    const runTaskRequestGithubConnector1 = await findByText(runTaskRequestConnectorSelectorDialog, 'Git CTR')
    expect(runTaskRequestGithubConnector1).toBeTruthy()
    const runTaskRequestGithubConnector2 = await findByText(runTaskRequestConnectorSelectorDialog, 'Sample')
    expect(runTaskRequestGithubConnector2).toBeTruthy()
    userEvent.click(runTaskRequestGithubConnector2)
    const applyBtn = getElementByText(runTaskRequestConnectorSelectorDialog, 'entityReference.apply')
    userEvent.click(applyBtn)
    await waitFor(() => expect(document.getElementsByClassName('bp3-dialog')).toHaveLength(0))
    expect(getElementByText(runTaskRequestConnectorRefInput, 'Sample')).toBeInTheDocument()

    // Branch
    const runTaskRequestBranchInput = queryByNameAttribute(
      'spec.runTaskRequestDefinition.spec.branch',
      container
    ) as HTMLInputElement
    expect(runTaskRequestBranchInput).toBeInTheDocument()
    expect(runTaskRequestBranchInput.value).toBe('')
    expect(runTaskRequestBranchInput).not.toBeDisabled()
    fireEvent.change(runTaskRequestBranchInput!, {
      target: { value: 'testBranch1' }
    })
    expect(runTaskRequestBranchInput.value).toBe('testBranch1')
    // Path
    const runTaskRequestPathInput = queryByNameAttribute(
      'spec.runTaskRequestDefinition.spec.paths[0]',
      container
    ) as HTMLInputElement
    expect(runTaskRequestPathInput).toBeInTheDocument()
    expect(runTaskRequestPathInput.value).toBe('')
    expect(runTaskRequestPathInput).not.toBeDisabled()
    fireEvent.change(runTaskRequestPathInput!, {
      target: { value: 'run-task-requesttest-path' }
    })
    expect(runTaskRequestPathInput.value).toBe('run-task-requesttest-path')

    // Click Submit and check if validation kicks in
    userEvent.click(submitBtn)
    await waitFor(() => expect(getByText('validation.timeout10SecMinimum')).toBeInTheDocument())
    expect(onUpdate).not.toHaveBeenCalled()
    userEvent.type(timeoutInput!, '20m')

    // Submit after giving valid values
    userEvent.click(submitBtn)
    await waitFor(() => expect(onUpdate).toHaveBeenCalled())
    expect(onUpdate).toHaveBeenCalledWith({
      identifier: 'Step_1',
      name: 'Step 1',
      timeout: '20m',
      spec: {
        taskDefinition: {
          type: 'Git',
          spec: {
            branch: 'testBranch',
            connectorRef: 'account.Git_CTR',
            gitFetchType: 'Branch',
            paths: ['test-path']
          }
        },
        runTaskRequestDefinition: {
          type: 'Git',
          spec: {
            branch: 'testBranch1',
            connectorRef: 'account.SampleX',
            gitFetchType: 'Branch',
            paths: ['run-task-requesttest-path']
          }
        },
        skipSteadyStateCheck: false
      },
      type: StepType.EcsRunTask
    })
  })

  test('Variables view renders fine', async () => {
    const { getByText } = render(
      <TestStepWidget
        initialValues={existingInitialValues}
        type={StepType.EcsRunTask}
        onUpdate={onUpdate}
        onChange={onChange}
        stepViewType={StepViewType.InputVariable}
        isNewStep={true}
        customStepProps={{
          stageIdentifier: 'qaStage',
          variablesData: existingInitialValues,
          metadataMap: {
            'Step 1': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.EcsRunTask.name',
                localName: 'step.EcsRunTask.name'
              }
            },
            '20m': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.execution.steps.EcsRunTask.timeout',
                localName: 'step.EcsRunTask.timeout'
              }
            }
          }
        }}
      />
    )

    expect(getByText('name')).toBeVisible()
    expect(getByText('Step 1')).toBeVisible()
    expect(getByText('timeout')).toBeVisible()
    expect(getByText('20m')).toBeVisible()
  })
})
