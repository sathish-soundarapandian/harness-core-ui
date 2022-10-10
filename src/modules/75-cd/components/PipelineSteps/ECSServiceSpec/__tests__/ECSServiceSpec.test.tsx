/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { queryByNameAttribute } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import type { ModulePathParams, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import { modulePathProps, pipelinePathProps, projectPathProps } from '@common/utils/routeUtils'
import { connectorsData } from '@connectors/pages/connectors/__tests__/mockData'
import { TestStepWidget, factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { pipelineContextECSManifests } from '@pipeline/components/PipelineStudio/PipelineContext/__tests__/helper'
import { getYaml, mockBuildList, initialManifestRuntimeValues, ecsManifestTemplate } from './helpers/helper'
import { ECSServiceSpec } from '../ECSServiceSpec'

const fetchConnector = jest.fn().mockReturnValue({ data: connectorsData.data?.content?.[1] })
const fetchConnectorList = (): Promise<unknown> => Promise.resolve(connectorsData)

jest.mock('services/cd-ng', () => ({
  getConnectorListV2: () => Promise.resolve(connectorsData),
  getConnectorListPromise: jest.fn().mockImplementation(() => Promise.resolve(connectorsData)),
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectorList })),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: { data: connectorsData.data.content[1] }, refetch: fetchConnector, loading: false }
  }),
  useGetServiceV2: jest.fn().mockImplementation(() => ({ loading: false, data: {}, refetch: jest.fn() })),
  getConnectorListV2Promise: () => Promise.resolve(connectorsData),
  getBuildDetailsForArtifactoryArtifactWithYamlPromise: () => Promise.resolve(mockBuildList),
  getBuildDetailsForDockerPromise: () => Promise.resolve(mockBuildList),
  getBuildDetailsForEcrPromise: () => Promise.resolve(mockBuildList),
  getBuildDetailsForNexusArtifactPromise: () => Promise.resolve(mockBuildList)
}))

const TEST_PATH = routes.toPipelineStudio({ ...projectPathProps, ...modulePathProps, ...pipelinePathProps })
const TEST_PATH_PARAMS: ModulePathParams & PipelinePathProps = {
  accountId: 'testAccountId',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'testProject',
  pipelineIdentifier: 'Pipeline_1',
  module: 'cd'
}

factory.registerStep(new ECSServiceSpec())

const existingInitialValues = {
  artifacts: {
    primary: {
      spec: {
        connectorRef: 'ws_Connector_1',
        region: 'US East (N. Virginia)',
        cluster: 'aws-cluster-1'
      }
    }
  }
}

