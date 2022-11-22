import React from 'react'
import { act, fireEvent, render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultiTypeInputType } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { factory, TestStepWidget } from '@pipeline/components/PipelineSteps/Steps/__tests__/StepTestUtil'
import { TasServiceSpec } from '../TasServiceSpec'
import type { K8SDirectServiceStep } from '../../K8sServiceSpec/K8sServiceSpecInterface'
import {
  getDummyPipelineCanvasContextValue,
  getTemplateWithArtifactPath,
  getTemplateWithManifestFields,
  initialValues,
  tasPipelineContext
} from './TasServiceSpecHelper'
import { mockBuildList, mockManifestConnector } from './mocks'
import { mockConnectorResponse, mockCreateConnectorResponse } from '../../Common/mocks/connector'
import { mockDockerTagsCallResponse } from '../../K8sServiceSpec/__tests__/mocks'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const fetchConnectors = (): Promise<unknown> => Promise.resolve({})
const fetchBuildDetails = jest.fn().mockResolvedValue(mockBuildList)
jest.mock('services/cd-ng', () => ({
  useGetImagePathsForArtifactoryV2: jest.fn().mockImplementation(() => {
    return {
      data: {},
      refetch: jest.fn(),
      error: null,
      loading: false
    }
  }),
  useGetBuildDetailsForDockerWithYaml: () => mockDockerTagsCallResponse,
  useGetArtifactSourceInputs: jest.fn().mockImplementation(() => {
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

factory.registerStep(new TasServiceSpec())

describe('TasServiceSpec tests', () => {
  describe('StepViewType Edit mode', () => {
    test('intial rendering', () => {
      const contextValue = getDummyPipelineCanvasContextValue({
        isLoading: false
      })
      const { container } = render(
        <TestWrapper>
          <PipelineContext.Provider value={contextValue}>
            <StepWidget<K8SDirectServiceStep>
              factory={factory}
              allowableTypes={[MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME, MultiTypeInputType.EXPRESSION]}
              initialValues={{ deploymentType: 'TAS' }}
              type={StepType.TasService}
              stepViewType={StepViewType.Edit}
            />
          </PipelineContext.Provider>
        </TestWrapper>
      )

      expect(container).toMatchSnapshot()
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
              type={StepType.TasService}
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
              type={StepType.TasService}
              stepViewType={StepViewType.InputSet}
            />
          </PipelineContext.Provider>
        </TestWrapper>
      )

      expect(container).toMatchSnapshot()
    })

    test('when artifactPath is runtime input', async () => {
      const { container } = render(
        <TestStepWidget
          initialValues={tasPipelineContext.state}
          template={getTemplateWithArtifactPath()}
          type={StepType.TasService}
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
      act(() => {
        fireEvent.click(dropdownIcon)
      })

      //   await waitFor(() => {
      //     expect(fetchBuildDetails).toHaveBeenCalled()
      //   })
    })

    test('should not call onUpdate if manifest values and artifact values are not entered', async () => {
      const onUpdateHandler = jest.fn()
      const { getByText } = render(
        <TestStepWidget
          initialValues={initialValues}
          template={getTemplateWithManifestFields()}
          allValues={initialValues}
          type={StepType.TasService}
          stepViewType={StepViewType.InputSet}
          onUpdate={onUpdateHandler}
        />
      )
      userEvent.click(getByText('Submit'))
      expect(onUpdateHandler).not.toBeCalled()
    })
  })
})
