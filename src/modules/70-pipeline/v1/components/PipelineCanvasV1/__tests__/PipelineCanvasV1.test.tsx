/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent, waitFor, screen } from '@testing-library/react'
import { set } from 'lodash-es'
import { putPipelinePromise, createPipelinePromise } from 'services/pipeline-ng'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { useMutateAsGet } from '@common/hooks'
import routes from '@common/RouteDefinitions'
import { DefaultNewPipelineId } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import {
  getDummyPipelineCanvasContextValue,
  mockApiDataEmpty,
  mockPipelineTemplateYaml
} from '@pipeline/components/PipelineStudio/PipelineCanvas/__tests__/PipelineCanvasTestHelper'
import mockImport from 'framework/utils/mockImport'
import { PipelineCanvasV1, PipelineCanvasProps } from '../PipelineCanvasV1'
import { PipelineContextV1 } from '../../PipelineStudioV1/PipelineContextV1/PipelineContextV1'
const getProps = (): PipelineCanvasProps => ({
  toPipelineStudio: jest.fn(),
  toPipelineDetail: jest.fn(),
  toPipelineList: jest.fn(),
  toPipelineProject: jest.fn()
})

/* Mocks */
jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({
  validateJSONWithSchema: jest.fn().mockReturnValue({ error: { size: 2 } })
}))

jest.mock('framework/GitRepoStore/GitSyncStoreContext', () => ({
  useGitSyncStore: jest.fn().mockReturnValue({ gitSyncRepos: [{ identifier: 'repoIdentifier', name: 'repoName' }] })
}))

jest.mock('services/pipeline-ng', () => ({
  putPipelinePromise: jest.fn(),
  createPipelinePromise: jest.fn(),
  useGetInputsetYaml: () => jest.fn(),
  useGetTemplateFromPipeline: jest.fn()
}))

jest.mock('services/pipeline-rq', () => ({
  useValidateTemplateInputsQuery: jest.fn(() => ({ data: null }))
}))

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),
  useMutateAsGet: jest.fn()
}))

const showError = jest.fn()
const showSuccess = jest.fn()
const toasterClear = jest.fn()

jest.mock('@harness/uicore', () => ({
  ...jest.requireActual('@harness/uicore'),
  useToaster: jest.fn(() => ({ showError, showSuccess, clear: toasterClear }))
}))

mockImport('@common/hooks/useFeatureFlag', {
  useFeatureFlags: () => ({ CI_YAML_VERSIONING: true })
})

/* Mocks end */

