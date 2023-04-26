/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, act, fireEvent, waitFor, screen } from '@testing-library/react'
import { set } from 'lodash-es'
import { putPipelinePromise, createPipelineV2Promise, PipelineInfoConfig } from 'services/pipeline-ng'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { useMutateAsGet } from '@common/hooks'
import routes from '@common/RouteDefinitions'
import { PipelineCanvas, PipelineCanvasProps } from '../PipelineCanvas'
import { PipelineContext } from '../../PipelineContext/PipelineContext'
import { DefaultNewPipelineId, DrawerTypes } from '../../PipelineContext/PipelineActions'
import {
  getDummyPipelineCanvasContextValue,
  mockApiDataEmpty,
  mockPipelineTemplateYaml
} from './PipelineCanvasTestHelper'
import duplicateStepIdentifierPipeline from './mock/duplicateStepIdentifierPipeline.json'
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
jest.mock('resize-observer-polyfill', () => {
  class ResizeObserver {
    static default = ResizeObserver
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    observe() {
      // do nothing
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    unobserve() {
      // do nothing
    }
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    disconnect() {
      // do nothing
    }
  }
  return ResizeObserver
})
jest.mock('framework/GitRepoStore/GitSyncStoreContext', () => ({
  useGitSyncStore: jest.fn().mockReturnValue({ gitSyncRepos: [{ identifier: 'repoIdentifier', name: 'repoName' }] })
}))

jest.mock('services/pipeline-ng', () => ({
  putPipelinePromise: jest.fn(),
  createPipelineV2Promise: jest.fn(),
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
const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockReturnValue({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
})
window.IntersectionObserver = mockIntersectionObserver
/* Mocks end */

describe('Pipeline Canvas - new pipeline', () => {
  const testWrapperProps: TestWrapperProps = {
    path: routes.toPipelineStudio({
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
        <PipelineContext.Provider value={contextValue}>
          <PipelineCanvas {...props} />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    act(() => {
      fireEvent.click(getByText('save'))
    })
    // isUpdated - false disables save button
    expect(createPipelineV2Promise).not.toBeCalled()
  })

  test('function calls on switch to YAML mode and back to VISUAL', async () => {
    // eslint-disable-next-line
    // @ts-ignore
    putPipelinePromise.mockResolvedValue(mockApiDataEmpty)
    // eslint-disable-next-line
    // @ts-ignore
    createPipelineV2Promise.mockResolvedValue(mockApiDataEmpty)

    const props = getProps()
    const contextValue = getDummyPipelineCanvasContextValue({ isLoading: false, isUpdated: true })
    const { getByText, queryByText } = render(
      <TestWrapper {...testWrapperProps}>
        <PipelineContext.Provider value={contextValue}>
          <PipelineCanvas {...props} />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    // toggle to YAMl works
    act(() => {
      fireEvent.click(getByText('YAML'))
    })
    expect(contextValue.updatePipelineView).toBeCalledWith({
      splitViewData: {},
      isDrawerOpened: false,
      isYamlEditable: false,
      isSplitViewOpen: false,
      drawerData: { type: DrawerTypes.AddStep }
    })
    expect(contextValue.setView).toBeCalledWith('YAML')
    expect(contextValue.setSelectedStageId).toBeCalledWith(undefined)
    expect(contextValue.setSelectedSectionId).toBeCalledWith(undefined)

    // Click on VISUAL again
    act(() => {
      fireEvent.click(getByText('VISUAL'))
    })
    // Now component is state less so visual click will not happen
    // expect(contextValue.setView).toHaveBeenLastCalledWith('VISUAL')
    expect(queryByText('save')).toBeTruthy()

    act(() => {
      fireEvent.click(getByText('save'))
    })
    expect(contextValue.setSchemaErrorView).toBeCalledWith(false)
    await waitFor(() => expect(contextValue.deletePipelineCache).toBeCalled())
    expect(showSuccess).toBeCalled()
    expect(contextValue.fetchPipeline).toBeCalledWith({
      forceFetch: true,
      forceUpdate: true,
      newPipelineId: 'Pipeline'
    })
    expect(props.toPipelineStudio).toBeCalled()
  })

  test('duplicate identifiers error on switching back to VISUAL from YAML mode', async () => {
    // eslint-disable-next-line
    // @ts-ignore
    putPipelinePromise.mockResolvedValue(mockApiDataEmpty)
    // eslint-disable-next-line
    // @ts-ignore
    createPipelineV2Promise.mockResolvedValue(mockApiDataEmpty)
    const props = getProps()
    const contextValue = getDummyPipelineCanvasContextValue({ isLoading: false, isUpdated: true })
    const { getByText } = render(
      <TestWrapper {...testWrapperProps}>
        <PipelineContext.Provider
          value={{
            ...contextValue,
            state: {
              ...contextValue.state,
              pipeline: duplicateStepIdentifierPipeline as PipelineInfoConfig,
              pipelineView: {
                splitViewData: {},
                isDrawerOpened: false,
                isYamlEditable: false,
                isSplitViewOpen: false,
                drawerData: { type: DrawerTypes.AddStep }
              }
            },

            view: 'YAML'
          }}
        >
          <PipelineCanvas {...props} />
        </PipelineContext.Provider>
      </TestWrapper>
    )

    // Click on VISUAL again
    fireEvent.click(getByText('VISUAL'))

    await waitFor(() => expect(showError).toBeCalledWith('pipeline.duplicateStepIdentifiers', 5000))
  })

  test('loading state', () => {
    const props = getProps()
    const contextValue = getDummyPipelineCanvasContextValue({ isLoading: true })
    const { queryByText } = render(
      <TestWrapper {...testWrapperProps}>
        <PipelineContext.Provider value={contextValue}>
          <PipelineCanvas {...props} />
        </PipelineContext.Provider>
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
        <PipelineContext.Provider value={contextValue}>
          <PipelineCanvas {...props} />
        </PipelineContext.Provider>
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
        <PipelineContext.Provider value={contextValue}>
          <PipelineCanvas {...props} />
        </PipelineContext.Provider>
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
        <PipelineContext.Provider value={contextValue}>
          <PipelineCanvas {...props} />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    const save = queryByText('save')!
    expect(save).toBeInTheDocument()
    fireEvent.mouseOver(save)
    expect(await screen.findByText('common.viewAndExecutePermissions')).toBeInTheDocument()
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
        <PipelineContext.Provider value={contextValue}>
          <PipelineCanvas {...props} />
        </PipelineContext.Provider>
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
    createPipelineV2Promise.mockResolvedValue(mockApiDataEmpty)

    const props = getProps()
    const contextValue = getDummyPipelineCanvasContextValue({ isLoading: false, isUpdated: true })
    const { getByText, getByRole } = render(
      <TestWrapper {...testWrapperProps}>
        <PipelineContext.Provider
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
          <PipelineCanvas {...props} />
        </PipelineContext.Provider>
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
    set(contextValue, 'state.pipeline.identifier', DefaultNewPipelineId)

    render(
      <TestWrapper {...testWrapperProps}>
        <PipelineContext.Provider value={contextValue}>
          <PipelineCanvas {...props} />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    await waitFor(() => {
      expect(screen.getByText('start')).toBeInTheDocument()
      expect(screen.getByText('moduleRenderer.newPipeLine')).toBeInTheDocument()
    })
  })
})

describe('Existing pipeline', () => {
  const testWrapperProps: TestWrapperProps = {
    path: routes.toPipelineStudio({
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
        <PipelineContext.Provider value={contextValue}>
          <PipelineCanvas {...props} />
        </PipelineContext.Provider>
      </TestWrapper>
    )
    expect(queryByText('unsavedChanges')).toBeTruthy()
  })

  test('modal title, button text when editing a pipeline', async () => {
    const props = getProps()
    const contextValue = getDummyPipelineCanvasContextValue({ isLoading: false })
    const { container } = render(
      <TestWrapper {...testWrapperProps}>
        <PipelineContext.Provider value={contextValue}>
          <PipelineCanvas {...props} />
        </PipelineContext.Provider>
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
