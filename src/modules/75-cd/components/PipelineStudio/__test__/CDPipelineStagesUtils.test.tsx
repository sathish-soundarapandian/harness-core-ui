/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, getByText, waitFor, fireEvent } from '@testing-library/react'
import type { StringKeys } from 'framework/strings'
import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import { StageType } from '@pipeline/utils/stageHelpers'
import { getCDPipelineStages as GetCDPipelineStages } from '../CDPipelineStagesUtils'
import { getStageAttributes, getStageEditorImplementation } from '../DeployStage'

const TEST_PATH = routes.toPipelineStudio({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })
const argsMock = {
  showSelectMenu: true,
  contextType: 'Pipeline',
  getNewStageFromType: jest.fn()
}

const argsMockWithOnSelectStage = {
  showSelectMenu: true,
  contextType: 'Pipeline',
  onSelectStage: jest.fn()
}

const argsMockWithSelectMenuFalse = {
  showSelectMenu: false,
  contextType: 'Pipeline'
}

function getString(key: StringKeys): StringKeys {
  return key
}

describe('Testing Empty pipeline stages', () => {
  beforeAll(() => {
    stagesCollection.registerStageFactory(StageType.DEPLOY, getStageAttributes, getStageEditorImplementation)
  })
  test('should render empty stage view on right section when no stagetype is rendered', async () => {
    const { container } = render(
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
        <GetCDPipelineStages getString={jest.fn()} args={argsMock} />
      </TestWrapper>
    )
    const addStage = await waitFor(() => getByText(document.body, 'pipeline.addStage.description'))
    expect(addStage).toBeTruthy()
    expect(container).toMatchSnapshot()
  })

  test('should call getNewStageFromType when onSelectStage is not passed and Deploy is selected', async () => {
    render(
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
        <GetCDPipelineStages getString={getString} args={argsMock} isCDEnabled={true} />
      </TestWrapper>
    )

    const deployStage = await waitFor(() => getByText(document.body, 'pipelineSteps.deploy.create.deployStageName'))
    expect(deployStage).toBeTruthy()
    const deployIcon = document.querySelector("span[data-icon='cd-main']") as HTMLElement
    fireEvent.click(deployIcon)
    expect(argsMock.getNewStageFromType).toBeCalledWith(StageType.DEPLOY, true)
  })

  test('should call onSelectStage when onSelectStage is passed and Deploy is selected', async () => {
    render(
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
        <GetCDPipelineStages getString={getString} args={argsMockWithOnSelectStage} isCDEnabled={true} />
      </TestWrapper>
    )

    const deployStage = await waitFor(() => getByText(document.body, 'pipelineSteps.deploy.create.deployStageName'))
    expect(deployStage).toBeTruthy()
    const deployIcon = document.querySelector("span[data-icon='cd-main']") as HTMLElement
    fireEvent.click(deployIcon)
    expect(argsMock.getNewStageFromType).toHaveBeenCalledWith(StageType.DEPLOY, true)
  })

  test('should render nothing when showSelectMenu is false', async () => {
    const { container } = render(
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
        <GetCDPipelineStages getString={getString} args={argsMockWithSelectMenuFalse} isCDEnabled={true} />
      </TestWrapper>
    )
    expect(container).toMatchInlineSnapshot(`<div />`)
  })
})
