/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, findByText } from '@testing-library/react'

import { MultiTypeInputType, RUNTIME_INPUT_VALUE } from '@wings-software/uicore'
import { TestWrapper, UseGetReturnData } from '@common/utils/testUtils'
import { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { ResponseConnectorResponse } from 'services/cd-ng'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { WinRmServiceSpec } from '../WinRmServiceSpec'

import { PipelineResponse } from './pipelineMock'
import type { SshWinRmDirectServiceStep } from '../../SshServiceSpec/SshServiceSpecInterface'
import {
  getParams,
  getYaml,
  mockBuildList,
  mockManifestConnector,
  secretMockdata,
  connectorListJSON,
  PipelineMock,
  TemplateMock,
  mockProps
} from './mock'

const fetchConnectors = (): Promise<unknown> => Promise.resolve({})
jest.mock('@common/components/YAMLBuilder/YamlBuilder')

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
  getConnectorListPromise: () => Promise.resolve(connectorListJSON),
  getConnectorListV2Promise: () => Promise.resolve(mockManifestConnector),
  getBuildDetailsForDockerPromise: () => Promise.resolve(mockBuildList),
  getBuildDetailsForGcrPromise: () => Promise.resolve(mockBuildList),
  getBuildDetailsForEcrPromise: () => Promise.resolve(mockBuildList),
  getBuildDetailsForArtifactoryArtifactWithYamlPromise: () => Promise.resolve(),
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
        createdAt: 1607289652123,
        lastModifiedAt: 1607289652123,
        status: null
      },
      metaData: null,
      correlationId: 'r1'
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
        createdAt: 1607289651233,
        lastModifiedAt: 1607289651233,
        status: null
      },
      metaData: null,
      correlationId: 'v1'
    })
  ),
  validateTheIdentifierIsUniquePromise: jest.fn(() =>
    Promise.resolve({
      status: 'SUCCESS',
      data: true,
      metaData: null
    })
  ),
  listSecretsV2Promise: jest.fn().mockImplementation(() => Promise.resolve(secretMockdata)),
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
factory.registerStep(new WinRmServiceSpec())

