/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  render,
  waitFor,
  getByText as getByTextBody,
  fireEvent,
  RenderResult,
  getByTestId,
  act
} from '@testing-library/react'
import { deleteDB } from 'idb'
import environments from '@cd/components/PipelineSteps/DeployEnvStep/__tests__/mock.json'
import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import routes from '@common/RouteDefinitions'
import CDPipelineStudio from '@cd/pages/pipeline-studio/CDPipelineStudio'
import StageBuilder from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilder'
import {
  PipelineResponse,
  StepsResponse,
  ExecutionResponse,
  YamlResponse
} from '@pipeline/components/PipelineStudio/__tests__/PipelineStudioMocks'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import services from '@cd/components/PipelineSteps/DeployServiceStep/__tests__/serviceMock'
// eslint-disable-next-line no-restricted-imports
import '@cd/components/PipelineStudio/DeployStage'
// eslint-disable-next-line no-restricted-imports
import '@ci/components/PipelineStudio/BuildStage'
// eslint-disable-next-line no-restricted-imports
import '@cf/pages/pipeline-studio/views/FeatureFlagStage'
// eslint-disable-next-line no-restricted-imports
import '@cd/components/PipelineSteps'
// eslint-disable-next-line no-restricted-imports
import '@ci/components/PipelineSteps'
import { PipelineDBName } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'

jest.mock('@common/utils/YamlUtils', () => ({ useValidationError: () => ({ errorMap: new Map() }) }))
// eslint-disable-next-line react/display-name
jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const fetchConnectors = (): Promise<unknown> => Promise.resolve({})
window.HTMLElement.prototype.scrollTo = jest.fn()

jest.mock('services/portal', () => ({
  useGetDelegateSelectorsUpTheHierarchy: jest.fn(() => ({}))
}))

jest.mock('services/cd-ng', () => ({
  useGetConnectorListV2: jest.fn(() => ({ mutate: fetchConnectors })),
  useGetConnector: jest.fn(() => ({ loading: false, refetch: jest.fn(), data: undefined })),
  useGetTestConnectionResult: jest.fn(() => ({ mutate: jest.fn() })),
  useGetTestGitRepoConnectionResult: jest.fn(() => ({ mutate: jest.fn() })),
  useGetSteps: jest.fn(() => ({ loading: false, refetch: jest.fn(), data: StepsResponse })),
  useGetExecutionStrategyList: jest.fn(() => ({ loading: false, data: ExecutionResponse })),
  useGetExecutionStrategyYaml: jest.fn(() => ({ loading: false, data: YamlResponse })),
  useGetServiceListForProject: jest.fn(() => ({ loading: false, data: services, refetch: jest.fn() })),
  useGetEnvironmentListForProject: jest.fn(() => ({ loading: false, data: environments, refetch: jest.fn() }))
}))

jest.mock('services/pipeline-ng', () => ({
  useGetYamlSchema: jest.fn(() => ({ loading: false, data: null, refetch: jest.fn() })),
  getPipelinePromise: jest.fn(() => Promise.resolve(PipelineResponse)),
  useGetSteps: jest.fn(() => ({ loading: false, refetch: jest.fn(), data: StepsResponse })),
  useCreateVariablesV2: jest.fn(() => ({ mutate: jest.fn(), loading: false, cancel: jest.fn() }))
}))

