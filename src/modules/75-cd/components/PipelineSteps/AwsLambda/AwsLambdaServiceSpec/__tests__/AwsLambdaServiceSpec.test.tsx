/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, within } from '@testing-library/react'
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
import { pipelineContextAwsLambdaManifests } from '@pipeline/components/PipelineStudio/PipelineContext/__tests__/helper'
import {
  awsRegionsData,
  bucketListData
} from '@pipeline/components/ManifestSelection/ManifestWizardSteps/ECSWithS3/__tests__/mocks'
import {
  getYaml,
  mockBuildList,
  initialManifestRuntimeValuesGitStore,
  awsLambdaManifestTemplateGitStore
} from './helpers/helper'
import { AwsLambdaServiceSpec } from '../AwsLambdaServiceSpec'

const connectorData = { data: connectorsData.data.content[1] }
const fetchConnector = jest.fn().mockReturnValue(connectorData)
const fetchConnectorList = (): Promise<unknown> => Promise.resolve(connectorsData)
const fetchBuckets = jest.fn().mockReturnValue(bucketListData)

jest.mock('services/cd-ng', () => ({
  getConnectorListV2: () => Promise.resolve(connectorsData),
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectorList })),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: connectorData, refetch: fetchConnector, loading: false }
  }),
  useGetServiceV2: jest.fn().mockImplementation(() => ({ loading: false, data: {}, refetch: jest.fn() })),
  getConnectorListV2Promise: () => Promise.resolve(connectorsData),
  getBuildDetailsForArtifactoryArtifactWithYamlPromise: () => Promise.resolve(mockBuildList),
  getBuildDetailsForDockerPromise: () => Promise.resolve(mockBuildList),
  getBuildDetailsForEcrPromise: () => Promise.resolve(mockBuildList),
  getBuildDetailsForNexusArtifactPromise: () => Promise.resolve(mockBuildList),
  useGetBucketsInManifests: jest.fn().mockImplementation(() => {
    return { data: bucketListData, refetch: fetchBuckets, error: null, loading: false }
  })
}))

jest.mock('services/portal', () => ({
  useListAwsRegions: jest.fn().mockImplementation(() => {
    return { data: awsRegionsData, refetch: jest.fn(), error: null, loading: false }
  })
}))

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => {
    return { data: bucketListData, refetch: fetchBuckets, error: null, loading: false }
  })
}))

const TEST_PATH = routes.toPipelineStudio({ ...projectPathProps, ...modulePathProps, ...pipelinePathProps })
const TEST_PATH_PARAMS: ModulePathParams & PipelinePathProps = {
  accountId: 'testAccountId',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'testProject',
  pipelineIdentifier: 'Pipeline_1',
  module: 'cd'
}

factory.registerStep(new AwsLambdaServiceSpec())

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