describe('StepWidget tests', () => {
  test(`renders ServiceStep for Service Tab `, async () => {
    const { container } = render(
      <TestWrapper>
        <StepWidget<SshWinRmDirectServiceStep>
          factory={factory}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          initialValues={serviceTabInitialValues}
          type={StepType.WinRmServiceSpec}
          stepViewType={StepViewType.Edit}
        />
      </TestWrapper>
    )
    const variables = await findByText(container, 'common.variables')
    expect(variables).toBeDefined()
  })

  test('validates input set correctly with errors', () => {
    const response = new WinRmServiceSpec().validateInputSet({
      data: {
        variables: [
          { name: 'myVar1', type: 'Number' },
          { name: 'myVar1', type: 'String' },
          { name: 'myVar1', type: 'Secret' }
        ],
        artifacts: {
          primary: {
            spec: {},
            type: 'Jenkins'
          }
        },
        manifests: [
          {
            manifest: {
              identifier: 'testhelmmanifest',
              spec: {
                chartName: '<+input>',
                chartVersion: '<+input>',
                helmVersion: 'V2',
                skipResourceVersioning: false
              },
              type: 'HelmChart'
            }
          }
        ]
      },
      template: {
        variables: [{ name: 'myVar1', type: 'String' }],
        artifacts: {
          primary: {
            spec: {
              connectorRef: RUNTIME_INPUT_VALUE,
              imagePath: RUNTIME_INPUT_VALUE,
              tag: RUNTIME_INPUT_VALUE,
              tagRegex: RUNTIME_INPUT_VALUE
            },
            type: 'Jenkins'
          }
        }
      },
      getString: () => 'abc',
      viewType: StepViewType.DeploymentForm
    })

    const errorResponse = {
      artifacts: {
        primary: {
          spec: {
            connectorRef: 'abc'
          }
        }
      }
    }

    expect(response).toEqual(errorResponse)
  })

  test('validates input set correctly with no errors', () => {
    const response = new WinRmServiceSpec().validateInputSet({
      data: {
        variables: [
          { name: 'myVar1', type: 'Number' },
          { name: 'myVar1', type: 'String' },
          { name: 'myVar1', type: 'Secret' }
        ],
        artifacts: {
          primary: {
            spec: {},
            type: 'Jenkins'
          }
        },
        manifests: [
          {
            manifest: {
              identifier: 'testhelmmanifest',
              spec: {
                chartName: '<+input>',
                chartVersion: '<+input>',
                helmVersion: 'V2',
                skipResourceVersioning: false
              },
              type: 'HelmChart'
            }
          }
        ]
      },
      template: {
        variables: [{ name: 'myVar1', type: 'String' }]
      },
      getString: () => 'abc',
      viewType: StepViewType.DeploymentForm
    })

    expect(response).toEqual({})
  })

  test('getManifestConnectorsListForYaml test', async () => {
    const step = new WinRmServiceSpec() as any
    let list: CompletionItemInterface[]
    const connectorRefPath =
      'pipeline.stages.0.stage.spec.serviceConfig.serviceDefinition.spec.manifests.0.manifest.spec.store.spec.connectorRef'
    list = await step.getManifestConnectorsListForYaml(connectorRefPath, getYaml(), getParams())
    expect(list).toHaveLength(1)
    expect(list[0].insertText).toBe('account.git9march')
    list = await step.getManifestConnectorsListForYaml('invalid path', getYaml(), getParams())
    expect(list).toHaveLength(0)
  })

  test(`renders ServiceStep for Input sets`, async () => {
    const { container } = render(
      <TestWrapper>
        <StepWidget<SshWinRmDirectServiceStep>
          factory={factory}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          initialValues={
            (PipelineContextValue.state.pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.spec as any) || {}
          }
          template={TemplateMock as any}
          type={StepType.WinRmServiceSpec}
          stepViewType={StepViewType.InputSet}
        />
      </TestWrapper>
    )

    const branch = await findByText(container, 'pipelineSteps.deploy.inputSet.branch')
    expect(branch).toBeDefined()
  })

  test('variablesForm', async () => {
    const { container } = render(
      <TestWrapper>
        <StepWidget<SshWinRmDirectServiceStep>
          factory={factory}
          readonly={false}
          path={'test'}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          initialValues={mockProps.initialValues}
          customStepProps={mockProps.customStepProps}
          type={StepType.WinRmServiceSpec}
          stepViewType={StepViewType.InputVariable}
        />
      </TestWrapper>
    )

    const artifacts = await findByText(container, 'artifacts')
    expect(artifacts).toBeDefined()
  })

  test('inputSetMode', async () => {
    const { container } = render(
      <TestWrapper>
        <StepWidget<SshWinRmDirectServiceStep>
          factory={factory}
          readonly={false}
          path={'test'}
          template={mockProps.template}
          allValues={mockProps.initialValues}
          allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
          initialValues={mockProps.initialValues}
          customStepProps={mockProps.customStepProps}
          type={StepType.WinRmServiceSpec}
          stepViewType={StepViewType.InputSet}
        />
      </TestWrapper>
    )

    const registryHostName = await findByText(container, 'connectors.GCR.registryHostname')
    expect(registryHostName).toBeDefined()
  })
})

const connectorArtifactPrimaryRefPath =
  'pipeline.stages.0.stage.spec.serviceConfig.serviceDefinition.spec.artifacts.primary.spec.connectorRef'
const artifactTagListNexusPath =
  'pipeline.stages.0.stage.spec.serviceConfig.serviceDefinition.spec.artifacts.sidecars.0.sidecar'

describe('Autocomplete fields test', () => {
  test('Test connectorRef ArtifactsTagsList', async () => {
    const step = new WinRmServiceSpec() as any
    let list: CompletionItemInterface[]

    list = await step.getArtifactsTagsListForYaml(artifactTagListNexusPath, getYaml(), getParams())
    expect(list).toHaveLength(0)
    list = await step.getArtifactsTagsListForYaml('invalid path', getYaml(), getParams())
    expect(list).toHaveLength(0)
  })
  test('Test connectorRef ArtifactsPrimaryConnectors', async () => {
    const step = new WinRmServiceSpec() as any
    let list: CompletionItemInterface[]
    list = await step.getArtifactsPrimaryConnectorsListForYaml(connectorArtifactPrimaryRefPath, getYaml(), getParams())
    expect(list).toHaveLength(1)
    expect(list[0].insertText).toBe('account.git9march')
    list = await step.getArtifactsPrimaryConnectorsListForYaml('invalid path', getYaml(), getParams())
    expect(list).toHaveLength(0)
  })
})
