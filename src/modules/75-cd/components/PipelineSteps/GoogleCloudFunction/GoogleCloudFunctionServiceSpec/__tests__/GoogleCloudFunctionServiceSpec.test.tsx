/*
 * Copyright 2023 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RUNTIME_INPUT_VALUE } from '@harness/uicore'

import type { StringsMap } from 'framework/strings/StringsContext'
import { queryByNameAttribute } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import { modulePathProps, pipelinePathProps, projectPathProps } from '@common/utils/routeUtils'
import { connectorsData } from '@connectors/pages/connectors/__tests__/mockData'
import { TestStepWidget, factory } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { ENABLED_ARTIFACT_TYPES } from '@pipeline/components/ArtifactsSelection/ArtifactHelper'
import { getYaml, initialManifestRuntimeValuesGitStore, gcfManifestTemplateGitStore } from './helper'
import { GoogleCloudFunctionServiceSpec } from '../GoogleCloudFunctionServiceSpec'
import { getProjectsResponse, pipelineContextGcfManifests } from './mocks'

const connectorData = { data: connectorsData.data.content[1] }
const fetchConnector = jest.fn().mockReturnValue(connectorData)
const fetchConnectorList = (): Promise<unknown> => Promise.resolve(connectorsData)

jest.mock('services/cd-ng', () => ({
  useGetProjects: () => Promise.resolve(getProjectsResponse),
  getConnectorListV2: () => Promise.resolve(connectorsData),
  getConnectorListPromise: jest.fn().mockImplementation(() => Promise.resolve(connectorsData)),
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectorList })),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: connectorData, refetch: fetchConnector, loading: false }
  }),
  useGetServiceV2: jest.fn().mockImplementation(() => ({ loading: false, data: {}, refetch: jest.fn() })),
  getConnectorListV2Promise: () => Promise.resolve(connectorsData)
}))

const TEST_PATH = routes.toPipelineStudio({ ...projectPathProps, ...modulePathProps, ...pipelinePathProps })
const TEST_PATH_PARAMS = {
  accountId: 'testAccountId',
  orgIdentifier: 'testOrg',
  projectIdentifier: 'testProject',
  pipelineIdentifier: 'Pipeline_1',
  module: 'cd'
}

factory.registerStep(new GoogleCloudFunctionServiceSpec())

const existingInitialValues = {
  artifacts: {
    primary: {
      spec: {
        connectorRef: 'garServiceConnector',
        project: 'cd-play',
        bucket: 'gcf-bucket',
        artifactPath: 'src/main'
      }
    }
  }
}

const getString = (str: keyof StringsMap, vars?: Record<string, any> | undefined) => {
  return vars?.stringToAppend ? `${str}_${vars.stringToAppend}` : str
}

describe('GcfServiceSpec tests', () => {
  test('check service tab for given pipeline state from context', async () => {
    render(
      <PipelineContext.Provider value={pipelineContextGcfManifests}>
        <TestStepWidget
          testWrapperProps={{
            path: TEST_PATH,
            pathParams: TEST_PATH_PARAMS as unknown as Record<string, string>
          }}
          initialValues={{
            isReadonlyServiceMode: false
          }}
          readonly={false}
          type={StepType.GoogleCloudFunctionsService}
          stepViewType={StepViewType.Edit}
        />
      </PipelineContext.Provider>
    )

    // Function Definition
    const functionDefinitionHeaderContainer = screen.getByTestId('function-definition-card')
    expect(
      within(functionDefinitionHeaderContainer).getByText('pipeline.manifestTypeLabels.GoogleCloudFunctionDefinition')
    ).toBeInTheDocument()
    expect(screen.getByText('manifest1')).toBeInTheDocument()
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
        type={StepType.GoogleCloudFunctionsService}
        stepViewType={StepViewType.InputSet}
        template={gcfManifestTemplateGitStore}
        path={'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition'}
      />
    )

    // 1 connectorRef fields should appear
    const allConnectorRefInput = getAllByText('connector')
    expect(allConnectorRefInput).toHaveLength(1)

    // Function Definition
    const gcfFunctionDefinitionBranchInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.manifests[0].manifest.spec.store.spec.branch',
      container
    )
    expect(gcfFunctionDefinitionBranchInput).toBeInTheDocument()
    const gcfFunctionDefinitionPathInput = queryByNameAttribute(
      'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.manifests[0].manifest.spec.store.spec.paths[0]',
      container
    )
    expect(gcfFunctionDefinitionPathInput).toBeInTheDocument()

    const submitBtn = getByText('Submit')
    userEvent.click(submitBtn)
  })

  test('check manifest errors in DeploymentFrom view', async () => {
    const step = new GoogleCloudFunctionServiceSpec() as any

    step.renderStep({
      initialValues: initialManifestRuntimeValuesGitStore,
      inputSetData: {
        template: gcfManifestTemplateGitStore
      }
    })

    const errors = await step.validateInputSet({
      data: initialManifestRuntimeValuesGitStore,
      template: gcfManifestTemplateGitStore,
      getString,
      viewType: StepViewType.DeploymentForm
    })
    expect(errors.manifests[0].manifest.spec.store.spec.connectorRef).toBe('fieldRequired')
    expect(errors.manifests[0].manifest.spec.store.spec.branch).toBe('fieldRequired')
    expect(errors.manifests[0].manifest.spec.store.spec.paths).toBe('fieldRequired')
  })

  test('check primary artifact errors for GoogleCloudStorage artifact type in DeploymentFrom view', async () => {
    const initialValues = {
      artifacts: {
        primary: {
          type: ENABLED_ARTIFACT_TYPES.GoogleCloudStorage,
          spec: {
            connectorRef: '',
            project: '',
            bucket: '',
            artifactPath: ''
          }
        }
      }
    }

    const primaryArtifactTemplate = {
      artifacts: {
        primary: {
          type: ENABLED_ARTIFACT_TYPES.GoogleCloudStorage,
          spec: {
            connectorRef: RUNTIME_INPUT_VALUE,
            project: RUNTIME_INPUT_VALUE,
            bucket: RUNTIME_INPUT_VALUE,
            artifactPath: RUNTIME_INPUT_VALUE
          }
        }
      }
    }

    const step = new GoogleCloudFunctionServiceSpec() as any
    step.renderStep({
      initialValues,
      inputSetData: {
        template: primaryArtifactTemplate
      }
    })
    const errors = await step.validateInputSet({
      data: initialValues,
      template: primaryArtifactTemplate,
      getString,
      viewType: StepViewType.DeploymentForm
    })
    expect(errors.artifacts.primary.spec.connectorRef).toBe('fieldRequired')
    expect(errors.artifacts.primary.spec.project).toBe('fieldRequired')
    expect(errors.artifacts.primary.spec.bucket).toBe('fieldRequired')
    expect(errors.artifacts.primary.spec.artifactPath).toBe('fieldRequired')
  })

  test('check primary artifact errors for GoogleCloudSource artifact type in DeploymentFrom view', async () => {
    const initialValues = {
      artifacts: {
        primary: {
          type: ENABLED_ARTIFACT_TYPES.GoogleCloudSource,
          spec: {
            connectorRef: '',
            project: '',
            repository: '',
            branch: '',
            commitId: '',
            tag: '',
            sourceDirectory: ''
          }
        }
      }
    }

    const primaryArtifactTemplate = {
      artifacts: {
        primary: {
          type: ENABLED_ARTIFACT_TYPES.GoogleCloudSource,
          spec: {
            connectorRef: RUNTIME_INPUT_VALUE,
            project: RUNTIME_INPUT_VALUE,
            repository: RUNTIME_INPUT_VALUE,
            branch: RUNTIME_INPUT_VALUE,
            commitId: RUNTIME_INPUT_VALUE,
            tag: RUNTIME_INPUT_VALUE,
            sourceDirectory: RUNTIME_INPUT_VALUE
          }
        }
      }
    }

    const step = new GoogleCloudFunctionServiceSpec() as any
    step.renderStep({
      initialValues,
      inputSetData: {
        template: primaryArtifactTemplate
      }
    })
    const errors = await step.validateInputSet({
      data: initialValues,
      template: primaryArtifactTemplate,
      getString,
      viewType: StepViewType.DeploymentForm
    })
    expect(errors.artifacts.primary.spec.connectorRef).toBe('fieldRequired')
    expect(errors.artifacts.primary.spec.project).toBe('fieldRequired')
    expect(errors.artifacts.primary.spec.repository).toBe('fieldRequired')
    expect(errors.artifacts.primary.spec.branch).toBe('fieldRequired')
    expect(errors.artifacts.primary.spec.commitId).toBe('fieldRequired')
    expect(errors.artifacts.primary.spec.tag).toBe('fieldRequired')
    expect(errors.artifacts.primary.spec.sourceDirectory).toBe('fieldRequired')
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
        type={StepType.GoogleCloudFunctionsService}
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
        type={StepType.GoogleCloudFunctionsService}
        stepViewType={StepViewType.InputVariable}
        isNewStep={true}
        customStepProps={{
          stageIdentifier: 'qaStage',
          variablesData: existingInitialValues,
          path: 'pipeline.stages.qaStage.artifacts.primary.spec',
          metadataMap: {
            garServiceConnector: {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.artifacts.primary.spec.GcfService.connectorRef',
                localName: 'spec.GcfService.connectorRef'
              }
            },
            'cd-play': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.artifacts.primary.spec.GcfService.project',
                localName: 'spec.GcfService.project'
              }
            },
            'gcf-bucket': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.artifacts.primary.spec.GcfService.bucket',
                localName: 'spec.GcfService.bucket'
              }
            },
            'src/main': {
              yamlProperties: {
                fqn: 'pipeline.stages.qaStage.artifacts.primary.spec.GcfService.artifactPath',
                localName: 'spec.GcfService.artifactPath'
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
const params = () => ({
  accountId: 'accountId',
  module: 'cd',
  orgIdentifier: 'default',
  pipelineIdentifier: '-1',
  projectIdentifier: 'projectIdentifier'
})

describe('Autocomplete fields test', () => {
  test('getManifestConnectorsListForYaml test', async () => {
    const step = new GoogleCloudFunctionServiceSpec() as any
    let list: CompletionItemInterface[]
    list = await step.getManifestConnectorsListForYaml(connectorRefPath, getYaml(), params)
    expect(list).toHaveLength(7)
    expect(list[1].insertText).toBe('account.Git_CTR')
    list = await step.getManifestConnectorsListForYaml('invalid path', getYaml(), params)
    expect(list).toHaveLength(0)
  })

  test('getArtifactsPrimaryConnectorsListForYaml test', async () => {
    const step = new GoogleCloudFunctionServiceSpec() as any
    let list: CompletionItemInterface[]
    list = await step.getArtifactsPrimaryConnectorsListForYaml(connectorArtifactPrimaryRefPath, getYaml(), params)
    expect(list).toHaveLength(7)
    expect(list[1].insertText).toBe('account.Git_CTR')
    list = await step.getArtifactsPrimaryConnectorsListForYaml('invalid path', getYaml(), params)
    expect(list).toHaveLength(0)
  })
})