describe('AwsLambdaServiceSpec tests', () => {
  test('check service tab for given pipeline state from context', async () => {
    render(
      <PipelineContext.Provider value={pipelineContextAwsLambdaManifests}>
        <TestStepWidget
          testWrapperProps={{
            path: TEST_PATH,
            pathParams: TEST_PATH_PARAMS as unknown as Record<string, string>
          }}
          initialValues={{
            isReadonlyServiceMode: false
          }}
          readonly={false}
          type={StepType.AwsLambdaService}
          stepViewType={StepViewType.Edit}
        />
      </PipelineContext.Provider>
    )

    // There should be 1 Add button, because for AwsLambdaFunctionAliasDefinition multiple are allowed
    // while only 1 is allowed for AwsLambdaFunctionDefinition
    const allPlusAddManifestButtons = await screen.findAllByText(/common.addName/)
    expect(allPlusAddManifestButtons).toHaveLength(1)
    // Check if section is rendered with correct header and list items
    // Function Definition
    const functionDefinitionHeaderContainer = screen.getByTestId('function-definition-header-container')
    expect(
      within(functionDefinitionHeaderContainer).getByText('pipeline.manifestTypeLabels.AwsLambdaFunctionDefinition')
    ).toBeInTheDocument()
    expect(screen.getByText('AwsLambdaFunctionDefinition_Manifest')).toBeInTheDocument()
    // Function Alias Definition
    expect(screen.getByText('common.headerWithOptionalText')).toBeInTheDocument()
    expect(screen.getByText('AwsLambdaFunctionAliasDefinition_Manifest')).toBeInTheDocument()
  })

  test('check Input Set view for manifest when manifestStore is Git', async () => {
    const { container, getByText, getAllByText } = render(
      <TestStepWidget
        testWrapperProps={{
          path: TEST_PATH,
          pathParams: TEST_PATH_PARAMS as unknown as Record<string, string>
        }}
        initialValues={initialManifestRuntimeValuesGitStore}
        allValues={initialManifestRuntimeValuesGitStore}
        readonly={false}
        type={StepType.AwsLambdaService}
        stepViewType={StepViewType.InputSet}
        template={awsLambdaManifestTemplateGitStore}
        path={'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition'}
      />
    )

    // 2 connectorRef fields should appear
    const allConnectorRefInput = getAllByText('connector')
    expect(allConnectorRefInput).toHaveLength(2)

    // Task Definition
    const awsLambdaFunctionDefinitionBranchInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.manifests[0].manifest.spec.store.spec.branch',
      container
    )
    expect(awsLambdaFunctionDefinitionBranchInput).toBeInTheDocument()
    const awsLambdaFunctionDefinitionPathInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.manifests[0].manifest.spec.store.spec.paths[0]',
      container
    )
    expect(awsLambdaFunctionDefinitionPathInput).toBeInTheDocument()

    // Service Definition
    const awsLambdaFunctionAliasDefinitionBranchInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.manifests[1].manifest.spec.store.spec.branch',
      container
    )
    expect(awsLambdaFunctionAliasDefinitionBranchInput).toBeInTheDocument()
    const awsLambdaFunctionAliasDefinitionPathInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.manifests[1].manifest.spec.store.spec.paths[0]',
      container
    )
    expect(awsLambdaFunctionAliasDefinitionPathInput).toBeInTheDocument()

    const submitBtn = getByText('Submit')
    await userEvent.click(submitBtn)
  })

  test('when template is empty object, no fields should be rendered', async () => {
    const { queryByText } = render(
      <TestStepWidget
        testWrapperProps={{
          path: TEST_PATH,
          pathParams: TEST_PATH_PARAMS as unknown as Record<string, string>
        }}
        initialValues={initialManifestRuntimeValuesGitStore}
        allValues={initialManifestRuntimeValuesGitStore}
        readonly={false}
        type={StepType.AwsLambdaService}
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
        type={StepType.AwsLambdaService}
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
const ecrArtifactTagListPath =
  'pipeline.stages.0.stage.spec.serviceConfig.serviceDefinition.spec.artifacts.primary.spec.tag'

const params = () => ({
  accountId: 'accountId',
  module: 'cd',
  orgIdentifier: 'default',
  pipelineIdentifier: '-1',
  projectIdentifier: 'projectIdentifier'
})

describe('Autocomplete fields test', () => {
  test('getManifestConnectorsListForYaml test', async () => {
    const step = new AwsLambdaServiceSpec() as any
    let list: CompletionItemInterface[]
    list = await step.getManifestConnectorsListForYaml(connectorRefPath, getYaml(), params)
    expect(list).toHaveLength(7)
    expect(list[1].insertText).toBe('account.Git_CTR')
    list = await step.getManifestConnectorsListForYaml('invalid path', getYaml(), params)
    expect(list).toHaveLength(0)
  })

  test('getArtifactsPrimaryConnectorsListForYaml test', async () => {
    const step = new AwsLambdaServiceSpec() as any
    let list: CompletionItemInterface[]
    list = await step.getArtifactsPrimaryConnectorsListForYaml(connectorArtifactPrimaryRefPath, getYaml(), params)
    expect(list).toHaveLength(7)
    expect(list[1].insertText).toBe('account.Git_CTR')
    list = await step.getArtifactsPrimaryConnectorsListForYaml('invalid path', getYaml(), params)
    expect(list).toHaveLength(0)
  })

  test('getArtifactsTagsListForYaml test', async () => {
    const step = new AwsLambdaServiceSpec() as any
    let list: CompletionItemInterface[]

    // ECR
    list = await step.getArtifactsTagsListForYaml(ecrArtifactTagListPath, getYaml(), params)
    expect(list).toHaveLength(2)
    expect(list[0].insertText).toBe('latesttag')
    list = await step.getArtifactsTagsListForYaml('invalid path', getYaml(), params)
    expect(list).toHaveLength(0)
  })
})
