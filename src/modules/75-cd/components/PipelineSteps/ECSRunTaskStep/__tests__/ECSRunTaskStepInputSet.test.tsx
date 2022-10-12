/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  act,
  findByText,
  fireEvent,
  queryByAttribute,
  render,
  getByText as getElementByText,
  waitFor
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Formik } from 'formik'
import { MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { TestWrapper } from '@common/utils/testUtils'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import connectorsData from '@pipeline/components/ManifestSelection/__tests__/connectors_mock.json'
import type { ECSRunTaskStepInitialValues } from '../ECSRunTaskStep'
import { ECSRunTaskStepInputSetMode } from '../ECSRunTaskStepInputSet'

const fetchConnectors = (): Promise<unknown> => Promise.resolve(connectorsData)
jest.mock('services/cd-ng', () => ({
  getConnectorListPromise: jest.fn().mockImplementation(() => Promise.resolve(connectorsData)),
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectors })),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: { data: connectorsData.data.content[1] }, refetch: fetchConnectors, loading: false }
  })
}))

const emptyInitialValues: ECSRunTaskStepInitialValues = {
  identifier: '',
  name: '',
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
}
const template: ECSRunTaskStepInitialValues = {
  identifier: 'Test_Name',
  name: 'Test Name',
  type: StepType.EcsRunTask,
  timeout: RUNTIME_INPUT_VALUE,
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
}
const handleSubmit = jest.fn()