describe('ECSInfraSpec tests', () => {
  test('check service tab for given pipeline state from context', async () => {
    const { getByText, findAllByText, getAllByText } = render(
      <PipelineContext.Provider value={pipelineContextECSManifests}>
        <TestStepWidget
          testWrapperProps={{
            path: TEST_PATH,
            pathParams: TEST_PATH_PARAMS as unknown as Record<string, string>
          }}
          initialValues={{
            isReadonlyServiceMode: false
          }}
          readonly={false}
          type={StepType.EcsService}
          stepViewType={StepViewType.Edit}
        />
      </PipelineContext.Provider>
    )

    // There should be only 2 Add buttons because EcsTaskDefinition and EcsServiceDefinition allows only 1 manifest addition
    const allPlusAddManifestButtons = await findAllByText(/common.addName/)
    expect(allPlusAddManifestButtons).toHaveLength(2)

    // Check if section is rendered with correct header and list items
    // Task Definition
    expect(getByText('cd.pipelineSteps.serviceTab.manifest.taskDefinition')).toBeInTheDocument()
    expect(getByText('TaskDefinition_Manifest')).toBeInTheDocument()
    // Service Definition
    expect(getByText('cd.pipelineSteps.serviceTab.manifest.serviceDefinition')).toBeInTheDocument()
    expect(getByText('ServiceDefinition_Manifest')).toBeInTheDocument()

    // Scalling Policy and Scalable Target Definition
    expect(getAllByText('common.headerWithOptionalText')).toHaveLength(2)
    // Scalling Policy
    expect(getByText('ScallingPolicy_Manifest')).toBeInTheDocument()
    // Scalable Target Definition
    expect(getByText('ScalableTarget_Manifest')).toBeInTheDocument()
  })

  test('check Input Set view for manifest', async () => {
    const { container, getByText, getAllByText } = render(
      <TestStepWidget
        testWrapperProps={{
          path: TEST_PATH,
          pathParams: TEST_PATH_PARAMS as unknown as Record<string, string>
        }}
        initialValues={initialManifestRuntimeValues}
        allValues={initialManifestRuntimeValues}
        readonly={false}
        type={StepType.EcsService}
        stepViewType={StepViewType.InputSet}
        template={ecsManifestTemplate}
        path={'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition'}
      />
    )

    // 4 connectorRef fields should appear
    const allConnectorRefInput = getAllByText('connector')
    expect(allConnectorRefInput).toHaveLength(4)

    // Task Definition
    const taskDefinitionBranchInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.manifests[0].manifest.spec.store.spec.branch',
      container
    )
    expect(taskDefinitionBranchInput).toBeInTheDocument()
    const taskDefinitionPathInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.manifests[0].manifest.spec.store.spec.paths[0]',
      container
    )
    expect(taskDefinitionPathInput).toBeInTheDocument()

    // Service Definition
    const serviceDefinitionBranchInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.manifests[1].manifest.spec.store.spec.branch',
      container
    )
    expect(serviceDefinitionBranchInput).toBeInTheDocument()
    const serviceDefinitionPathInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.manifests[1].manifest.spec.store.spec.paths[0]',
      container
    )
    expect(serviceDefinitionPathInput).toBeInTheDocument()

    // Scalling Policy
    const scallingPolicyBranchInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.manifests[2].manifest.spec.store.spec.branch',
      container
    )
    expect(scallingPolicyBranchInput).toBeInTheDocument()
    const scallingPolicyPathInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.manifests[2].manifest.spec.store.spec.paths[0]',
      container
    )
    expect(scallingPolicyPathInput).toBeInTheDocument()

    // Scalable Target
    const scalableTargetBranchInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.manifests[3].manifest.spec.store.spec.branch',
      container
    )
    expect(scalableTargetBranchInput).toBeInTheDocument()
    const scalableTargetPathInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.manifests[3].manifest.spec.store.spec.paths[0]',
      container
    )
    expect(scalableTargetPathInput).toBeInTheDocument()

    const submitBtn = getByText('Submit')
    userEvent.click(submitBtn)
  })

  test('when template is empty object, no fields should be rendered', async () => {
    const { queryByText } = render(
      <TestStepWidget
        testWrapperProps={{
          path: TEST_PATH,
          pathParams: TEST_PATH_PARAMS as unknown as Record<string, string>
        }}
        initialValues={initialManifestRuntimeValues}
        allValues={initialManifestRuntimeValues}
        readonly={false}
        type={StepType.EcsService}
        stepViewType={StepViewType.InputSet}
        template={{}}
        path={'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition'}
      />
    )

    const connectorRefInput = queryByText('connector')
    expect(connectorRefInput).not.toBeInTheDocument()
  })

  test('Variables view renders fine', async () => {
    const { getByTestId } = render(
      <TestStepWidget
        testWrapperProps={{
          path: TEST_PATH,
          pathParams: TEST_PATH_PARAMS as unknown as Record<string, string>
        }}
        initialValues={existingInitialValues}
        type={StepType.EcsService}
        stepViewType={StepViewType.InputVariable}
        isNewStep={true}
        customStepProps={{
          stageIdentifier: 'qaStage',
          variablesData: existingInitialValues,
          path: 'pipeline.stages.qaStage.artifacts.primary.spec',
          metadataMap: {
            Aws_Connector_1: {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.artifacts.primary.spec.EcsService.connectorRef',
                localName: 'spec.EcsService.connectorRef'
              }
            },
            'US East (N. Virginia)': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.artifacts.primary.spec.EcsService.region',
                localName: 'spec.EcsService.region'
              }
            },
            'aws-cluster-1': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.artifacts.primary.spec.EcsService.cluster',
                localName: 'spec.EcsService.cluster'
              }
            }
          }
        }}
      />
    )

    const artifactsAccordion = getByTestId('pipeline.stages.qaStage.artifacts.primary.spec.Artifacts-summary')
    expect(artifactsAccordion).toBeInTheDocument()
  })
})

