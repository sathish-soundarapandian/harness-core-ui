/* eslint-disable jest/no-disabled-tests */
/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

import type { StringsMap } from 'stringTypes'
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
import { ManifestDataType } from '@pipeline/components/ManifestSelection/Manifesthelper'
import { ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import {
  awsRegionsData,
  bucketListData
} from '@pipeline/components/ManifestSelection/ManifestWizardSteps/ECSWithS3/__tests__/mocks'
import {
  getYaml,
  mockBuildList,
  initialManifestRuntimeValuesGitStore,
  ecsManifestTemplateGitStore,
  initialManifestRuntimeValuesS3Store,
  ecsManifestTemplateS3Store
} from './helpers/helper'
import { ECSServiceSpec } from '../ECSServiceSpec'

const connectorData = { data: connectorsData.data.content[1] }
const fetchConnector = jest.fn().mockReturnValue(connectorData)
const fetchConnectorList = (): Promise<unknown> => Promise.resolve(connectorsData)
const fetchBuckets = jest.fn().mockReturnValue(bucketListData)

jest.mock('services/cd-ng', () => ({
  getConnectorListV2: () => Promise.resolve(connectorsData),
  getConnectorListV2Promise: jest.fn().mockImplementation(() => Promise.resolve(connectorsData)),
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectorList })),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: connectorData, refetch: fetchConnector, loading: false }
  }),
  useGetServiceV2: jest.fn().mockImplementation(() => ({ loading: false, data: {}, refetch: jest.fn() })),
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

