import React from 'react'
// import { render, findByText, fireEvent, waitFor, findAllByText, getByText } from '@testing-library/react'
import { render, findByText } from '@testing-library/react'

// import userEvent from '@testing-library/user-event'
import { MultiTypeInputType } from '@harness/uicore'

import { TestWrapper } from '@common/utils/testUtils'
import {
  PipelineContext,
  PipelineContextInterface
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { StageElementWrapper } from '@pipeline/utils/pipelineTypes'

import ConfigFilesSelection from '../ConfigFilesSelection'
import pipelineContextMock from './pipelineContextConfig.json'
// import pipelineContextWithoutArtifactsMock from './pipelineContextWithoutArtifacts.json'
import ConfigFilesListView from '../ConfigFilesListView/ConfigFilesListView'
import type { ConfigFilesListViewProps } from '../ConfigFilesInterface'

jest.mock('@common/components/YAMLBuilder/YamlBuilder')

const getContextValue = (): PipelineContextInterface => {
  return {
    ...pipelineContextMock,
    getStageFromPipeline: jest.fn(() => {
      return { stage: pipelineContextMock.state.pipeline.stages[0], parent: undefined }
    })
  } as any
}
const fetchConnectors = (): Promise<unknown> => Promise.resolve({})

jest.mock('services/cd-ng', () => ({
  useGetConnectorListV2: jest.fn().mockImplementation(() => ({ mutate: fetchConnectors })),
  useGetServiceV2: jest.fn().mockImplementation(() => ({ loading: false, data: {}, refetch: jest.fn() })),
  useGetConnector: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null }
  }),
  useGetBuildDetailsForArtifactoryArtifact: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetRepositoriesDetailsForArtifactory: jest.fn().mockImplementation(() => {
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  })
}))

describe('ConfigFilesSelection tests', () => {
  test(`renders without crashing`, () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ConfigFilesSelection readonly={false} deploymentType="Ssh" />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test(`renders config files without crashing`, async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ConfigFilesSelection readonly={false} deploymentType="Ssh" />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const configFileContainer = await findByText(container, 'pipeline.configFiles.addConfigFile')
    expect(configFileContainer).toBeVisible()
  })

  test(`renders config files when isPropagating is true`, async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ConfigFilesSelection readonly={false} deploymentType="Ssh" isPropagating={true} />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    const addConfigFile = await findByText(container, 'pipeline.configFiles.addConfigFile')
    expect(addConfigFile).toBeDefined()
  })

  test(`renders config file and identifierName has some value`, async () => {
    const { container } = render(
      <TestWrapper>
        <PipelineContext.Provider value={getContextValue()}>
          <ConfigFilesSelection readonly={false} deploymentType="Ssh" isPropagating={false} />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test(`renders Artifact Listview without crashing`, () => {
    const props: ConfigFilesListViewProps = {
      stage: pipelineContextMock.state.pipeline.stages[0] as StageElementWrapper,
      isReadonly: false,
      isPropagating: false,
      deploymentType: 'Ssh',
      allowableTypes: [MultiTypeInputType.FIXED],
      updateStage: jest.fn(),
      selectedConfig: 'Harness',
      setSelectedConfig: jest.fn(),
      selectedServiceResponse: ''
    }

    const { container } = render(
      <TestWrapper>
        <ConfigFilesListView {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