const connectorRefPath =
  'pipeline.stages.0.stage.spec.serviceConfig.serviceDefinition.spec.manifests.0.manifest.spec.store.spec.connectorRef'
const connectorArtifactPrimaryRefPath =
  'pipeline.stages.0.stage.spec.serviceConfig.serviceDefinition.spec.artifacts.primary.spec.connectorRef'
const dockerArtifactPrimaryRefPath =
  'pipeline.stages.0.stage.spec.serviceConfig.serviceDefinition.spec.artifacts.primary.spec.tag'
const artifactoryArtifactTagListPath =
  'pipeline.stages.0.stage.spec.serviceConfig.serviceDefinition.spec.artifacts.sidecars.0.sidecar.spec.tag'
const ecrArtifactTagListPath =
  'pipeline.stages.0.stage.spec.serviceConfig.serviceDefinition.spec.artifacts.sidecars.1.sidecar.spec.tag'
const nexuaArtifactTagListPath =
  'pipeline.stages.0.stage.spec.serviceConfig.serviceDefinition.spec.artifacts.sidecars.2.sidecar.spec.tag'

const params = () => ({
  accountId: 'accountId',
  module: 'cd',
  orgIdentifier: 'default',
  pipelineIdentifier: '-1',
  projectIdentifier: 'projectIdentifier'
})

describe('Autocomplete fields test', () => {
  test('getManifestConnectorsListForYaml test', async () => {
    const step = new ECSServiceSpec() as any
    let list: CompletionItemInterface[]
    list = await step.getManifestConnectorsListForYaml(connectorRefPath, getYaml(), params)
    expect(list).toHaveLength(7)
    expect(list[1].insertText).toBe('account.Git_CTR')
    list = await step.getManifestConnectorsListForYaml('invalid path', getYaml(), params)
    expect(list).toHaveLength(0)
  })

  test('getArtifactsPrimaryConnectorsListForYaml test', async () => {
    const step = new ECSServiceSpec() as any
    let list: CompletionItemInterface[]
    list = await step.getArtifactsPrimaryConnectorsListForYaml(connectorArtifactPrimaryRefPath, getYaml(), params)
    expect(list).toHaveLength(7)
    expect(list[1].insertText).toBe('account.Git_CTR')
    list = await step.getArtifactsPrimaryConnectorsListForYaml('invalid path', getYaml(), params)
    expect(list).toHaveLength(0)
  })

  test('getArtifactsTagsListForYaml test', async () => {
    const step = new ECSServiceSpec() as any
    let list: CompletionItemInterface[]

    // ArtifactoryRegistry
    list = await step.getArtifactsTagsListForYaml(artifactoryArtifactTagListPath, getYaml(), params)
    expect(list).toHaveLength(2)
    expect(list[0].insertText).toBe('latesttag')
    list = await step.getArtifactsTagsListForYaml('invalid path', getYaml(), params)
    expect(list).toHaveLength(0)

    // DockerRegistry
    list = await step.getArtifactsTagsListForYaml(dockerArtifactPrimaryRefPath, getYaml(), params)
    expect(list).toHaveLength(2)
    expect(list[0].insertText).toBe('latesttag')
    list = await step.getArtifactsTagsListForYaml('invalid path', getYaml(), params)
    expect(list).toHaveLength(0)

    // ECR
    list = await step.getArtifactsTagsListForYaml(ecrArtifactTagListPath, getYaml(), params)
    expect(list).toHaveLength(2)
    expect(list[0].insertText).toBe('latesttag')
    list = await step.getArtifactsTagsListForYaml('invalid path', getYaml(), params)
    expect(list).toHaveLength(0)

    // Nexus
    list = await step.getArtifactsTagsListForYaml(nexuaArtifactTagListPath, getYaml(), params)
    expect(list).toHaveLength(2)
    expect(list[0].insertText).toBe('latesttag')
    list = await step.getArtifactsTagsListForYaml('invalid path', getYaml(), params)
    expect(list).toHaveLength(0)
  })
})
