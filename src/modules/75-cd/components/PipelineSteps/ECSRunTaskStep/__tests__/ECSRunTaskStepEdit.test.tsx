/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  act,
  fireEvent,
  queryByAttribute,
  render,
  waitFor,
  getByText as getElementByText,
  findByTestId,
  findAllByText,
  findByText,
  getByDisplayValue,
  getByTestId as getElementByTestId
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@harness/uicore'

import { queryByNameAttribute, TestWrapper } from '@common/utils/testUtils'
import { StepFormikRef, StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import connectorsData from '@pipeline/components/ManifestSelection/__tests__/connectors_mock.json'
import { ECSRunTaskStepEditRef } from '../ECSRunTaskStepEdit'
import type { ECSRunTaskStepInitialValues } from '../ECSRunTaskStep'
import { testTaskDefinitionSecondStep, testTaskDefinitionLastStep } from './TaskDefinitionModal.test'

const fetchConnectors = (): Promise<unknown> => Promise.resolve(connectorsData)

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

jest.mock('services/cd-ng', () => ({
  getConnectorListPromise: jest.fn().mockImplementation(() => Promise.resolve(connectorsData)),
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectors })),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: { data: connectorsData.data.content[1] }, refetch: fetchConnectors, loading: false }
  }),
  useGetServiceV2: jest.fn().mockImplementation(() => ({ loading: false, data: {}, refetch: jest.fn() })),
  validateTheIdentifierIsUniquePromise: jest.fn().mockImplementation(() =>
    Promise.resolve({
      status: 'SUCCESS',
      data: true,
      metaData: {},
      correlationId: ''
    })
  )
}))

const doConfigureOptionsTesting = async (cogModal: HTMLElement): Promise<void> => {
  // Type regex and submit
  // check if field has desired value
  await waitFor(() => expect(getElementByText(cogModal, 'common.configureOptions.regex')).toBeInTheDocument())
  const regexRadio = getElementByText(cogModal, 'common.configureOptions.regex')
  userEvent.click(regexRadio)
  const regexTextArea = queryByAttribute('name', cogModal, 'regExValues') as HTMLInputElement
  act((): void => {
    fireEvent.change(regexTextArea!, { target: { value: '<+input>.includes(/test/)' } })
  })
  await waitFor(() => expect(regexTextArea.value).toBe('<+input>.includes(/test/)'))
  const cogSubmit = getElementByText(cogModal, 'submit')
  userEvent.click(cogSubmit)
}

const emptyInitialValues: ECSRunTaskStepInitialValues = {
  identifier: '',
  name: '',
  timeout: '',
  type: StepType.EcsRunTask,
  spec: {}
}
const existingInitialValues: ECSRunTaskStepInitialValues = {
  identifier: 'Existing_Name',
  name: 'Existing Name',
  timeout: '30m',
  type: StepType.EcsRunTask,
  spec: {
    skipSteadyStateCheck: true,
    taskDefinition: {
      type: 'Github',
      spec: {
        connectorRef: 'account.Git_CTR',
        repoName: 'repo1',
        gitFetchType: 'Branch',
        branch: 'branch1',
        paths: ['path1']
      }
    },
    runTaskRequestDefinition: {
      type: 'Github',
      spec: {
        connectorRef: 'account.Git_CTR',
        repoName: 'repo2',
        gitFetchType: 'Branch',
        branch: 'branch2',
        paths: ['path2']
      }
    }
  }
}
const onUpdate = jest.fn()
const onChange = jest.fn()
const formikRef = React.createRef<StepFormikRef<ECSRunTaskStepInitialValues>>()