const getString = (str: keyof StringsMap, vars?: Record<string, any> | undefined) => {
  return vars?.stringToAppend ? `${str}_${vars.stringToAppend}` : str
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

describe('ECSServiceSpec tests', () => {
  test('check service tab for given pipeline state from context', async () => {
    const { getByText, findAllByText, getAllByText, getByTestId } = render(
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
    const taskDefinitionManifestSection = getByTestId('task-definition-card')
    const taskDefinitionManifestHeaderContainer = getByTestId('task-definition-manifest-header-container')
    expect(
      within(taskDefinitionManifestSection).getAllByText('cd.pipelineSteps.serviceTab.manifest.taskDefinition')
    ).toHaveLength(2)
    expect(
      within(taskDefinitionManifestHeaderContainer).getByText('cd.pipelineSteps.serviceTab.manifest.taskDefinition')
    ).toBeInTheDocument()
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
        type={StepType.EcsService}
        stepViewType={StepViewType.InputSet}
        template={ecsManifestTemplateGitStore}
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

  test('check Input Set view for manifest when manifestStore is S3', async () => {
    const { container, getByText } = render(
      <TestStepWidget
        testWrapperProps={{
          path: TEST_PATH,
          pathParams: TEST_PATH_PARAMS as unknown as Record<string, string>
        }}
        initialValues={initialManifestRuntimeValuesS3Store}
        allValues={initialManifestRuntimeValuesS3Store}
        readonly={false}
        type={StepType.EcsService}
        stepViewType={StepViewType.InputSet}
        template={ecsManifestTemplateS3Store}
        path={'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition'}
      />
    )

    // Task Definition
    const taskDefinitionRegionInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.manifests[0].manifest.spec.store.spec.region',
      container
    )
    expect(taskDefinitionRegionInput).toBeInTheDocument()
    const taskDefinitionBucketNameInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.manifests[0].manifest.spec.store.spec.bucketName',
      container
    )
    expect(taskDefinitionBucketNameInput).toBeInTheDocument()
    const taskDefinitionPathInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.manifests[0].manifest.spec.store.spec.paths[0]',
      container
    )
    expect(taskDefinitionPathInput).toBeInTheDocument()

    // Service Definition
    const serviceDefinitionRegionInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.manifests[1].manifest.spec.store.spec.region',
      container
    )
    expect(serviceDefinitionRegionInput).toBeInTheDocument()
    const serviceDefinitionBucketNameInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.manifests[1].manifest.spec.store.spec.bucketName',
      container
    )
    expect(serviceDefinitionBucketNameInput).toBeInTheDocument()
    const serviceDefinitionPathInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.manifests[1].manifest.spec.store.spec.paths[0]',
      container
    )
    expect(serviceDefinitionPathInput).toBeInTheDocument()

    // Scalling Policy
    const scallingPolicyRegionInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.manifests[2].manifest.spec.store.spec.region',
      container
    )
    expect(scallingPolicyRegionInput).toBeInTheDocument()
    const scallingPolicyBucketNameInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.manifests[2].manifest.spec.store.spec.bucketName',
      container
    )
    expect(scallingPolicyBucketNameInput).toBeInTheDocument()
    const scallingPolicyPathInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.manifests[2].manifest.spec.store.spec.paths[0]',
      container
    )
    expect(scallingPolicyPathInput).toBeInTheDocument()

    // Scalable Target
    const scalableTargetRegionInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.manifests[3].manifest.spec.store.spec.region',
      container
    )
    expect(scalableTargetRegionInput).toBeInTheDocument()
    const scalableTargetBucketNameInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.manifests[3].manifest.spec.store.spec.bucketName',
      container
    )
    expect(scalableTargetBucketNameInput).toBeInTheDocument()
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
        initialValues={initialManifestRuntimeValuesGitStore}
        allValues={initialManifestRuntimeValuesGitStore}
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

  test.skip('check manifest form errors', async () => {
    const initialValues = {
      manifests: [
        {
          manifest: {
            identifier: 'TaskDefinition_Manifest',
            type: ManifestDataType.EcsTaskDefinition,
            spec: {
              store: {
                type: 'Git',
                spec: {
                  connectorRef: '',
                  branch: '',
                  paths: ''
                }
              }
            }
          }
        }
      ]
    }

    const step = new ECSServiceSpec() as any

    step.renderStep({
      initialValues,
      inputSetData: {
        template: ecsManifestTemplateGitStore
      }
    })
    const errors = await step.validateInputSet({
      data: initialValues,
      getString,
      viewType: StepViewType.DeploymentForm
    })
    expect(errors.manifests[0].manifest.spec.store.spec.connectorRef).toBe('fieldRequired')
    expect(errors.manifests[0].manifest.spec.store.spec.branch).toBe('fieldRequired')
    expect(errors.manifests[0].manifest.spec.store.spec.paths).toBe('fieldRequired')
  })

  test.skip('check primary artifact form errors', async () => {
    const initialValues = {
      artifacts: {
        primary: {
          type: ENABLED_ARTIFACT_TYPES.DockerRegistry,
          spec: {
            connectorRef: '',
            imagePath: '',
            tag: '',
            tagRegex: ''
          }
        }
      }
    }

    const primaryArtifactTemplate = {
      artifacts: {
        primary: {
          type: ENABLED_ARTIFACT_TYPES.DockerRegistry,
          spec: {
            connectorRef: RUNTIME_INPUT_VALUE,
            imagePath: RUNTIME_INPUT_VALUE,
            tag: RUNTIME_INPUT_VALUE,
            tagRegex: RUNTIME_INPUT_VALUE
          }
        }
      }
    }

    const step = new ECSServiceSpec() as any
    step.renderStep({
      initialValues,
      inputSetData: {
        template: primaryArtifactTemplate
      }
    })
    const errors = await step.validateInputSet({
      data: initialValues,
      getString,
      viewType: StepViewType.DeploymentForm
    })
    expect(errors.artifacts.primary.spec.connectorRef).toBe('fieldRequired')
    expect(errors.artifacts.primary.spec.imagePath).toBe('fieldRequired')
    expect(errors.artifacts.primary.spec.tag).toBe('fieldRequired')
    expect(errors.artifacts.primary.spec.tagRegex).toBe('fieldRequired')
  })

  test.skip('check primary artifact sources form errors when artifact type is S3', async () => {
    const initialValues = {
      artifacts: {
        primary: {
          type: ENABLED_ARTIFACT_TYPES.S3,
          sources: [
            {
              spec: {
                connectorRef: '',
                imagePath: '',
                tag: '',
                tagRegex: ''
              }
            }
          ]
        }
      }
    }

    const primaryArtifactSourceTemplate = {
      artifacts: {
        primary: {
          type: ENABLED_ARTIFACT_TYPES.DockerRegistry,
          sources: [
            {
              spec: {
                connectorRef: RUNTIME_INPUT_VALUE,
                imagePath: RUNTIME_INPUT_VALUE,
                tag: RUNTIME_INPUT_VALUE,
                tagRegex: RUNTIME_INPUT_VALUE
              }
            }
          ]
        }
      }
    }

    const step = new ECSServiceSpec() as any
    step.renderStep({
      initialValues,
      inputSetData: {
        template: primaryArtifactSourceTemplate
      }
    })
    const errors = await step.validateInputSet({
      data: initialValues,
      getString,
      viewType: StepViewType.DeploymentForm
    })
    expect(errors.artifacts.primary.sources[0].spec.connectorRef).toBe('fieldRequired')
    expect(errors.artifacts.primary.sources[0].spec.imagePath).toBe('fieldRequired')
    expect(errors.artifacts.primary.sources[0].spec.tag).toBe('fieldRequired')
    expect(errors.artifacts.primary.sources[0].spec.tagRegex).toBe('fieldRequired')
  })
  test.skip('check sidecar artifact form errors', async () => {
    const initialValues = {
      artifacts: {
        sidecars: [
          {
            sidecar: {
              identifier: 'Test_Sidecar',
              type: ENABLED_ARTIFACT_TYPES.DockerRegistry,
              spec: {
                connectorRef: '',
                imagePath: '',
                tag: '',
                tagRegex: ''
              }
            }
          }
        ]
      }
    }

    const sidecarArtifactTemplate = {
      artifacts: {
        sidecars: [
          {
            sidecar: {
              identifier: 'Test_Sidecar',
              type: ENABLED_ARTIFACT_TYPES.DockerRegistry,
              spec: {
                connectorRef: RUNTIME_INPUT_VALUE,
                imagePath: RUNTIME_INPUT_VALUE,
                tag: RUNTIME_INPUT_VALUE,
                tagRegex: RUNTIME_INPUT_VALUE
              }
            }
          }
        ]
      }
    }

    const step = new ECSServiceSpec() as any
    step.renderStep({
      initialValues,
      inputSetData: {
        template: sidecarArtifactTemplate
      }
    })
    const errors = await step.validateInputSet({
      data: initialValues,
      getString,
      viewType: StepViewType.DeploymentForm
    })
    expect(errors.artifacts.sidecars[0].sidecar.spec.connectorRef).toBe('fieldRequired')
    expect(errors.artifacts.sidecars[0].sidecar.spec.imagePath).toBe('fieldRequired')
    expect(errors.artifacts.sidecars[0].sidecar.spec.tag).toBe('fieldRequired')
    expect(errors.artifacts.sidecars[0].sidecar.spec.tagRegex).toBe('fieldRequired')
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