jest.mock('resize-observer-polyfill', () => {
  class ResizeObserver {
    static default = ResizeObserver
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    observe() {
      // do nothing
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    unobserve() {
      // do nothing
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    disconnect() {
      // do nothing
    }
  }
  return ResizeObserver
})

const TEST_PATH = routes.toPipelineStudio({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })

// eslint-disable-next-line jest/no-disabled-tests
describe.skip('Stage Builder Test', () => {
  let stageBuilder: HTMLElement
  let getByTextContainer: RenderResult['getByText']
  beforeEach(async () => {
    const { container, getByText } = render(
      <TestWrapper
        path={TEST_PATH}
        pathParams={{
          accountId: 'testAcc',
          orgIdentifier: 'testOrg',
          projectIdentifier: 'test',
          pipelineIdentifier: 'editPipeline',
          module: 'cd'
        }}
        defaultAppStoreValues={defaultAppStoreValues}
      >
        <CDPipelineStudio>
          <StageBuilder />
        </CDPipelineStudio>
      </TestWrapper>
    )
    await waitFor(() => getByText('asd'))
    stageBuilder = container
    getByTextContainer = getByText
  })

  afterEach(async () => {
    await deleteDB(PipelineDBName)
  })

  // eslint-disable-next-line jest/no-disabled-tests
  test('should test stage builder and perform new stage addition', async () => {
    act(() => {
      // Click Create New Stage
      const createNewBtn = stageBuilder.querySelector('.defaultCard.createNew')

      fireEvent.click(createNewBtn as HTMLElement)
    })

    await act(async () => {
      const deployBtn = await waitFor(() => getByTestId(document.body, 'stage-Deployment'))

      // Select Deploy
      fireEvent.click(deployBtn as Element)
    })

    await waitFor(() => getByTextBody(document.body, 'pipelineSteps.build.create.aboutYourStage'))
    const stageName = document.body.querySelector('[name="name"]')
    // Enter Stage Name
    fireEvent.change(stageName!, { target: { value: 'New Stage' } })
    await waitFor(() => getByTextBody(document.body, 'New_Stage'))
    const setupStage = getByTextBody(document.body, 'pipelineSteps.build.create.setupStage')
    // Click Setup
    fireEvent.click(setupStage)
    await waitFor(() => getByTextBody(document.body, 'cd.pipelineSteps.serviceTab.specifyYourService'))
    let next = getByTextContainer('next')
    // Click Next to go to Infra
    fireEvent.click(next)
    await waitFor(() => getByTextBody(document.body, 'cd.pipelineSteps.environmentTab.specifyYourEnvironment'))
    // Click Next to go to Execution Tab
    next = getByTextContainer('next')
    fireEvent.click(next)
    await waitFor(() => expect(stageBuilder.querySelector('.bp3-tab-panel [icon="plus"]')).toBeDefined())
  }, 20000)

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('should test stage builder and perform edit an stage', async () => {
    // Select an Existing Stage
    const stage = getByTextContainer('asd')
    fireEvent.click(stage)
    await waitFor(() => getByTextContainer('pipelineSteps.serviceTab.specifyYourService'))

    let next = getByTextContainer('next')
    // Click Next to go to Infra
    fireEvent.click(next)
    await waitFor(() => getByTextContainer('cd.pipelineSteps.environmentTab.specifyYourEnvironment'))
    // Click Next to go to Execution Tab
    next = getByTextContainer('next')
    fireEvent.click(next)
    await waitFor(() => expect(stageBuilder.querySelector('.bp3-tab-panel [icon="plus"]')).toBeDefined())
    // Click New Step
    const newStep = stageBuilder.querySelector('.bp3-tab-panel [icon="plus"]')
    fireEvent.click(newStep as HTMLElement)
    await waitFor(() => getByTextBody(document.body, 'addStep'))
    // Select Add Step
    const addStep = getByTextBody(document.body, 'addStep')
    fireEvent.click(addStep)
    await waitFor(() => getByTextBody(document.body, 'stepPalette.title'))
    // Select the ShellScript Step
    const shellScriptAddStep = getByTextBody(document.body, 'Shell Script')
    fireEvent.click(shellScriptAddStep)
    await waitFor(() => getByTextContainer('Shell Script'))
    // Configure Shell Script Step
    const shellScriptStep = getByTextContainer('Shell Script')
    fireEvent.click(shellScriptStep)
    await waitFor(() => getByTextBody(document.body, 'Step Configuration'))
    // Enter name in shell script step
    const nameField = document.body.querySelector('#bp3-tab-panel_step-commands_step-configuration [name="name"]')
    fireEvent.change(nameField as HTMLElement, { target: { value: 'Test Shell Script' } })
    // // Now Submit the configuration
    const submitBtn = document.body.querySelector('#bp3-tab-panel_step-commands_step-configuration button')
    fireEvent.click(submitBtn!)
    await waitFor(() => getByTextContainer('Save'))
    // Save the Execution Step
    const saveBtn = getByTextContainer('Save')
    fireEvent.click(saveBtn)
    await waitFor(() => expect(stageBuilder.querySelector('.SplitPane')).toBeNull())
  }, 20000)

  test('should test stage builder group stage', async () => {
    // Select an Existing Stage
    const stage = getByTextContainer('asd')
    fireEvent.click(stage)

    await waitFor(() => getByTextBody(document.body, 'test1'))
    const newStage = getByTextBody(document.body, 'test1')
    fireEvent.click(newStage)

    await waitFor(() => expect(stageBuilder.querySelector('.iconGroup')).toBeDefined())
  }, 20000)

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('should test remove stage', async () => {
    // Hover node
    const stage = getByTextContainer('asd')
    fireEvent.mouseOver(stage)
    await waitFor(() => expect(stage.parentElement?.querySelector('[icon="cross"]')).toBeDefined())
    const removeBtn = stage.parentElement?.querySelector('[icon="cross"]')
    fireEvent.click(removeBtn as HTMLElement)
  }, 10000)

  test('should test stage builder and perform select Execution Strategy', async () => {
    // Click Create New Stage
    const createNewBtn = stageBuilder.querySelector('.defaultCard.createNew')
    fireEvent.click(createNewBtn as HTMLElement)
    const deployBtn = await waitFor(() => getByTestId(document.body, 'stage-Deployment'))
    // Select Deploy
    fireEvent.click(deployBtn as Element)
    await waitFor(() => getByTextBody(document.body, 'pipelineSteps.build.create.aboutYourStage'))
    const stageName = document.body.querySelector('[name="name"]')
    // Enter Stage Name
    fireEvent.change(stageName!, { target: { value: 'New Stage 1' } })
    await waitFor(() => expect(getByTextBody(document.body, 'New_Stage_1')).toBeDefined())
    const setupStage = getByTextBody(document.body, 'pipelineSteps.build.create.setupStage')
    // Click Setup
    fireEvent.click(setupStage)
    await waitFor(() => getByTextBody(document.body, 'cd.pipelineSteps.serviceTab.specifyYourService'))
    // Click Next to go to Execution Tab
    const executionTab = getByTextContainer('executionText')
    fireEvent.click(executionTab)
    // await waitFor(() => expect(getByTextBody(document.body, 'Execution Strategy')).toBeDefined())
    // Select Execution Strategy
    // const selectStrategy = getByTextBody(document.body, 'Select Strategy')
    // fireEvent.click(selectStrategy)
  }, 20000)

  // eslint-disable-next-line jest/no-disabled-tests
  test.skip('should not allow duplicate / empty stage name', async () => {
    // Click Create New Stage
    const createNewBtn = stageBuilder.querySelector('.defaultCard.createNew')
    fireEvent.click(createNewBtn as HTMLElement)
    const deployBtn = await waitFor(() => getByTestId(document.body, 'stage-Deployment'))
    // Select Deploy
    fireEvent.click(deployBtn as Element)
    await waitFor(() => getByTextBody(document.body, 'pipelineSteps.build.create.aboutYourStage'))
    const stageName = document.body.querySelector('[name="name"]')
    // Give duplicate stage name and check for error message
    fireEvent.change(stageName!, { target: { value: 'New Stage' } })
    await waitFor(() => expect(getByTextBody(document.body, 'New_Stage')).toBeDefined())
    const setupStage = getByTextBody(document.body, 'pipelineSteps.build.create.setupStage')
    // Click Setup
    fireEvent.click(setupStage)
    // Dialog box should still be open
    expect(getByTextBody(document.body, 'pipelineSteps.build.create.aboutYourStage')).toBeDefined()
    await waitFor(() => expect(getByTextBody(document.body, 'validation.identifierDuplicate')).toBeDefined())

    // Give empty stage name and check for error message
    fireEvent.click(createNewBtn as HTMLElement)
    fireEvent.click(deployBtn as Element)
    await waitFor(() => getByTextBody(document.body, 'pipelineSteps.build.create.aboutYourStage'))
    fireEvent.change(stageName!, { target: { value: '' } })
    fireEvent.click(setupStage)
    // Dialog box should still be open
    expect(getByTextBody(document.body, 'pipelineSteps.build.create.aboutYourStage')).toBeDefined()
    await waitFor(() =>
      expect(getByTextBody(document.body, 'pipelineSteps.build.create.stageNameRequiredError')).toBeDefined()
    )
  }, 20000)
})