describe('ECSRunTaskStepEdit tests', () => {
  beforeEach(() => {
    onUpdate.mockReset()
    onChange.mockReset()
  })
  test(`renders fine for empty values and values can be changed`, async () => {
    const { container, getByText, queryByText } = render(
      <TestWrapper>
        <ECSRunTaskStepEditRef
          initialValues={emptyInitialValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          readonly={false}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          onChange={onChange}
          ref={formikRef}
        />
      </TestWrapper>
    )

    // For new step edit icon should be present
    const identifierEditIcon = queryByAttribute('data-icon', container, 'Edit')
    expect(identifierEditIcon).toBeInTheDocument()

    const nameInput = queryByNameAttribute('name', container) as HTMLInputElement
    expect(nameInput).toBeInTheDocument()
    expect(nameInput.value).toBe('')
    act((): void => {
      fireEvent.change(nameInput, { target: { value: 'Test Name' } })
    })
    expect(nameInput.value).toBe('Test Name')
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith({
        identifier: 'Test_Name',
        name: 'Test Name',
        timeout: '',
        type: StepType.EcsRunTask,
        spec: {
          waitForSteadyState: undefined
        }
      })
    )

    // Timeout
    const timeoutInput = queryByNameAttribute('timeout', container) as HTMLInputElement
    expect(timeoutInput).toBeInTheDocument()
    expect(timeoutInput.value).toBe('')
    act(() => {
      fireEvent.change(timeoutInput, { target: { value: '20m' } })
    })
    expect(timeoutInput.value).toBe('20m')

    // Optional Configurations
    const optionalConfigAccordionHeader = getByText('common.optionalConfig')
    userEvent.click(optionalConfigAccordionHeader)
    const skipSteadyStateCheck = await queryByText('cd.steps.ecsRunTaskStep.skipSteadyStateCheck')?.parentElement
    userEvent.click(skipSteadyStateCheck!)

    // Submit form
    act(() => {
      formikRef.current?.submitForm()
    })
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Test_Name',
        name: 'Test Name',
        timeout: '20m',
        spec: {
          skipSteadyStateCheck: true
        },
        type: StepType.EcsRunTask
      })
    )
  })

  test('add name, timeout, Task Definition, Run Task Request Definition to step and submit', async () => {
    const { container, getByText } = render(
      <TestWrapper>
        <ECSRunTaskStepEditRef
          initialValues={emptyInitialValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isNewStep={true}
          readonly={false}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          ref={formikRef}
        />
      </TestWrapper>
    )

    // Name
    const nameInput = queryByNameAttribute('name', container) as HTMLInputElement
    expect(nameInput).toBeInTheDocument()
    expect(nameInput.value).toBe('')
    act((): void => {
      fireEvent.change(nameInput, { target: { value: 'Test Name' } })
    })
    expect(nameInput.value).toBe('Test Name')

    // Timeout
    const timeoutInput = queryByNameAttribute('timeout', container) as HTMLInputElement
    expect(timeoutInput).toBeInTheDocument()
    expect(timeoutInput.value).toBe('')
    act(() => {
      fireEvent.change(timeoutInput, { target: { value: '20m' } })
    })
    expect(timeoutInput.value).toBe('20m')

    // Task Definition
    const addTaskDefinitionBtn = getByText('cd.pipelineSteps.serviceTab.manifest.taskDefinition')
    userEvent.click(addTaskDefinitionBtn)
    const dialogList = document.getElementsByClassName('bp3-dialog')
    const taskDefinitionPortal = dialogList[0] as HTMLElement
    // Test manifest store tiles, choose Git and fill in Connector field
    await testTaskDefinitionSecondStep(taskDefinitionPortal)
    // Fill in required field and submit manifest
    await testTaskDefinitionLastStep(taskDefinitionPortal)
    await waitFor(() => expect(dialogList.length).toBe(0))

    // Task Definition
    const addRunTaskRequestDefinitionBtn = getByText('cd.steps.ecsRunTaskStep.runTaskRequestDefinition')
    userEvent.click(addRunTaskRequestDefinitionBtn)
    await waitFor(() => expect(dialogList.length).toBe(1))
    const runTaskRequestDefinitionPortal = dialogList[0] as HTMLElement
    // Test manifest store tiles, choose Git and fill in Connector field
    await testTaskDefinitionSecondStep(runTaskRequestDefinitionPortal)
    // Fill in required field and submit manifest
    await testTaskDefinitionLastStep(runTaskRequestDefinitionPortal)
    await waitFor(() => expect(dialogList.length).toBe(0))
    act(() => {
      formikRef.current?.submitForm()
    })
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Test_Name',
        name: 'Test Name',
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
              branch: 'testBranch',
              connectorRef: 'account.Git_CTR',
              gitFetchType: 'Branch',
              paths: ['test-path']
            }
          }
        },
        type: StepType.EcsRunTask
      })
    )
  })

  test('Task Definition - choose Git store, create new connector and check if respective auth component is rendered', async () => {
    const { getByText } = render(
      <TestWrapper>
        <ECSRunTaskStepEditRef
          initialValues={emptyInitialValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isNewStep={true}
          readonly={false}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          ref={formikRef}
        />
      </TestWrapper>
    )

    const queryByValueAttribute = (value: string): HTMLElement | null => queryByAttribute('value', portal, value)

    const addTaskDefinitionBtn = getByText('cd.pipelineSteps.serviceTab.manifest.taskDefinition')
    userEvent.click(addTaskDefinitionBtn)
    const portal = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement

    const Git = queryByValueAttribute('Git')
    expect(Git).not.toBeNull()
    userEvent.click(Git!)
    const connnectorRefInput = await findByTestId(portal, /connectorRef/)
    expect(connnectorRefInput).toBeInTheDocument()
    const createNewConnectorBtn = getElementByText(portal, 'newLabel pipeline.manifestType.gitConnectorLabel connector')
    expect(createNewConnectorBtn).toBeInTheDocument()
    userEvent.click(createNewConnectorBtn!)

    // Connector creation - First Step
    const overviewTitle = await findAllByText(portal, 'overview')
    expect(overviewTitle).toHaveLength(2)
    const nameInput = queryByNameAttribute('name', portal)
    act(() => {
      fireEvent.change(nameInput!, { target: { value: 'Test Git Connector' } })
    })
    const firstStepContinueButton = getElementByText(portal, 'continue').parentElement as HTMLElement
    await waitFor(() => expect(firstStepContinueButton).not.toBeDisabled())
    userEvent.click(firstStepContinueButton)
    // Connector creation - Second Step
    const urlType = await findByText(portal, 'common.git.urlType')
    expect(urlType).toBeInTheDocument()
    const repositoryUrlTypeOption = getByDisplayValue(portal, 'Repo')
    // const repositoryUrlTypeOption = await findByText(portal, 'repository')
    userEvent.click(repositoryUrlTypeOption)
    const gitHubRepoUrlInput = queryByNameAttribute('url', portal)
    act(() => {
      fireEvent.change(gitHubRepoUrlInput!, { target: { value: 'https://repo1.com' } })
    })
    const secondStepContinueButton = getElementByText(portal, 'continue').parentElement as HTMLElement
    await waitFor(() => expect(secondStepContinueButton).not.toBeDisabled())
    userEvent.click(secondStepContinueButton)
    // Connector creation - Third Step
    await waitFor(() => expect(queryByNameAttribute('usernametextField', portal)).toBeInTheDocument())
    const patInput = getElementByTestId(portal, 'password')
    expect(patInput).toBeInTheDocument()
  })

  test('Task Definition - choose Github store, create new connector and check if respective auth component is rendered', async () => {
    const { getByText } = render(
      <TestWrapper>
        <ECSRunTaskStepEditRef
          initialValues={emptyInitialValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isNewStep={true}
          readonly={false}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          ref={formikRef}
        />
      </TestWrapper>
    )

    const addTaskDefinitionBtn = getByText('cd.pipelineSteps.serviceTab.manifest.taskDefinition')
    userEvent.click(addTaskDefinitionBtn)
    const portal = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement

    const queryByValueAttribute = (value: string): HTMLElement | null => queryByAttribute('value', portal, value)

    const Github = queryByValueAttribute('Github')
    expect(Github).not.toBeNull()
    userEvent.click(Github!)
    const connnectorRefInput = await findByTestId(portal, /connectorRef/)
    expect(connnectorRefInput).toBeInTheDocument()
    const createNewConnectorBtn = getElementByText(portal, 'newLabel common.repo_provider.githubLabel connector')
    expect(createNewConnectorBtn).toBeInTheDocument()
    userEvent.click(createNewConnectorBtn!)

    // Connector creation - First Step
    const overviewTitle = await findAllByText(portal, 'overview')
    expect(overviewTitle).toHaveLength(2)
    const nameInput = queryByNameAttribute('name', portal)
    act(() => {
      fireEvent.change(nameInput!, { target: { value: 'Test Github Connector' } })
    })
    const firstStepContinueButton = getElementByText(portal, 'continue').parentElement as HTMLElement
    await waitFor(() => expect(firstStepContinueButton).not.toBeDisabled())
    userEvent.click(firstStepContinueButton)
    // Connector creation - Second Step
    const urlType = await findByText(portal, 'common.git.urlType')
    expect(urlType).toBeInTheDocument()
    const repositoryUrlTypeOption = getByDisplayValue(portal, 'Repo')
    // const repositoryUrlTypeOption = await findByText(portal, 'repository')
    userEvent.click(repositoryUrlTypeOption)
    const gitHubRepoUrlInput = queryByNameAttribute('url', portal)
    act(() => {
      fireEvent.change(gitHubRepoUrlInput!, { target: { value: 'https://repo1.com' } })
    })
    const secondStepContinueButton = getElementByText(portal, 'continue').parentElement as HTMLElement
    await waitFor(() => expect(secondStepContinueButton).not.toBeDisabled())
    userEvent.click(secondStepContinueButton)
    // Connector creation - Third Step
    const authenticationHeader = await findByText(portal, 'authentication')
    expect(authenticationHeader).toBeInTheDocument()
    const usernameInput = queryByNameAttribute('usernametextField', portal)
    expect(usernameInput).toBeInTheDocument()
    const patInput = getElementByTestId(portal, 'accessToken')
    expect(patInput).toBeInTheDocument()
  })

  test('Task Definition - choose Bitbucket store, create new connector and check if respective auth component is rendered', async () => {
    const { getByText } = render(
      <TestWrapper>
        <ECSRunTaskStepEditRef
          initialValues={emptyInitialValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isNewStep={true}
          readonly={false}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          ref={formikRef}
        />
      </TestWrapper>
    )

    const queryByValueAttribute = (value: string): HTMLElement | null => queryByAttribute('value', portal, value)

    const addTaskDefinitionBtn = getByText('cd.pipelineSteps.serviceTab.manifest.taskDefinition')
    userEvent.click(addTaskDefinitionBtn)
    const portal = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement

    const Bitbucket = queryByValueAttribute('Bitbucket')
    expect(Bitbucket).not.toBeNull()
    userEvent.click(Bitbucket!)
    const connnectorRefInput = await findByTestId(portal, /connectorRef/)
    expect(connnectorRefInput).toBeInTheDocument()
    const createNewConnectorBtn = getElementByText(portal, 'newLabel pipeline.manifestType.bitBucketLabel connector')
    expect(createNewConnectorBtn).toBeInTheDocument()
    userEvent.click(createNewConnectorBtn!)

    // Connector creation - First Step
    const overviewTitle = await findAllByText(portal, 'overview')
    expect(overviewTitle).toHaveLength(2)
    const nameInput = queryByNameAttribute('name', portal)
    act(() => {
      fireEvent.change(nameInput!, { target: { value: 'Test BitBucket Connector' } })
    })
    const firstStepContinueButton = getElementByText(portal, 'continue').parentElement as HTMLElement
    await waitFor(() => expect(firstStepContinueButton).not.toBeDisabled())
    userEvent.click(firstStepContinueButton)
    // Connector creation - Second Step
    const urlType = await findByText(portal, 'common.git.urlType')
    expect(urlType).toBeInTheDocument()
    const repositoryUrlTypeOption = getByDisplayValue(portal, 'Repo')
    // const repositoryUrlTypeOption = await findByText(portal, 'repository')
    userEvent.click(repositoryUrlTypeOption)
    const gitHubRepoUrlInput = queryByNameAttribute('url', portal)
    act(() => {
      fireEvent.change(gitHubRepoUrlInput!, { target: { value: 'https://repo1.com' } })
    })
    const secondStepContinueButton = getElementByText(portal, 'continue').parentElement as HTMLElement
    await waitFor(() => expect(secondStepContinueButton).not.toBeDisabled())
    userEvent.click(secondStepContinueButton)
    // Connector creation - Third Step
    const authenticationHeader = await findByText(portal, 'authentication')
    expect(authenticationHeader).toBeInTheDocument()
    const usernameInput = queryByNameAttribute('usernametextField', portal)
    expect(usernameInput).toBeInTheDocument()
    const patInput = getElementByTestId(portal, 'password')
    expect(patInput).toBeInTheDocument()
  })

  test('Task Definition - choose GitLab store, create new connector and check if respective auth component is rendered', async () => {
    const { getByText } = render(
      <TestWrapper>
        <ECSRunTaskStepEditRef
          initialValues={emptyInitialValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isNewStep={true}
          readonly={false}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          ref={formikRef}
        />
      </TestWrapper>
    )

    const queryByValueAttribute = (value: string): HTMLElement | null => queryByAttribute('value', portal, value)

    const addTaskDefinitionBtn = getByText('cd.pipelineSteps.serviceTab.manifest.taskDefinition')
    userEvent.click(addTaskDefinitionBtn)
    const portal = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement

    const GitLab = queryByValueAttribute('GitLab')
    expect(GitLab).not.toBeNull()
    userEvent.click(GitLab!)
    const connnectorRefInput = await findByTestId(portal, /connectorRef/)
    expect(connnectorRefInput).toBeInTheDocument()
    const createNewConnectorBtn = getElementByText(portal, 'newLabel common.repo_provider.gitlabLabel connector')
    expect(createNewConnectorBtn).toBeInTheDocument()
    userEvent.click(createNewConnectorBtn!)

    // Connector creation - First Step
    const overviewTitle = await findAllByText(portal, 'overview')
    expect(overviewTitle).toHaveLength(2)
    const nameInput = queryByNameAttribute('name', portal)
    act(() => {
      fireEvent.change(nameInput!, { target: { value: 'Test GitLab Connector' } })
    })
    const firstStepContinueButton = getElementByText(portal, 'continue').parentElement as HTMLElement
    await waitFor(() => expect(firstStepContinueButton).not.toBeDisabled())
    userEvent.click(firstStepContinueButton)
    // Connector creation - Second Step
    const urlType = await findByText(portal, 'common.git.urlType')
    expect(urlType).toBeInTheDocument()
    const repositoryUrlTypeOption = getByDisplayValue(portal, 'Repo')
    // const repositoryUrlTypeOption = await findByText(portal, 'repository')
    userEvent.click(repositoryUrlTypeOption)
    const gitHubRepoUrlInput = queryByNameAttribute('url', portal)
    act(() => {
      fireEvent.change(gitHubRepoUrlInput!, { target: { value: 'https://repo1.com' } })
    })
    const secondStepContinueButton = getElementByText(portal, 'continue').parentElement as HTMLElement
    await waitFor(() => expect(secondStepContinueButton).not.toBeDisabled())
    userEvent.click(secondStepContinueButton)
    // Connector creation - Third Step
    const authenticationHeader = await findByText(portal, 'authentication')
    expect(authenticationHeader).toBeInTheDocument()
    const usernameInput = queryByNameAttribute('usernametextField', portal)
    expect(usernameInput).toBeInTheDocument()
    const patInput = getElementByTestId(portal, 'accessToken')
    expect(patInput).toBeInTheDocument()
  })

  test(`change existing runtime value of timeout using cog`, async () => {
    const initialValues = {
      identifier: 'Existing_Name',
      name: 'Existing Name',
      type: StepType.EcsRunTask,
      timeout: RUNTIME_INPUT_VALUE,
      spec: {}
    }

    const { container } = render(
      <TestWrapper>
        <ECSRunTaskStepEditRef
          initialValues={initialValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isNewStep={true}
          readonly={false}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          ref={formikRef}
        />
      </TestWrapper>
    )

    const modals = document.getElementsByClassName('bp3-dialog')
    expect(modals.length).toBe(0)

    const nameInput = queryByNameAttribute('name', container) as HTMLInputElement
    expect(nameInput).toBeInTheDocument()
    expect(nameInput.value).toBe('Existing Name')

    const timeoutInput = queryByNameAttribute('timeout', container) as HTMLInputElement
    expect(timeoutInput).toBeInTheDocument()
    expect(timeoutInput.value).toBe(RUNTIME_INPUT_VALUE)

    const cogTimeout = document.getElementById('configureOptions_step.timeout')
    userEvent.click(cogTimeout!)
    await waitFor(() => expect(modals.length).toBe(1))
    const timeoutCOGModal = modals[0] as HTMLElement
    await doConfigureOptionsTesting(timeoutCOGModal)

    act(() => {
      formikRef.current?.submitForm()
    })
    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Existing_Name',
        name: 'Existing Name',
        timeout: '<+input>.regex(<+input>.includes(/test/))',
        spec: {},
        type: StepType.EcsRunTask
      })
    )
  })

  test('identifier should not be editable when isNewStep is false', () => {
    const { container } = render(
      <TestWrapper>
        <ECSRunTaskStepEditRef
          initialValues={emptyInitialValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isNewStep={false}
          readonly={false}
          stepViewType={StepViewType.Edit}
          onUpdate={onUpdate}
          onChange={onChange}
          ref={formikRef}
        />
      </TestWrapper>
    )
    const identifierEditIcon = queryByAttribute('data-icon', container, 'Edit')
    expect(identifierEditIcon).not.toBeInTheDocument()
  })

  test('onUpdate should not be called if it is not passed as prop', async () => {
    render(
      <TestWrapper>
        <ECSRunTaskStepEditRef
          initialValues={existingInitialValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isNewStep={false}
          readonly={false}
          stepViewType={StepViewType.Edit}
          onChange={onChange}
          ref={formikRef}
        />
      </TestWrapper>
    )
    act(() => {
      formikRef.current?.submitForm()
    })
    await waitFor(() => expect(onUpdate).not.toHaveBeenCalled())
  })

  test('click on edit Run Task Definition icon and verify existing data', async () => {
    const { getByTestId } = render(
      <TestWrapper>
        <ECSRunTaskStepEditRef
          initialValues={existingInitialValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isNewStep={false}
          readonly={false}
          stepViewType={StepViewType.Edit}
          onChange={onChange}
          ref={formikRef}
          onUpdate={onUpdate}
        />
      </TestWrapper>
    )
    const editIcon = getByTestId('edit-task-definition')
    userEvent.click(editIcon!)

    const dialogList = document.getElementsByClassName('bp3-dialog')
    const portal = dialogList[0] as HTMLElement

    const queryByValueAttribute = (value: string): HTMLElement | null => queryByAttribute('value', portal, value)

    const Github = queryByValueAttribute('Github')
    await waitFor(() => expect(Github).not.toBeNull())
    expect(Github).toBeChecked()
    const connnectorRefInput = await findByTestId(portal, /connectorRef/)
    expect(connnectorRefInput).toBeInTheDocument()
    await waitFor(() => expect(getElementByText(connnectorRefInput, 'Git CTR')).toBeInTheDocument())
    const secondStepContinueButton = getElementByText(portal, 'continue').parentElement as HTMLElement
    await waitFor(() => expect(secondStepContinueButton).not.toBeDisabled())
    userEvent.click(secondStepContinueButton)

    // Final step
    await waitFor(() => expect(getElementByText(portal, 'pipeline.manifestType.gitFetchTypeLabel')).toBeInTheDocument())
    const repoNameInput = queryByNameAttribute('repoName', portal) as HTMLInputElement
    expect(repoNameInput.value).toBe('repo1')
    const gitFetchTypeInput = queryByNameAttribute('gitFetchType', portal) as HTMLInputElement
    expect(gitFetchTypeInput.value).toBe('Latest from Branch')
    const branchInput = queryByNameAttribute('branch', portal) as HTMLInputElement
    expect(branchInput.value).toBe('branch1')
    const path1Input = queryByNameAttribute('paths[0].path', portal) as HTMLInputElement
    expect(path1Input.value).toBe('path1')
    const submitButton = getElementByText(portal, 'submit').parentElement as HTMLElement
    userEvent.click(submitButton)
    await waitFor(() => expect(dialogList.length).toBe(0))

    act(() => {
      formikRef.current?.submitForm()
    })

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Existing_Name',
        name: 'Existing Name',
        timeout: '30m',
        type: StepType.EcsRunTask,
        spec: {
          taskDefinition: {
            spec: {
              connectorRef: 'account.Git_CTR',
              repoName: 'repo1',
              gitFetchType: 'Branch',
              branch: 'branch1',
              paths: ['path1']
            },
            type: 'Github'
          },
          runTaskRequestDefinition: {
            spec: {
              connectorRef: 'account.Git_CTR',
              repoName: 'repo2',
              gitFetchType: 'Branch',
              branch: 'branch2',
              paths: ['path2']
            },
            type: 'Github'
          },
          skipSteadyStateCheck: true
        }
      })
    )
  })

  test('click on edit Run Task Request Definition icon and verify existing data', async () => {
    const { getByTestId } = render(
      <TestWrapper>
        <ECSRunTaskStepEditRef
          initialValues={existingInitialValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isNewStep={false}
          readonly={false}
          stepViewType={StepViewType.Edit}
          onChange={onChange}
          ref={formikRef}
          onUpdate={onUpdate}
        />
      </TestWrapper>
    )
    const editIcon = getByTestId('edit-run-task-request-definition')
    userEvent.click(editIcon!)

    const dialogList = document.getElementsByClassName('bp3-dialog')
    const portal = dialogList[0] as HTMLElement

    const queryByValueAttribute = (value: string): HTMLElement | null => queryByAttribute('value', portal, value)

    const Github = queryByValueAttribute('Github')
    await waitFor(() => expect(Github).not.toBeNull())
    expect(Github).toBeChecked()
    const connnectorRefInput = await findByTestId(portal, /connectorRef/)
    expect(connnectorRefInput).toBeInTheDocument()
    await waitFor(() => expect(getElementByText(connnectorRefInput, 'Git CTR')).toBeInTheDocument())
    const secondStepContinueButton = getElementByText(portal, 'continue').parentElement as HTMLElement
    await waitFor(() => expect(secondStepContinueButton).not.toBeDisabled())
    userEvent.click(secondStepContinueButton)

    // Final step
    await waitFor(() => expect(getElementByText(portal, 'pipeline.manifestType.gitFetchTypeLabel')).toBeInTheDocument())
    const repoNameInput = queryByNameAttribute('repoName', portal) as HTMLInputElement
    expect(repoNameInput.value).toBe('repo2')
    const gitFetchTypeInput = queryByNameAttribute('gitFetchType', portal) as HTMLInputElement
    expect(gitFetchTypeInput.value).toBe('Latest from Branch')
    const branchInput = queryByNameAttribute('branch', portal) as HTMLInputElement
    expect(branchInput.value).toBe('branch2')
    const path1Input = queryByNameAttribute('paths[0].path', portal) as HTMLInputElement
    expect(path1Input.value).toBe('path2')
    const submitButton = getElementByText(portal, 'submit').parentElement as HTMLElement
    userEvent.click(submitButton)
    await waitFor(() => expect(dialogList.length).toBe(0))

    act(() => {
      formikRef.current?.submitForm()
    })

    await waitFor(() =>
      expect(onUpdate).toHaveBeenCalledWith({
        identifier: 'Existing_Name',
        name: 'Existing Name',
        timeout: '30m',
        type: StepType.EcsRunTask,
        spec: {
          taskDefinition: {
            spec: {
              connectorRef: 'account.Git_CTR',
              repoName: 'repo1',
              gitFetchType: 'Branch',
              branch: 'branch1',
              paths: ['path1']
            },
            type: 'Github'
          },
          runTaskRequestDefinition: {
            spec: {
              connectorRef: 'account.Git_CTR',
              repoName: 'repo2',
              gitFetchType: 'Branch',
              branch: 'branch2',
              paths: ['path2']
            },
            type: 'Github'
          },
          skipSteadyStateCheck: true
        }
      })
    )
  })

  test('ECS Run Task Definition - click edit then close modal and verify if modal is closed fine', async () => {
    const { getByTestId } = render(
      <TestWrapper>
        <ECSRunTaskStepEditRef
          initialValues={existingInitialValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isNewStep={false}
          readonly={false}
          stepViewType={StepViewType.Edit}
          onChange={onChange}
          ref={formikRef}
          onUpdate={onUpdate}
        />
      </TestWrapper>
    )
    const editIcon = getByTestId('edit-task-definition')
    userEvent.click(editIcon!)

    const dialogList = document.getElementsByClassName('bp3-dialog')
    const portal = dialogList[0] as HTMLElement
    expect(dialogList.length).toBe(1)

    const crossIcon = portal.querySelector('[data-icon="cross"]')
    userEvent.click(crossIcon!)
    await waitFor(() => expect(dialogList.length).toBe(0))
  })

  test('ECS Run Task Request Definition - click edit then close modal and verify if modal is closed fine', async () => {
    const { getByTestId } = render(
      <TestWrapper>
        <ECSRunTaskStepEditRef
          initialValues={existingInitialValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          isNewStep={false}
          readonly={false}
          stepViewType={StepViewType.Edit}
          onChange={onChange}
          ref={formikRef}
          onUpdate={onUpdate}
        />
      </TestWrapper>
    )
    const editIcon = getByTestId('edit-run-task-request-definition')
    userEvent.click(editIcon!)

    const dialogList = document.getElementsByClassName('bp3-dialog')
    const portal = dialogList[0] as HTMLElement
    expect(dialogList.length).toBe(1)

    const crossIcon = portal.querySelector('[data-icon="cross"]')
    userEvent.click(crossIcon!)
    await waitFor(() => expect(dialogList.length).toBe(0))
  })
})
