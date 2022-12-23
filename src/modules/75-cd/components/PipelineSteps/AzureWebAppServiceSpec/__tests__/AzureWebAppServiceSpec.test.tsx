import React from 'react'
import { render, findByText } from '@testing-library/react'

import { MultiTypeInputType } from '@harness/uicore'
import { TestWrapper, UseGetReturnData } from '@common/utils/testUtils'
import { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { ResponseConnectorResponse } from 'services/cd-ng'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { pipelineContextKubernetes } from '@pipeline/components/PipelineStudio/PipelineContext/__tests__/helper'
import { AzureWebAppServiceSpec } from '../AzureWebAppServiceSpec'
import { PipelineResponse } from './mocks/PipelineResponse'
import PipelineMock from './mocks/PipelineMock.json'
import TemplateMock from './mocks/Template.json'
import connectorsMock from './mocks/Connectors.json'
import secretsMock from './mocks/Secrets.json'
import { getParams, getYaml, mockBuildList } from './mocks/mocks'
import type { AzureWebAppServiceStep } from '../AzureWebAppServiceSpecInterface.types'

const fetchConnectors = (): Promise<unknown> => Promise.resolve({})
jest.mock('@common/components/YAMLBuilder/YamlBuilder')
const mockProps = {
  initialValues: {
    artifacts: {
      primary: {
        primaryArtifactRef: '<+input>',
        sources: '<+input>'
      }
    }
  }
}

export const ConnectorResponse: UseGetReturnData<ResponseConnectorResponse> = {
  loading: false,
  refetch: jest.fn(),
  error: null,
  data: {
    status: 'SUCCESS',
    data: {
      connector: {
        name: 'connectorRef',
        identifier: 'connectorRef',
        description: '',
        tags: {},
        type: 'K8sCluster',
        spec: {
          credential: {
            type: 'ManualConfig',
            spec: {
              masterUrl: 'asd',
              auth: { type: 'UsernamePassword', spec: { username: 'asd', passwordRef: 'account.test1111' } }
            }
          }
        }
      },
      createdAt: 1602062958274,
      lastModifiedAt: 1602062958274
    },
    correlationId: 'e1841cfc-9ed5-4f7c-a87b-c9be1eeaae34'
  }
}
jest.mock('services/cd-ng', () => ({
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectors })),
  useGetBuildDetailsForEcr: () =>
    jest.fn().mockImplementation(() => {
      return { data: { data: { buildDetailsList: [] } }, refetch: jest.fn(), error: null }
    }),
  getConnectorListPromise: () => Promise.resolve(connectorsMock),
  getConnectorListV2Promise: () => Promise.resolve(connectorsMock),
  getBuildDetailsForDockerPromise: () => Promise.resolve(mockBuildList),
  getBuildDetailsForGcrPromise: () => Promise.resolve(mockBuildList),
  getBuildDetailsForEcrPromise: () => Promise.resolve(mockBuildList),
  useGetConnector: jest.fn(() => ConnectorResponse),
  useGetServiceV2: jest.fn().mockImplementation(() => ({ loading: false, data: {}, refetch: jest.fn() })),
  useCreateConnector: jest.fn(() =>
    Promise.resolve({
      status: 'SUCCESS',
      data: {
        connector: {
          name: 'artifact',
          identifier: 'artifact',
          description: '',
          orgIdentifier: 'default',
          projectIdentifier: 'dummy',
          tags: [],
          type: 'DockerRegistry',
          spec: {
            dockerRegistryUrl: 'https;//hub.docker.com',
            auth: {
              type: 'UsernamePassword',
              spec: { username: 'testpass', passwordRef: 'account.testpass' }
            }
          }
        },
        createdAt: 1607289652713,
        lastModifiedAt: 1607289652713,
        status: null
      },
      metaData: null,
      correlationId: '0d20f7b7-6f3f-41c2-bd10-4c896bfd76fd'
    })
  ),
  useUpdateConnector: jest.fn(() =>
    Promise.resolve({
      status: 'SUCCESS',
      data: {
        connector: {
          name: 'artifact',
          identifier: 'artifact',
          description: '',
          orgIdentifier: 'default',
          projectIdentifier: 'dummy',
          tags: [],
          type: 'DockerRegistry',
          spec: {
            dockerRegistryUrl: 'https;//hub.docker.com',
            auth: {
              type: 'UsernamePassword',
              spec: { username: 'testpass', passwordRef: 'account.testpass' }
            }
          }
        },
        createdAt: 1607289652713,
        lastModifiedAt: 1607289652713,
        status: null
      },
      metaData: null,
      correlationId: '0d20f7b7-6f3f-41c2-bd10-4c896bfd76fd'
    })
  ),
  validateTheIdentifierIsUniquePromise: jest.fn(() =>
    Promise.resolve({
      status: 'SUCCESS',
      data: true,
      metaData: null
    })
  ),
  listSecretsV2Promise: jest.fn().mockImplementation(() => Promise.resolve(secretsMock)),
  usePutSecret: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePostSecret: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePostSecretFileV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  usePutSecretFileV2: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetConnectorList: jest.fn(() => []),
  useGetTestConnectionResult: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetBuildDetailsForGcr: jest.fn().mockImplementation(() => {
    return { data: { data: { buildDetailsList: [] } }, refetch: jest.fn(), error: null }
  }),
  useGetBuildDetailsForDocker: jest.fn().mockImplementation(() => {
    return { data: { data: { buildDetailsList: [] } }, refetch: jest.fn(), error: null }
  })
}))
jest.mock('services/pipeline-ng', () => ({
  useGetPipeline: jest.fn(() => PipelineResponse)
}))
jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  })
}))

