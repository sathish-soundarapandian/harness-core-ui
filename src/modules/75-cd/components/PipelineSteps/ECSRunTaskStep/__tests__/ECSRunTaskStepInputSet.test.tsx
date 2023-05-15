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
import { MultiTypeInputType } from '@harness/uicore'

import { TestWrapper } from '@common/utils/testUtils'
import connectorsData from '@pipeline/components/ManifestSelection/__tests__/connectors_mock.json'
import { awsRegionsData } from '@pipeline/components/ManifestSelection/ManifestWizardSteps/ECSWithS3/__tests__/mocks'
import { bucketNameList } from '../../ECSServiceSpec/ManifestSource/__tests__/helpers/mock'
import { ECSRunTaskStepInputSetMode } from '../ECSRunTaskStepInputSet'
import {
  emptyInitialValuesGitStore,
  emptyInitialValuesS3Store,
  emptyInitialValuesTaskDefinitionArn,
  templateGitStore,
  templateS3Store,
  templateTaskDefinitionArn
} from './helper'

const fetchConnectors = (): Promise<unknown> => Promise.resolve(connectorsData)
const fetchBuckets = jest.fn().mockReturnValue(bucketNameList)
jest.mock('services/cd-ng', () => ({
  getConnectorListV2Promise: jest.fn().mockImplementation(() => Promise.resolve(connectorsData)),
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectors })),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: { data: connectorsData.data.content[1] }, refetch: fetchConnectors, loading: false }
  }),
  useGetBucketListForS3: jest.fn().mockImplementation(() => {
    return { data: bucketNameList, refetch: fetchBuckets, error: null, loading: false }
  })
}))
jest.mock('services/portal', () => ({
  useListAwsRegions: jest.fn().mockImplementation(() => {
    return { data: awsRegionsData, refetch: jest.fn(), error: null, loading: false }
  })
}))

const handleSubmit = jest.fn()