describe('Pipeline Canvas V1 - new pipeline', () => {
  const testWrapperProps: TestWrapperProps = {
    path: routes.toPipelineStudioV1({
      pipelineIdentifier: ':pipelineIdentifier',
      orgIdentifier: ':orgIdentifier',
      accountId: ':accountId',
      projectIdentifier: ':projectIdentifier'
    }),
    pathParams: {
      pipelineIdentifier: DefaultNewPipelineId,
      orgIdentifier: 'TEST_ORG',
      accountId: 'TEST_ACCOUNT',
      projectIdentifier: 'TEST_PROJECT'
    }
  }

  beforeEach(() => {
    // eslint-disable-next-line
    // @ts-ignore
    useMutateAsGet.mockImplementation(() => {
      return mockPipelineTemplateYaml
    })
  })

  test('pipeline save button disabled till updation', () => {
    const props = getProps()
    const contextValue = getDummyPipelineCanvasContextValue({ isLoading: false })
    const { getByText } = render(
      <TestWrapper {...testWrapperProps}>
        <PipelineContextV1.Provider value={contextValue}>
          <PipelineCanvasV1 {...props} />
        </PipelineContextV1.Provider>
      </TestWrapper>
    )
    act(() => {
      fireEvent.click(getByText('save'))
    })
    // isUpdated - false disables save button
    expect(createPipelinePromise).not.toBeCalled()
  })

  test('loading state', () => {
    const props = getProps()
    const contextValue = getDummyPipelineCanvasContextValue({ isLoading: true })
    const { queryByText } = render(
      <TestWrapper {...testWrapperProps}>
        <PipelineContextV1.Provider value={contextValue}>
          <PipelineCanvasV1 {...props} />
        </PipelineContextV1.Provider>
      </TestWrapper>
    )
    expect(queryByText(/Loading, please wait\.\.\./)).toBeTruthy()
  })

  test('pipeline call fail error screen', () => {
    const props = getProps()
    const contextValue = getDummyPipelineCanvasContextValue({ isLoading: false })
    contextValue.state.templateError = {
      status: 404,
      data: {
        message:
          'Invalid request: Pipeline with the given ID: testPipeline_Cypressss does not exist or has been deleted'
      },
      message: 'INVALID_REQUEST'
    }
    const { queryByText, container } = render(
      <TestWrapper {...testWrapperProps}>
        <PipelineContextV1.Provider value={contextValue}>
          <PipelineCanvasV1 {...props} />
        </PipelineContextV1.Provider>
      </TestWrapper>
    )
    expect(queryByText('Invalid request:'))
    expect(queryByText('Pipeline with the given ID: testPipeline_Cypressss does not exist or has been deleted'))
    expect(container).toMatchSnapshot()
  })

  test('with git sync enabled - new pipeline', async () => {
    const props = getProps()
    const contextValue = getDummyPipelineCanvasContextValue({
      isLoading: false,
      gitDetails: { repoIdentifier: 'repoIdentifier', rootFolder: 'rootFolder', filePath: 'filePath', branch: 'branch' }
    })
    const { queryByText, getByTestId } = render(
      <TestWrapper {...testWrapperProps} defaultAppStoreValues={{ isGitSyncEnabled: true }}>
        <PipelineContextV1.Provider value={contextValue}>
          <PipelineCanvasV1 {...props} />
        </PipelineContextV1.Provider>
      </TestWrapper>
    )
    const gitPopoverIcon = getByTestId('git-popover')
    act(() => {
      fireEvent.mouseEnter(gitPopoverIcon)
    })
    await waitFor(() => expect(queryByText('repoName')).toBeTruthy())
    expect(queryByText('branch')).toBeTruthy()
    expect(queryByText('rootFolderfilePath')).toBeNull()
  })

  test('readonly mode', async () => {
    const props = getProps()
    const contextValue = getDummyPipelineCanvasContextValue({
      isLoading: false,
      gitDetails: undefined,
      isReadonly: true
    })
    const { queryByText } = render(
      <TestWrapper {...testWrapperProps}>
        <PipelineContextV1.Provider value={contextValue}>
          <PipelineCanvasV1 {...props} />
        </PipelineContextV1.Provider>
      </TestWrapper>
    )
    const save = queryByText('save')!
    expect(save).not.toBeInTheDocument()
  })

  test('isUpdated true and execute permissions', () => {
    const props = getProps()
    const contextValue = getDummyPipelineCanvasContextValue({
      isLoading: false,
      gitDetails: undefined,
      isReadonly: false,
      isUpdated: true
    })
    const dummyPermissionsMap = new Map()
    dummyPermissionsMap.set('EXECUTE_PIPELINE', true)
    const { queryByText } = render(
      <TestWrapper defaultPermissionValues={{ permissions: dummyPermissionsMap }}>
        <PipelineContextV1.Provider value={contextValue}>
          <PipelineCanvasV1 {...props} />
        </PipelineContextV1.Provider>
      </TestWrapper>
    )
    expect(queryByText('unsavedChanges')).toBeTruthy()
  })

  test('Enabling Edit Mode in YAML editor and checking for retention', async () => {
    // eslint-disable-next-line
    // @ts-ignore
    putPipelinePromise.mockResolvedValue(mockApiDataEmpty)
    // eslint-disable-next-line
    // @ts-ignore
    createPipelinePromise.mockResolvedValue(mockApiDataEmpty)

    const props = getProps()
    const contextValue = getDummyPipelineCanvasContextValue({ isLoading: false, isUpdated: true })
    const { getByText, getByRole } = render(
      <TestWrapper {...testWrapperProps}>
        <PipelineContextV1.Provider
          value={{
            ...contextValue,
            state: {
              ...contextValue.state,
              pipelineView: {
                ...contextValue.state.pipelineView,
                isYamlEditable: false
              }
            },
            view: 'YAML'
          }}
        >
          <PipelineCanvasV1 {...props} />
        </PipelineContextV1.Provider>
      </TestWrapper>
    )

    // Click on Edit YAML
    act(() => {
      fireEvent.click(getByText('common.editYaml'))
    })
    // Edit mode option on modal
    expect(getByText('pipeline.alwaysEditModeYAML')).toBeTruthy()
    const enableEditModeCheckbox = getByRole('checkbox', { name: 'pipeline.alwaysEditModeYAML' })
    act(() => {
      fireEvent.click(enableEditModeCheckbox)
    })
    // warning text on selection
    expect(getByText('pipeline.warningForInvalidYAMLDiscard')).toBeTruthy()
    expect(getByText('enable')).toBeTruthy()
    await act(() => {
      fireEvent.click(getByText('enable'))
    })
    await waitFor(() => expect(contextValue.updatePipelineView).toBeCalled())
  })

  test('modal title, button text when creating a new pipeline', async () => {
    const props = getProps()
    const contextValue = getDummyPipelineCanvasContextValue({ isLoading: false })
    set(contextValue, 'state.pipeline.name', '')
    set(contextValue, 'state.pipeline.identifier', DefaultNewPipelineId)

    render(
      <TestWrapper {...testWrapperProps}>
        <PipelineContextV1.Provider value={contextValue}>
          <PipelineCanvasV1 {...props} />
        </PipelineContextV1.Provider>
      </TestWrapper>
    )
    expect(screen).toMatchSnapshot()
    await waitFor(() => {
      expect(screen.getByText('start')).toBeInTheDocument()
      expect(screen.getByText('moduleRenderer.newPipeLine')).toBeInTheDocument()
    })
  })
})