jest.mock('services/portal', () => ({
  useListAwsRegions: jest.fn().mockImplementation(() => {
    return { data: {} }
  })
}))

const PipelineContextValue = {
  state: PipelineMock.state,
  stepsFactory: PipelineMock.stepsFactory,
  stagesMap: PipelineMock.stagesMap
}
const serviceTabInitialValues = { stageIndex: 0, setupModeType: 'DIFFRENT' }
class StepFactory extends AbstractStepFactory {
  protected type = 'test-factory'
}

const factory = new StepFactory()
factory.registerStep(new AzureWebAppServiceSpec())

const featureFlags = {
  NG_SVC_ENV_REDESIGN: true,
  NG_ARTIFACT_SOURCES: true
}

describe('Azure Web App Service Spec tests', () => {
  test(`renders ServiceStep for Service Tab `, () => {
    const { container } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags }}>
        <PipelineContext.Provider value={pipelineContextKubernetes}>
          <StepWidget<AzureWebAppServiceStep>
            factory={factory}
            allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
            initialValues={serviceTabInitialValues}
            type={StepType.AzureWebAppServiceSpec}
            stepViewType={StepViewType.Edit}
          />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`shows deployment type tabs`, async () => {
    const { container } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags }}>
        <StepWidget<AzureWebAppServiceStep>
          factory={factory}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          initialValues={serviceTabInitialValues}
          type={StepType.AzureWebAppServiceSpec}
          stepViewType={StepViewType.Edit}
        />
      </TestWrapper>
    )
    const variables = await findByText(container, 'common.variables')
    expect(variables).toBeDefined()
  })

  test(`renders ServiceStep for Input sets`, () => {
    const { container } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags }}>
        <StepWidget<AzureWebAppServiceStep>
          factory={factory}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          initialValues={
            (PipelineContextValue.state.pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.spec as any) || {}
          }
          template={TemplateMock as any}
          type={StepType.AzureWebAppServiceSpec}
          stepViewType={StepViewType.InputSet}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('variablesForm', () => {
    const { container } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags }}>
        <StepWidget<AzureWebAppServiceStep>
          factory={factory}
          readonly={false}
          path={'test'}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          initialValues={mockProps.initialValues as any}
          type={StepType.AzureWebAppServiceSpec}
          stepViewType={StepViewType.InputVariable}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('inputSetMode', () => {
    const { container } = render(
      <TestWrapper defaultAppStoreValues={{ featureFlags }}>
        <StepWidget<AzureWebAppServiceStep>
          factory={factory}
          readonly={false}
          path={'test'}
          allValues={mockProps.initialValues as any}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          initialValues={mockProps.initialValues as any}
          type={StepType.AzureWebAppServiceSpec}
          stepViewType={StepViewType.InputSet}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

const connectorArtifactPrimaryRefPath =
  'pipeline.stages.0.stage.spec.serviceConfig.serviceDefinition.spec.artifacts.primary.spec.connectorRef'
const artifactTagListGCRPath =
  'pipeline.stages.0.stage.spec.serviceConfig.serviceDefinition.spec.artifacts.sidecars.0.sidecar.spec.tag'
const artifactTagListECRPath =
  'pipeline.stages.0.stage.spec.serviceConfig.serviceDefinition.spec.artifacts.sidecars.1.sidecar.spec.tag'
const artifactTagListDockerPath =
  'pipeline.stages.0.stage.spec.serviceConfig.serviceDefinition.spec.artifacts.sidecars.2.sidecar.spec.tag'

describe('Autocomplete fields test', () => {
  test('Test connectorRef ArtifactsPrimaryConnectors', async () => {
    const step = new AzureWebAppServiceSpec() as any
    let list: CompletionItemInterface[]
    list = await step.getArtifactsPrimaryConnectorsListForYaml(connectorArtifactPrimaryRefPath, getYaml(), getParams())
    expect(list).toHaveLength(2)
    expect(list[1].insertText).toBe('account.harnessimage')
    list = await step.getArtifactsPrimaryConnectorsListForYaml('invalid path', getYaml(), getParams())
    expect(list).toHaveLength(0)
  })
  test('Test connectorRef ArtifactsTagsList', async () => {
    const step = new AzureWebAppServiceSpec() as any
    let list: CompletionItemInterface[]

    //GCR
    list = await step.getArtifactsTagsListForYaml(artifactTagListGCRPath, getYaml(), getParams())
    expect(list).toHaveLength(2)
    expect(list[0].insertText).toBe('latesttag')
    list = await step.getArtifactsTagsListForYaml('invalid path', getYaml(), getParams())
    expect(list).toHaveLength(0)

    //ECR
    list = await step.getArtifactsTagsListForYaml(artifactTagListECRPath, getYaml(), getParams())
    expect(list).toHaveLength(2)
    expect(list[0].insertText).toBe('latesttag')
    list = await step.getArtifactsTagsListForYaml('invalid path', getYaml(), getParams())
    expect(list).toHaveLength(0)

    //Docker
    list = await step.getArtifactsTagsListForYaml(artifactTagListDockerPath, getYaml(), getParams())
    expect(list).toHaveLength(2)
    expect(list[0].insertText).toBe('latesttag')
    list = await step.getArtifactsTagsListForYaml('invalid path', getYaml(), getParams())
    expect(list).toHaveLength(0)
  })
})