describe('ECSRunTaskInputSet tests', () => {
  test(`renders Runtime input fields in InputSet view`, async () => {
    const { container, getAllByTestId } = render(
      <TestWrapper>
        <Formik initialValues={emptyInitialValues} onSubmit={handleSubmit()}>
          <ECSRunTaskStepInputSetMode
            initialValues={emptyInitialValues}
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
            inputSetData={{
              path: 'pipeline.stages[0].stage.spec.execution.steps[0].step',
              template: template,
              readonly: false
            }}
          />
        </Formik>
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string) => queryByAttribute('name', container, name)

    const timeoutInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.execution.steps[0].step.timeout'
    ) as HTMLInputElement
    expect(timeoutInput).toBeInTheDocument()
    expect(timeoutInput.value).toBe('')
    expect(timeoutInput).not.toBeDisabled()
    act(() => {
      fireEvent.change(timeoutInput, { target: { value: '20m' } })
    })
    expect(timeoutInput.value).toBe('20m')

    // Starting Task Definition from here
    // Connector Ref
    const connectorRefInput = getAllByTestId(/connectorRef/)[0]
    expect(connectorRefInput).toBeInTheDocument()
    userEvent.click(connectorRefInput!)
    const connectorSelectorDialog = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement
    const githubConnector1 = await findByText(connectorSelectorDialog, 'Git CTR')
    expect(githubConnector1).toBeTruthy()
    const githubConnector2 = await findByText(connectorSelectorDialog, 'Sample')
    expect(githubConnector2).toBeTruthy()
    userEvent.click(githubConnector1)
    const applySelected = getElementByText(connectorSelectorDialog, 'entityReference.apply')
    userEvent.click(applySelected)
    await waitFor(() => expect(document.getElementsByClassName('bp3-dialog')).toHaveLength(0))
    expect(getElementByText(connectorRefInput, 'Git CTR')).toBeInTheDocument()

    // Branch
    const branchInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.execution.steps[0].step.spec.taskDefinition.spec.branch'
    ) as HTMLInputElement
    expect(branchInput).toBeInTheDocument()
    expect(branchInput.value).toBe('')
    expect(branchInput).not.toBeDisabled()
    fireEvent.change(branchInput!, {
      target: { value: 'testBranch' }
    })
    expect(branchInput.value).toBe('testBranch')
    // Path
    const pathInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.execution.steps[0].step.spec.taskDefinition.spec.paths[0]'
    ) as HTMLInputElement
    expect(pathInput).toBeInTheDocument()
    expect(pathInput.value).toBe('')
    expect(pathInput).not.toBeDisabled()
    fireEvent.change(pathInput!, {
      target: { value: 'test-path' }
    })
    expect(pathInput.value).toBe('test-path')

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
      'pipeline.stages[0].stage.spec.execution.steps[0].step.spec.runTaskRequestDefinition.spec.branch'
    ) as HTMLInputElement
    expect(runTaskRequestBranchInput).toBeInTheDocument()
    expect(runTaskRequestBranchInput.value).toBe('')
    expect(runTaskRequestBranchInput).not.toBeDisabled()
    fireEvent.change(runTaskRequestBranchInput!, {
      target: { value: 'testBranch' }
    })
    expect(runTaskRequestBranchInput.value).toBe('testBranch')
    // Path
    const runTaskRequestPathInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.execution.steps[0].step.spec.runTaskRequestDefinition.spec.paths[0]'
    ) as HTMLInputElement
    expect(runTaskRequestPathInput).toBeInTheDocument()
    expect(runTaskRequestPathInput.value).toBe('')
    expect(runTaskRequestPathInput).not.toBeDisabled()
    fireEvent.change(runTaskRequestPathInput!, {
      target: { value: 'run-task-requesttest-path' }
    })
    expect(runTaskRequestPathInput.value).toBe('run-task-requesttest-path')
  })

  test(`when readonly is true in InputSet view`, async () => {
    const { container, getAllByTestId } = render(
      <TestWrapper>
        <Formik initialValues={emptyInitialValues} onSubmit={handleSubmit}>
          <ECSRunTaskStepInputSetMode
            initialValues={emptyInitialValues}
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
            inputSetData={{
              path: 'pipeline.stages[0].stage.spec.execution.steps[0].step',
              template: template,
              readonly: true
            }}
          />
        </Formik>
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string) => queryByAttribute('name', container, name)

    const timeoutInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.execution.steps[0].step.timeout'
    ) as HTMLInputElement
    expect(timeoutInput).toBeInTheDocument()
    expect(timeoutInput.value).toBe('')
    expect(timeoutInput).toBeDisabled()

    // Task Definition
    // Connector Ref
    const connnectorRefInput = getAllByTestId(/connectorRef/)[0]
    expect(connnectorRefInput).toBeInTheDocument()
    // Branch
    const branchInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.execution.steps[0].step.spec.taskDefinition.spec.branch'
    ) as HTMLInputElement
    expect(branchInput).toBeInTheDocument()
    expect(branchInput.value).toBe('')
    expect(branchInput).toBeDisabled()
    // Path
    const pathInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.execution.steps[0].step.spec.taskDefinition.spec.paths[0]'
    ) as HTMLInputElement
    expect(pathInput).toBeInTheDocument()
    expect(pathInput.value).toBe('')
    expect(pathInput).toBeDisabled()

    // Task Definition
    // Connector Ref
    const runTaskRequestConnnectorRefInput = getAllByTestId(/connectorRef/)[1]
    expect(runTaskRequestConnnectorRefInput).toBeInTheDocument()
    // Branch
    const runTaskRequestBranchInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.execution.steps[0].step.spec.runTaskRequestDefinition.spec.branch'
    ) as HTMLInputElement
    expect(runTaskRequestBranchInput).toBeInTheDocument()
    expect(runTaskRequestBranchInput.value).toBe('')
    expect(runTaskRequestBranchInput).toBeDisabled()
    // Path
    const runTaskRequestPathInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.execution.steps[0].step.spec.runTaskRequestDefinition.spec.paths[0]'
    ) as HTMLInputElement
    expect(runTaskRequestPathInput).toBeInTheDocument()
    expect(runTaskRequestPathInput.value).toBe('')
    expect(runTaskRequestPathInput).toBeDisabled()
  })

  test(`when template field is not present under inputSetData prop`, async () => {
    const { container, queryAllByTestId } = render(
      <TestWrapper>
        <Formik initialValues={emptyInitialValues} onSubmit={handleSubmit}>
          <ECSRunTaskStepInputSetMode
            initialValues={emptyInitialValues}
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
            inputSetData={{
              path: 'pipeline.stages[0].stage.spec.execution.steps[0].step',
              readonly: true
            }}
          />
        </Formik>
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string) => queryByAttribute('name', container, name)

    const timeoutInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.execution.steps[0].step.timeout'
    ) as HTMLInputElement
    expect(timeoutInput).not.toBeInTheDocument()

    const connnectorRefInput = queryAllByTestId(/connectorRef/)
    expect(connnectorRefInput.length).toBe(0)
    // Task Definition
    // Branch
    const branchInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.execution.steps[0].step.spec.taskDefinition.spec.branch'
    ) as HTMLInputElement
    expect(branchInput).not.toBeInTheDocument()
    // Path
    const pathInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.execution.steps[0].step.spec.taskDefinition.spec.paths[0]'
    ) as HTMLInputElement
    expect(pathInput).not.toBeInTheDocument()

    // Run Task Request Definition
    const runTaskRequestBranchInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.execution.steps[0].step.spec.runTaskRequestDefinition.spec.branch'
    ) as HTMLInputElement
    expect(runTaskRequestBranchInput).not.toBeInTheDocument()
    // Path
    const runTaskRequestPathInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.execution.steps[0].step.spec.runTaskRequestDefinition.spec.paths[0]'
    ) as HTMLInputElement
    expect(runTaskRequestPathInput).not.toBeInTheDocument()
  })

  test(`when path field is not present under inputSetData prop`, async () => {
    const { container, getAllByTestId } = render(
      <TestWrapper>
        <Formik initialValues={emptyInitialValues} onSubmit={handleSubmit}>
          <ECSRunTaskStepInputSetMode
            initialValues={emptyInitialValues}
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
            inputSetData={{
              template: template,
              readonly: false
            }}
          />
        </Formik>
      </TestWrapper>
    )

    const queryByNameAttribute = (name: string) => queryByAttribute('name', container, name)

    const timeoutInput = queryByNameAttribute('timeout') as HTMLInputElement
    expect(timeoutInput).toBeInTheDocument()
    expect(timeoutInput.value).toBe('')
    expect(timeoutInput).not.toBeDisabled()

    // Task Definition
    // Connector Ref
    const connnectorRefInput = getAllByTestId(/connectorRef/)[0]
    expect(connnectorRefInput).toBeInTheDocument()
    // Branch
    const branchInput = queryByNameAttribute('spec.taskDefinition.spec.branch') as HTMLInputElement
    expect(branchInput).toBeInTheDocument()
    expect(branchInput.value).toBe('')
    expect(branchInput).not.toBeDisabled()
    // Path
    const pathInput = queryByNameAttribute('spec.taskDefinition.spec.paths[0]') as HTMLInputElement
    expect(pathInput).toBeInTheDocument()
    expect(pathInput.value).toBe('')
    expect(pathInput).not.toBeDisabled()

    // Run Task Request Definition
    // Connector Ref
    const runTaskRequestConnnectorRefInput = getAllByTestId(/connectorRef/)[1]
    expect(runTaskRequestConnnectorRefInput).toBeInTheDocument()
    // Branch
    const runTaskRequestBranchInput = queryByNameAttribute(
      'spec.runTaskRequestDefinition.spec.branch'
    ) as HTMLInputElement
    expect(runTaskRequestBranchInput).toBeInTheDocument()
    expect(runTaskRequestBranchInput.value).toBe('')
    expect(runTaskRequestBranchInput).not.toBeDisabled()
    // Path
    const runTaskRequestPathInput = queryByNameAttribute(
      'spec.runTaskRequestDefinition.spec.paths[0]'
    ) as HTMLInputElement
    expect(runTaskRequestPathInput).toBeInTheDocument()
    expect(runTaskRequestPathInput.value).toBe('')
    expect(runTaskRequestPathInput).not.toBeDisabled()
  })
})