describe('ECSRunTaskInputSet tests', () => {
  test(`renders Runtime input fields in InputSet view when taskDefinitionArn is runtime input`, async () => {
    const { container, getAllByTestId } = render(
      <TestWrapper>
        <Formik initialValues={emptyInitialValuesTaskDefinitionArn} onSubmit={handleSubmit()}>
          <ECSRunTaskStepInputSetMode
            initialValues={emptyInitialValuesGitStore}
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
            inputSetData={{
              path: 'pipeline.stages[0].stage.spec.execution.steps[0].step',
              template: templateTaskDefinitionArn,
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

    // ECS Run Task Definition ARN
    const taskDefinitionArnInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.execution.steps[0].step.spec.taskDefinitionArn'
    ) as HTMLInputElement
    expect(taskDefinitionArnInput).toBeInTheDocument()
    expect(taskDefinitionArnInput.value).toBe('')
    expect(taskDefinitionArnInput).not.toBeDisabled()
    fireEvent.change(taskDefinitionArnInput!, {
      target: { value: 'arn:runtime:8081' }
    })
    expect(taskDefinitionArnInput.value).toBe('arn:runtime:8081')

    // Starting Run Task REquest Definition from here
    // Connector Ref
    const runTaskRequestConnectorRefInput = getAllByTestId(/connectorRef/)[0]
    expect(runTaskRequestConnectorRefInput).toBeInTheDocument()
    await userEvent.click(runTaskRequestConnectorRefInput!)
    const runTaskRequestConnectorSelectorDialog = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement
    const runTaskRequestGithubConnector1 = await findByText(runTaskRequestConnectorSelectorDialog, 'Git CTR')
    expect(runTaskRequestGithubConnector1).toBeTruthy()
    const runTaskRequestGithubConnector2 = await findByText(runTaskRequestConnectorSelectorDialog, 'Sample')
    expect(runTaskRequestGithubConnector2).toBeTruthy()
    await userEvent.click(runTaskRequestGithubConnector2)
    const applyBtn = getElementByText(runTaskRequestConnectorSelectorDialog, 'entityReference.apply')
    await userEvent.click(applyBtn)
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

  test(`renders Runtime input fields in InputSet view when store type is of Git type`, async () => {
    const { container, getAllByTestId } = render(
      <TestWrapper>
        <Formik initialValues={emptyInitialValuesGitStore} onSubmit={handleSubmit()}>
          <ECSRunTaskStepInputSetMode
            initialValues={emptyInitialValuesGitStore}
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
            inputSetData={{
              path: 'pipeline.stages[0].stage.spec.execution.steps[0].step',
              template: templateGitStore,
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
    await userEvent.click(connectorRefInput!)
    const connectorSelectorDialog = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement
    const githubConnector1 = await findByText(connectorSelectorDialog, 'Git CTR')
    expect(githubConnector1).toBeTruthy()
    const githubConnector2 = await findByText(connectorSelectorDialog, 'Sample')
    expect(githubConnector2).toBeTruthy()
    await userEvent.click(githubConnector1)
    const applySelected = getElementByText(connectorSelectorDialog, 'entityReference.apply')
    await userEvent.click(applySelected)
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
    await userEvent.click(runTaskRequestConnectorRefInput!)
    const runTaskRequestConnectorSelectorDialog = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement
    const runTaskRequestGithubConnector1 = await findByText(runTaskRequestConnectorSelectorDialog, 'Git CTR')
    expect(runTaskRequestGithubConnector1).toBeTruthy()
    const runTaskRequestGithubConnector2 = await findByText(runTaskRequestConnectorSelectorDialog, 'Sample')
    expect(runTaskRequestGithubConnector2).toBeTruthy()
    await userEvent.click(runTaskRequestGithubConnector2)
    const applyBtn = getElementByText(runTaskRequestConnectorSelectorDialog, 'entityReference.apply')
    await userEvent.click(applyBtn)
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

  test(`renders Runtime input fields in InputSet view when store type is S3`, async () => {
    const { container, getAllByTestId } = render(
      <TestWrapper>
        <Formik initialValues={emptyInitialValuesS3Store} onSubmit={handleSubmit()}>
          <ECSRunTaskStepInputSetMode
            initialValues={emptyInitialValuesS3Store}
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
            inputSetData={{
              path: 'pipeline.stages[0].stage.spec.execution.steps[0].step',
              template: templateS3Store,
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

    const dropDownIcons = container.querySelectorAll('[data-icon="chevron-down"]')
    expect(dropDownIcons.length).toBe(6)
    const portalDivs = document.getElementsByClassName('bp3-portal')
    expect(portalDivs.length).toBe(0)

    // Starting Task Definition from here
    // Connector Ref
    const connectorRefInput = getAllByTestId(/connectorRef/)[0]
    expect(connectorRefInput).toBeInTheDocument()
    await userEvent.click(connectorRefInput!)
    const connectorSelectorDialog = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement
    const githubConnector1 = await findByText(connectorSelectorDialog, 'AWS')
    expect(githubConnector1).toBeTruthy()
    const githubConnector2 = await findByText(connectorSelectorDialog, 'Sample')
    expect(githubConnector2).toBeTruthy()
    await userEvent.click(githubConnector1)
    const applySelected = getElementByText(connectorSelectorDialog, 'entityReference.apply')
    await userEvent.click(applySelected)
    await waitFor(() => expect(document.getElementsByClassName('bp3-dialog')).toHaveLength(0))
    expect(getElementByText(connectorRefInput, 'AWS')).toBeInTheDocument()

    // Region
    const regionSelect = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.execution.steps[0].step.spec.taskDefinition.spec.region'
    ) as HTMLInputElement
    expect(regionSelect).toBeInTheDocument()
    expect(regionSelect.value).toBe('')
    expect(regionSelect).not.toBeDisabled()
    const regionDropdownIcon = dropDownIcons[1]
    await userEvent.click(regionDropdownIcon)
    await waitFor(() => expect(portalDivs.length).toBe(2))
    const regionDropdownDialogDiv = portalDivs[1]
    const regionSelectListMenu = regionDropdownDialogDiv.querySelector('.bp3-menu')
    const regionItem = await findByText(regionSelectListMenu as HTMLElement, 'US East (N. Virginia)')
    await userEvent.click(regionItem)
    await waitFor(() => expect(regionSelect.value).toBe('US East (N. Virginia)'))

    // Bucket Name
    const bucketNameSelect = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.execution.steps[0].step.spec.taskDefinition.spec.bucketName'
    ) as HTMLInputElement
    expect(bucketNameSelect).toBeInTheDocument()
    expect(bucketNameSelect.value).toBe('')
    expect(bucketNameSelect).not.toBeDisabled()
    const bucketNameDropdownIcon = dropDownIcons[2]
    await userEvent.click(bucketNameDropdownIcon)
    await waitFor(() => expect(portalDivs.length).toBe(2))
    const bucketNameDropdownDialogDiv = portalDivs[1]
    const bucketNameSelectListMenu = bucketNameDropdownDialogDiv.querySelector('.bp3-menu')
    const bucketNameItem = await findByText(bucketNameSelectListMenu as HTMLElement, 'prod-bucket-339')
    await userEvent.click(bucketNameItem)
    expect(bucketNameSelect.value).toBe('prod-bucket-339')

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
    await userEvent.click(runTaskRequestConnectorRefInput!)
    const runTaskRequestConnectorSelectorDialog = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement
    const runTaskRequestGithubConnector1 = await findByText(runTaskRequestConnectorSelectorDialog, 'AWS')
    expect(runTaskRequestGithubConnector1).toBeTruthy()
    const runTaskRequestGithubConnector2 = await findByText(runTaskRequestConnectorSelectorDialog, 'Sample')
    expect(runTaskRequestGithubConnector2).toBeTruthy()
    await userEvent.click(runTaskRequestGithubConnector2)
    const applyBtn = getElementByText(runTaskRequestConnectorSelectorDialog, 'entityReference.apply')
    await userEvent.click(applyBtn)
    await waitFor(() => expect(document.getElementsByClassName('bp3-dialog')).toHaveLength(0))
    expect(getElementByText(runTaskRequestConnectorRefInput, 'Sample')).toBeInTheDocument()

    // Region
    const requestDefinitionRegionSelect = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.execution.steps[0].step.spec.runTaskRequestDefinition.spec.region'
    ) as HTMLInputElement
    expect(requestDefinitionRegionSelect).toBeInTheDocument()
    expect(requestDefinitionRegionSelect.value).toBe('')
    expect(requestDefinitionRegionSelect).not.toBeDisabled()
    const requestDefinitionRegionDropdownIcon = dropDownIcons[4]
    await userEvent.click(requestDefinitionRegionDropdownIcon)
    await waitFor(() => expect(portalDivs.length).toBe(3))
    const requestDefinitionRegionDropdownDialogDiv = portalDivs[2]
    const requestDefinitionRegionSelectListMenu = requestDefinitionRegionDropdownDialogDiv.querySelector('.bp3-menu')
    const requestDefinitionRegionItem = await findByText(
      requestDefinitionRegionSelectListMenu as HTMLElement,
      'GovCloud (US-East)'
    )
    await userEvent.click(requestDefinitionRegionItem)
    await waitFor(() => expect(requestDefinitionRegionSelect.value).toBe('GovCloud (US-East)'))

    // Bucket Name
    const requestDefinitionBucketNameSelect = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.execution.steps[0].step.spec.runTaskRequestDefinition.spec.bucketName'
    ) as HTMLInputElement
    expect(requestDefinitionBucketNameSelect).toBeInTheDocument()
    expect(requestDefinitionBucketNameSelect.value).toBe('')
    expect(requestDefinitionBucketNameSelect).not.toBeDisabled()
    const requestDefinitionBucketNameDropdownIcon = dropDownIcons[5]
    await userEvent.click(requestDefinitionBucketNameDropdownIcon)
    await waitFor(() => expect(portalDivs.length).toBe(3))
    const requestDefinitionBucketNameDropdownDialogDiv = portalDivs[2]
    const requestDefinitionBucketNameSelectListMenu =
      requestDefinitionBucketNameDropdownDialogDiv.querySelector('.bp3-menu')
    const requestDefinitionBucketNameItem = await findByText(
      requestDefinitionBucketNameSelectListMenu as HTMLElement,
      'cdng-terraform-state'
    )
    await userEvent.click(requestDefinitionBucketNameItem)
    expect(requestDefinitionBucketNameSelect.value).toBe('cdng-terraform-state')

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
        <Formik initialValues={emptyInitialValuesGitStore} onSubmit={handleSubmit}>
          <ECSRunTaskStepInputSetMode
            initialValues={emptyInitialValuesGitStore}
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
            inputSetData={{
              path: 'pipeline.stages[0].stage.spec.execution.steps[0].step',
              template: templateGitStore,
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
        <Formik initialValues={emptyInitialValuesGitStore} onSubmit={handleSubmit}>
          <ECSRunTaskStepInputSetMode
            initialValues={emptyInitialValuesGitStore}
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
        <Formik initialValues={emptyInitialValuesGitStore} onSubmit={handleSubmit}>
          <ECSRunTaskStepInputSetMode
            initialValues={emptyInitialValuesGitStore}
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION]}
            inputSetData={{
              template: templateGitStore,
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