describe('Existing pipeline', () => {
  const testWrapperProps: TestWrapperProps = {
    path: routes.toPipelineStudioV1({
      pipelineIdentifier: ':pipelineIdentifier',
      orgIdentifier: ':orgIdentifier',
      accountId: ':accountId',
      projectIdentifier: ':projectIdentifier'
    }),
    pathParams: {
      pipelineIdentifier: 'TEST_PIPELINE',
      orgIdentifier: 'TEST_ORG',
      accountId: 'TEST_ACCOUNT',
      projectIdentifier: 'TEST_PROJECT'
    }
  }

  beforeEach(() => {
    // eslint-disable-next-line
    // @ts-ignore
    useMutateAsGet.mockImplementation(() => {
      return mockPipelineTemplateYaml
    })
  })
  test('discard button if existing pipeline is touched', () => {
    const props = getProps()
    const contextValue = getDummyPipelineCanvasContextValue({
      isLoading: false,
      gitDetails: undefined,
      isReadonly: false,
      isUpdated: true
    })
    const { queryByText } = render(
      <TestWrapper {...testWrapperProps}>
        <PipelineContextV1.Provider value={contextValue}>
          <PipelineCanvasV1 {...props} />
        </PipelineContextV1.Provider>
      </TestWrapper>
    )
    expect(queryByText('unsavedChanges')).toBeTruthy()
  })

  test('modal title, button text when editing a pipeline', async () => {
    const props = getProps()
    const contextValue = getDummyPipelineCanvasContextValue({ isLoading: false })
    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <PipelineContextV1.Provider value={contextValue}>
          <PipelineCanvasV1 {...props} />
        </PipelineContextV1.Provider>
      </TestWrapper>
    )

    //check tags and description icon in pipeline studio
    const tagsIcon = container.querySelector('[data-icon="main-tags"]')
    expect(tagsIcon).toBeInTheDocument()
    const descriptionIcon = container.querySelector('[data-icon="description"]')
    expect(descriptionIcon).toBeInTheDocument()

    screen.getByLabelText('editPipeline').click()
    await waitFor(() => {
      expect(screen.getByText('editPipeline')).toBeInTheDocument()
      expect(screen.getByText('continue')).toBeInTheDocument()
    })
  })
})
