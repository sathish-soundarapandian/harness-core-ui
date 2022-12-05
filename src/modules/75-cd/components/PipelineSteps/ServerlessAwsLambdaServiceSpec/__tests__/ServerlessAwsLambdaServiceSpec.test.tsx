/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultiTypeInputType } from '@harness/uicore'

import { queryByNameAttribute, TestWrapper } from '@common/utils/testUtils'
import type { CompletionItemInterface } from '@common/interfaces/YAMLBuilderProps'
import type { ModulePathParams, PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { useMutateAsGet } from '@common/hooks'
import { modulePathProps, pipelinePathProps, projectPathProps } from '@common/utils/routeUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import type { K8SDirectServiceStep } from '../../K8sServiceSpec/K8sServiceSpecInterface'
import { ServerlessAwsLambdaServiceSpec } from '../ServerlessAwsLambdaServiceSpec'
import { mockConnectorResponse, mockCreateConnectorResponse } from '../../Common/mocks/connector'
import { bucketNameList } from '../../ECSServiceSpec/ManifestSource/__tests__/helpers/mock'
import {
  getDummyPipelineCanvasContextValue,
  getInvalidYaml,
  getTemplateWithArtifactPath,
  getTemplateWithArtifactPathFilter,
  getTemplateWithManifestFields,
  serverlessPipelineContext,
  getYaml,
  initialValues,
  getParams
} from './ServerlessAwsLambdaServiceSpecHelper'
import { awsRegionsData, bucketListData, mockBuildList, mockManifestConnector } from './helpers/mocks'
import { serverlessLambdaManifestTemplateS3Store, initialValuesServerlessLambdaManifestS3Store } from './helpers/helper'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const fetchConnectors = (): Promise<unknown> => Promise.resolve({})
const fetchBuildDetails = jest.fn().mockResolvedValue(mockBuildList)
const fetchBuckets = jest.fn().mockReturnValue(bucketNameList)

jest.mock('services/cd-ng', () => ({
  useGetImagePathsForArtifactoryV2: jest.fn().mockImplementation(() => {
    return {
      data: {},
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  }),
  useGetRepositoriesDetailsForArtifactory: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectors })),
  getConnectorListV2Promise: () => Promise.resolve(mockManifestConnector),
  getBuildDetailsForArtifactoryArtifactWithYamlPromise: () => Promise.resolve(mockBuildList),
  useGetBuildDetailsForArtifactoryArtifactWithYaml: jest.fn().mockImplementation(() => ({ mutate: fetchBuildDetails })),
  useGetConnector: jest.fn(() => mockConnectorResponse),
  useGetServiceV2: jest.fn().mockImplementation(() => ({ loading: false, data: {}, refetch: jest.fn() })),
  useCreateConnector: jest.fn(() => Promise.resolve(mockCreateConnectorResponse)),
  useGetService: jest.fn().mockImplementation(() => ({ loading: false, data: {}, refetch: jest.fn() })),
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
  )
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

factory.registerStep(new ServerlessAwsLambdaServiceSpec())

describe('ServerlessAwsLambdaServiceSpec tests', () => {
  describe('When stepViewType is Edit', () => {
    test('render properly when stepViewType is Edit', () => {
      const contextValue = getDummyPipelineCanvasContextValue({
        isLoading: false
      })
      const { container } = render(
        <TestWrapper>
          <PipelineContext.Provider value={contextValue}>
            <StepWidget<K8SDirectServiceStep>
              factory={factory}
              allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
              initialValues={{ deploymentType: 'ServerlessAwsLambda' }}
              type={StepType.ServerlessAwsLambda}
              stepViewType={StepViewType.Edit}
            />
          </PipelineContext.Provider>
        </TestWrapper>
      )

      expect(container).toMatchSnapshot()
    })
  })

  describe('When stepViewType is InputSet', () => {
    test(`render properly when stepViewType is InputSet`, () => {
      const contextValue = getDummyPipelineCanvasContextValue({
        isLoading: false
      })
      const { container } = render(
        <TestWrapper>
          <PipelineContext.Provider value={contextValue}>
            <StepWidget<K8SDirectServiceStep>
              factory={factory}
              allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
              initialValues={{}}
              type={StepType.ServerlessAwsLambda}
              stepViewType={StepViewType.InputSet}
            />
          </PipelineContext.Provider>
        </TestWrapper>
      )

      expect(container).toMatchSnapshot()
    })

    test('when artifactPath is runtime input', async () => {
      ;(useMutateAsGet as any).mockImplementation(() => {
        return { data: mockBuildList, refetch: fetchBuildDetails, error: null, loading: false }
      })
      const { container } = render(
        <TestStepWidget
          initialValues={serverlessPipelineContext.state}
          template={getTemplateWithArtifactPath()}
          type={StepType.ServerlessAwsLambda}
          stepViewType={StepViewType.InputSet}
          customStepProps={{
            stageIdentifier: 'stage1'
          }}
          path={'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.spec'}
        />
      )

      const artifactPathInput = container.querySelector(
        "input[name='pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.spec.artifacts.primary.spec.artifactPath']"
      ) as HTMLElement
      expect(artifactPathInput).toBeInTheDocument()

      const dropdownIcon = container.querySelector('[data-icon="chevron-down"]')?.parentElement as HTMLInputElement
      userEvent.click(dropdownIcon)

      await waitFor(() => {
        expect(fetchBuildDetails).toHaveBeenCalled()
      })
    })

    test('when artifactPathFilter is runtime input', async () => {
      const { container } = render(
        <TestStepWidget
          initialValues={serverlessPipelineContext.state}
          template={getTemplateWithArtifactPathFilter()}
          type={StepType.ServerlessAwsLambda}
          stepViewType={StepViewType.InputSet}
          customStepProps={{
            stageIdentifier: 'stage1'
          }}
          path={'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.spec'}
        />
      )

      const artifactPathFilterInput = container.querySelector(
        "input[name='pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.spec.artifacts.primary.spec.artifactPathFilter']"
      ) as HTMLElement
      act(() => {
        fireEvent.change(artifactPathFilterInput, { target: { value: 'a*p.zip' } })
      })
      await waitFor(() => expect(artifactPathFilterInput.getAttribute('value')).toBe('a*p.zip'))
    })

    test('should not call onUpdate if manifest values are not entered', async () => {
      const onUpdateHandler = jest.fn()
      const { getByText } = render(
        <TestStepWidget
          initialValues={initialValues}
          template={getTemplateWithManifestFields()}
          allValues={initialValues}
          type={StepType.ServerlessAwsLambda}
          stepViewType={StepViewType.InputSet}
          onUpdate={onUpdateHandler}
        />
      )
      userEvent.click(getByText('Submit'))
      expect(onUpdateHandler).not.toBeCalled()
    })

    test('check Input Set view for manifest when manifestStore is S3', async () => {
      const { container, getByText } = render(
        <TestStepWidget
          testWrapperProps={{
            path: TEST_PATH,
            pathParams: TEST_PATH_PARAMS as unknown as Record<string, string>
          }}
          initialValues={initialValuesServerlessLambdaManifestS3Store}
          allValues={serverlessLambdaManifestTemplateS3Store}
          readonly={false}
          type={StepType.ServerlessAwsLambda}
          stepViewType={StepViewType.InputSet}
          template={serverlessLambdaManifestTemplateS3Store}
          path={'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition'}
        />
      )

      const regionInput = queryByNameAttribute(
        'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.manifests[0].manifest.spec.store.spec.region',
        container
      )
      expect(regionInput).toBeInTheDocument()
      const bucketNameInput = queryByNameAttribute(
        'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.manifests[0].manifest.spec.store.spec.bucketName',
        container
      )
      expect(bucketNameInput).toBeInTheDocument()
      const pathInput = queryByNameAttribute(
        'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.manifests[0].manifest.spec.store.spec.paths[0]',
        container
      )
      expect(pathInput).toBeInTheDocument()
      const configOverridePathInput = queryByNameAttribute(
        'pipeline.stages[0].stage.spec.serviceConfig.serviceDefinition.manifests[0].manifest.spec.configOverridePath',
        container
      )
      expect(configOverridePathInput).toBeInTheDocument()

      const submitBtn = getByText('Submit')
      userEvent.click(submitBtn)
    })
  })

  describe('When stepViewType is InputVariable', () => {
    test(`render properly when stepViewType is InputVariable`, () => {
      const contextValue = getDummyPipelineCanvasContextValue({
        isLoading: false
      })
      const { container } = render(
        <TestWrapper>
          <PipelineContext.Provider value={contextValue}>
            <StepWidget<K8SDirectServiceStep>
              factory={factory}
              allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
              initialValues={{}}
              type={StepType.ServerlessAwsLambda}
              stepViewType={StepViewType.InputVariable}
              customStepProps={{
                variablesData: {}
              }}
            />
          </PipelineContext.Provider>
        </TestWrapper>
      )

      expect(container).toMatchSnapshot()
    })
  })

  describe('Test ServerlessAwsLambdaSpec autocomplete', () => {
    test('getManifestConnectorsListForYaml', async () => {
      const manifestConnectorRefPath =
        'pipeline.stages.0.stage.spec.serviceConfig.serviceDefinition.spec.manifests.0.manifest.spec.store.spec.connectorRef'
      const step = new ServerlessAwsLambdaServiceSpec() as any
      let list: CompletionItemInterface[]

      // When path and yaml both are valid
      list = await step.getManifestConnectorsListForYaml(manifestConnectorRefPath, getYaml(), getParams())
      expect(list).toHaveLength(1)
      expect(list[0].insertText).toBe('account.git9march')
      // When path is invalid
      list = await step.getManifestConnectorsListForYaml('invalid path', getYaml(), getParams())
      expect(list).toHaveLength(0)
      // When yaml is invalid
      list = await step.getManifestConnectorsListForYaml(manifestConnectorRefPath, getInvalidYaml(), getParams())
      expect(list).toHaveLength(0)
    })

    test('getArtifactsPrimaryConnectorsListForYaml', async () => {
      const primaryArtifactConnectorRefPath =
        'pipeline.stages.0.stage.spec.serviceConfig.serviceDefinition.spec.artifacts.primary.spec.connectorRef'
      const step = new ServerlessAwsLambdaServiceSpec() as any
      let list: CompletionItemInterface[]
      list = await step.getArtifactsPrimaryConnectorsListForYaml(
        primaryArtifactConnectorRefPath,
        getYaml(),
        getParams()
      )
      expect(list).toHaveLength(1)
      expect(list[0].insertText).toBe('account.git9march')
      // When path is invalid
      list = await step.getArtifactsPrimaryConnectorsListForYaml('invalid path', getYaml(), getParams())
      expect(list).toHaveLength(0)
      // When yaml is invalid
      list = await step.getArtifactsPrimaryConnectorsListForYaml(
        primaryArtifactConnectorRefPath,
        getInvalidYaml(),
        getParams()
      )
      expect(list).toHaveLength(0)
    })

    test('getArtifactsTagsListForYaml', async () => {
      const primaryArtifactArtifactPath =
        'pipeline.stages.0.stage.spec.serviceConfig.serviceDefinition.spec.artifacts.primary.spec.artifactPath'
      const step = new ServerlessAwsLambdaServiceSpec() as any
      let list: CompletionItemInterface[]
      list = await step.getArtifactsTagsListForYaml(primaryArtifactArtifactPath, getYaml(), getParams())
      expect(list).toHaveLength(2)
      expect(list[0].insertText).toBe('hello-world.zip')
      expect(list[1].insertText).toBe('todolist.zip')
      list = await step.getArtifactsTagsListForYaml('invalid path', getYaml(), getParams())
      expect(list).toHaveLength(0)
      // When yaml is invalid
      list = await step.getArtifactsTagsListForYaml(primaryArtifactArtifactPath, getInvalidYaml(), getParams())
      expect(list).toHaveLength(0)
    })
  })
})
