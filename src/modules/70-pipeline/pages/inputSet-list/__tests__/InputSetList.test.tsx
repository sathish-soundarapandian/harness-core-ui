/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  render,
  RenderResult,
  waitFor,
  fireEvent,
  getByText,
  queryByText,
  getByTestId,
  screen,
  findByText,
  findByRole
} from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { noop } from 'lodash-es'
import userEvent from '@testing-library/user-event'
import { TestWrapper, findDialogContainer, findPopoverContainer } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import * as pipelineng from 'services/pipeline-ng'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import { accountPathProps, pipelineModuleParams, pipelinePathProps } from '@common/utils/routeUtils'
import { branchStatusMock, gitConfigs, sourceCodeManagers } from '@connectors/mocks/mock'
import MonacoEditor from '@common/components/MonacoEditor/__mocks__/MonacoEditor'
import { GetYamlDiffDelResponse } from '@pipeline/components/InputSetErrorHandling/__tests__/InputSetErrorHandlingMocks'
import { PipelineResponse as PipelineDetailsMockResponse } from '../../pipeline-details/__tests__/PipelineDetailsMocks'
import InputSetList from '../InputSetList'
import {
  TemplateResponse,
  PipelineResponse,
  ConnectorResponse,
  GetInputSetsResponse,
  GetInputSetEdit,
  MergeInputSetResponse,
  GetOverlayInputSetEdit,
  GetOverlayISYamlDiff,
  GetInputSetYamlDiff
} from './InputSetListMocks'

const successResponse = (): Promise<{ status: string }> => Promise.resolve({ status: 'SUCCESS', data: {} })
jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('react-monaco-editor', () => ({
  MonacoDiffEditor: MonacoEditor
}))

jest.mock('@common/components/MonacoEditor/MonacoEditor')
jest.useFakeTimers()

jest.mock('@common/hooks', () => ({
  ...(jest.requireActual('@common/hooks') as any),

  useMutateAsGet: jest.fn().mockImplementation(() => {
    return TemplateResponse
  })
}))
const deleteInputSetMock = jest.fn()
const deleteInputSet = (): Promise<{ status: string }> => {
  deleteInputSetMock()
  return Promise.resolve({ status: 'SUCCESS' })
}
const getInputSetList = jest.fn()

jest.mock('@common/components/YAMLBuilder/YamlBuilder')
jest.mock('@common/utils/YamlUtils', () => ({}))
jest.mock('services/cd-ng', () => ({
  useGetConnector: jest.fn(() => ConnectorResponse),
  useCreatePR: jest.fn(() => noop),
  useCreatePRV2: jest.fn(() => noop),
  useGetFileContent: jest.fn(() => noop),
  useGetFileByBranch: jest.fn().mockImplementation(() => ({ refetch: jest.fn() })),
  useGetListOfBranchesWithStatus: jest.fn().mockImplementation(() => {
    return { data: branchStatusMock, refetch: jest.fn(), loading: false }
  }),
  useListGitSync: jest.fn().mockImplementation(() => {
    return { data: gitConfigs, refetch: jest.fn() }
  }),
  useGetSourceCodeManagers: jest.fn().mockImplementation(() => {
    return { data: sourceCodeManagers, refetch: jest.fn() }
  })
}))

jest.mock('services/pipeline-ng', () => ({
  useGetPipeline: jest.fn(() => PipelineResponse),
  useGetPipelineSummary: jest.fn(() => PipelineDetailsMockResponse),
  useGetTemplateFromPipeline: jest.fn(() => TemplateResponse),
  useGetStagesExecutionList: jest.fn(() => ({})),
  useGetMergeInputSetFromPipelineTemplateWithListInput: jest.fn(() => MergeInputSetResponse),
  useGetOverlayInputSetForPipeline: jest.fn(() => GetOverlayInputSetEdit),
  useCreateInputSetForPipeline: jest.fn(() => ({})),
  useUpdateInputSetForPipeline: jest.fn().mockImplementation(() => ({ mutate: successResponse })),
  useUpdateOverlayInputSetForPipeline: jest.fn().mockImplementation(() => ({ mutate: successResponse })),
  useCreateOverlayInputSetForPipeline: jest.fn(() => ({})),
  useGetInputSetsListForPipeline: jest.fn().mockImplementation(args => {
    getInputSetList(args)
    return GetInputSetsResponse
  }),
  getInputSetForPipelinePromise: jest.fn().mockImplementation(() => Promise.resolve(GetInputSetsResponse.data)),
  useGetInputSetForPipeline: jest.fn(() => GetInputSetEdit),
  useDeleteInputSetForPipeline: jest.fn().mockImplementation(() => ({ mutate: deleteInputSet })),
  usePostPipelineExecuteWithInputSetYaml: jest.fn(() => ({})),
  useGetSchemaYaml: jest.fn(() => ({})),
  useSoftDeletePipeline: jest.fn().mockImplementation(() => ({ mutate: jest.fn() })),
  useGetInputsetYaml: jest.fn(() => ({ data: null })),
  useYamlDiffForInputSet: jest.fn(() => ({ data: null }))
}))

const TEST_PATH = routes.toInputSetList({ ...accountPathProps, ...pipelinePathProps, ...pipelineModuleParams })

const intersectionObserverMock = () => ({
  observe: () => null,
  unobserve: () => null
})

window.IntersectionObserver = jest.fn().mockImplementation(intersectionObserverMock)

const renderComponent = (): RenderResult => {
  return render(
    <TestWrapper
      path={TEST_PATH}
      pathParams={{
        accountId: 'testAcc',
        orgIdentifier: 'testOrg',
        projectIdentifier: 'test',
        pipelineIdentifier: 'pipeline',
        module: 'cd'
      }}
      defaultAppStoreValues={defaultAppStoreValues}
    >
      <InputSetList />
    </TestWrapper>
  )
}

describe('Input Set List tests', () => {
  test('render Input Set List view', async () => {
    const { getAllByText, container } = renderComponent()
    jest.runOnlyPendingTimers()
    await waitFor(() => getAllByText('OverLayInput'))
    expect(container).toMatchSnapshot()
  })
})

describe('Input Set List - Actions tests', () => {
  let container: HTMLElement | undefined
  let getAllByText: RenderResult['getAllByText'] | undefined

  beforeEach(async () => {
    const renderObj = renderComponent()
    container = renderObj.container
    getAllByText = renderObj.getAllByText
    await waitFor(() => getAllByText?.('OverLayInput'))
  })

  test('click handler for Input Set', async () => {
    const inputSetRow = getAllByText?.('asd')[0]
    await act(async () => {
      fireEvent.click(inputSetRow!)
      await waitFor(() => getByTestId(document.body, 'location'))
      expect(
        getByTestId(document.body, 'location').innerHTML.endsWith(
          routes.toInputSetForm({
            accountId: 'testAcc',
            orgIdentifier: 'testOrg',
            projectIdentifier: 'test',
            pipelineIdentifier: 'pipeline',
            inputSetIdentifier: 'asd',
            module: 'cd'
          } as any)
        )
      ).toBeTruthy()
    })
  })

  test('click handler for Overlay Input Set', async () => {
    const inputSetRow = getAllByText?.('OverLayInput')[0]
    await act(async () => {
      fireEvent.click(inputSetRow!)
      await waitFor(() => getByText(document.body, 'inputSets.editOverlayTitle'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()
    })
  })

  test('click handler for edit Overlay Input Set from menu', async () => {
    const menu = container?.querySelectorAll("[icon='more']")[0]
    fireEvent.click(menu!)
    const editMenu = getAllByText?.('edit')[0]
    await act(async () => {
      fireEvent.click(editMenu!)
      await waitFor(() => getByText(document.body, 'inputSets.editOverlayTitle'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()
    })
  })

  test('click handler for edit Input Set from menu', async () => {
    const menu = container?.querySelectorAll("[icon='more']")[1]
    fireEvent.click(menu!)
    const editMenu = getAllByText?.('edit')[0]
    await act(async () => {
      fireEvent.click(editMenu!)
      await waitFor(() => getByTestId(document.body, 'location'))
      expect(
        getByTestId(document.body, 'location').innerHTML.endsWith(
          routes.toInputSetForm({
            accountId: 'testAcc',
            orgIdentifier: 'testOrg',
            projectIdentifier: 'test',
            pipelineIdentifier: 'pipeline',
            inputSetIdentifier: 'asd',
            module: 'cd'
          } as any)
        )
      ).toBeTruthy()
    })
  })

  test('click handler for delete Overlay Input Set from menu', async () => {
    deleteInputSetMock.mockReset()
    const menu = container?.querySelectorAll("[icon='more']")[0]
    fireEvent.click(menu!)
    const deleteMenu = getAllByText?.('delete')[0]
    await act(async () => {
      fireEvent.click(deleteMenu!)
      await waitFor(() => getByText(document.body, 'delete inputSets.overlayInputSet'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()
      const deleteBtn = queryByText(form as HTMLElement, 'delete')
      fireEvent.click(deleteBtn!)
      await waitFor(() => getByText(document.body, 'inputSets.inputSetDeleted'))
      expect(deleteInputSetMock).toBeCalled()
    })
  })

  test('click handler for delete Input Set from menu', async () => {
    deleteInputSetMock.mockReset()
    const menu = container?.querySelectorAll("[icon='more']")[1]
    fireEvent.click(menu!)
    const deleteMenu = getAllByText?.('delete')[0]
    await act(async () => {
      fireEvent.click(deleteMenu!)
      await waitFor(() => getByText(document.body, 'delete inputSets.inputSetLabel'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()
      const deleteBtn = queryByText(form as HTMLElement, 'delete')
      fireEvent.click(deleteBtn!)
      await waitFor(() => getByText(document.body, 'inputSets.inputSetDeleted'))
      expect(deleteInputSetMock).toBeCalled()
    })
  })

  test('click handler for new Overlay Input Set', async () => {
    const menu = getAllByText?.('inputSets.newInputSet')[0]
    fireEvent.click(menu!)
    const popover = findPopoverContainer()
    const newInputSet = getByText(popover as HTMLElement, 'inputSets.overlayInputSet')
    await act(async () => {
      fireEvent.click(newInputSet)
      await waitFor(() => getByText(document.body, 'inputSets.newOverlayInputSet'))
      let form = findDialogContainer()
      expect(form).toBeTruthy()
      // Close
      fireEvent.click(form?.querySelector('[icon="small-cross"]')!)
      form = findDialogContainer()
      expect(form).not.toBeTruthy()
    })
  })

  test('click handler for new Input Set', async () => {
    const menu = getAllByText?.('inputSets.newInputSet')[0]
    fireEvent.click(menu!)
    const popover = findPopoverContainer()
    const newInputSet = getByText(popover as HTMLElement, 'inputSets.inputSetLabel')
    await act(async () => {
      fireEvent.click(newInputSet)
      await waitFor(() => getByTestId(document.body, 'location'))
      expect(
        getByTestId(document.body, 'location').innerHTML.endsWith(
          routes.toInputSetForm({
            accountId: 'testAcc',
            orgIdentifier: 'testOrg',
            projectIdentifier: 'test',
            pipelineIdentifier: 'pipeline',
            inputSetIdentifier: '-1',
            module: 'cd'
          } as any)
        )
      ).toBeTruthy()
    })
  })

  test('search Input Set list', async () => {
    getInputSetList.mockReset()
    const searchInput = container?.querySelector('[placeholder="inputSets.searchInputSet"]') as HTMLInputElement
    fireEvent.change(searchInput, { target: { value: 'asd' } })
    expect(getInputSetList).toBeCalledWith({
      debounce: 300,
      queryParams: {
        accountIdentifier: 'testAcc',
        orgIdentifier: 'testOrg',
        pageIndex: 0,
        pageSize: 20,
        pipelineIdentifier: 'pipeline',
        projectIdentifier: 'test',
        searchTerm: 'asd'
      }
    })
  })
})

describe('Input Set List - Reconcile Button', () => {
  test('should not open reconcile dialog on clicking reconcile button, when loading state is true', async () => {
    jest.spyOn(pipelineng, 'getInputSetForPipelinePromise').mockImplementation((): any => GetInputSetsResponse)
    jest.spyOn(pipelineng, 'useYamlDiffForInputSet').mockImplementation((): any => {
      return {
        data: {
          data: {},
          status: 'SUCCESS'
        },
        loading: true,
        refetch: jest.fn(),
        error: null
      }
    })
    renderComponent()
    await waitFor(() => screen.getAllByText('OverLayInput'))

    const reconcileBtns = await screen.findAllByRole('button', { name: 'pipeline.outOfSyncErrorStrip.reconcile' })
    userEvent.click(reconcileBtns[1])
    expect(pipelineng.useYamlDiffForInputSet).toHaveBeenCalled()

    const reconcileDialog = findDialogContainer() as HTMLElement
    await waitFor(() => expect(reconcileDialog).toBeFalsy())
  })

  test('Input Set - should open reconcile dialog on clicking reconcile button, when loading state is false & input set is not empty', async () => {
    jest.spyOn(pipelineng, 'useYamlDiffForInputSet').mockImplementation((): any => GetInputSetYamlDiff)
    renderComponent()
    await waitFor(() => screen.getAllByText('OverLayInput'))

    const reconcileBtns = await screen.findAllByRole('button', { name: 'pipeline.outOfSyncErrorStrip.reconcile' })
    userEvent.click(reconcileBtns[1])
    expect(pipelineng.useYamlDiffForInputSet).toHaveBeenCalled()

    const reconcileDialog = findDialogContainer() as HTMLElement
    await findByText(reconcileDialog, 'pipeline.inputSetErrorStrip.reconcileDialogTitle')
    const removeInvalidFieldBtn = await findByRole(reconcileDialog, 'button', {
      name: 'pipeline.inputSets.removeInvalidFields'
    })
    userEvent.click(removeInvalidFieldBtn)
    await waitFor(() => expect(pipelineng.useUpdateInputSetForPipeline).toHaveBeenCalled())
  })

  test('Overlay Input Set - should open reconcile dialog on clicking reconcile button, when loading state is false & input set is not empty', async () => {
    jest.spyOn(pipelineng, 'useYamlDiffForInputSet').mockImplementation((): any => GetOverlayISYamlDiff)
    renderComponent()
    jest.runOnlyPendingTimers()
    await waitFor(() => screen.getAllByText('OverLayInput'))

    const reconcileBtns = await screen.findAllByRole('button', { name: 'pipeline.outOfSyncErrorStrip.reconcile' })
    userEvent.click(reconcileBtns[0])
    expect(pipelineng.useYamlDiffForInputSet).toHaveBeenCalled()

    await screen.findAllByText('pipeline.inputSetErrorStrip.reconcileDialogTitle')
    const removeInvalidFieldBtn = await screen.findAllByRole('button', {
      name: 'pipeline.inputSets.removeInvalidFields'
    })
    userEvent.click(removeInvalidFieldBtn[0])
    await waitFor(() => expect(pipelineng.useUpdateOverlayInputSetForPipeline).toHaveBeenCalled())
  })

  test('should open delete input set modal on clicking reconcile button, if input set is empty', async () => {
    jest.spyOn(pipelineng, 'useYamlDiffForInputSet').mockImplementation((): any => GetYamlDiffDelResponse)
    jest.spyOn(pipelineng, 'useDeleteInputSetForPipeline').mockImplementation((): any => {
      return {
        mutate: () =>
          Promise.resolve({
            status: 'SUCCESS'
          })
      }
    })
    renderComponent()
    jest.runOnlyPendingTimers()
    await waitFor(() => screen.getAllByText('OverLayInput'))

    const reconcileBtns = await screen.findAllByRole('button', { name: 'pipeline.outOfSyncErrorStrip.reconcile' })
    userEvent.click(reconcileBtns[0])
    expect(pipelineng.useYamlDiffForInputSet).toHaveBeenCalled()

    const deleteInputSetModal = findDialogContainer() as HTMLElement
    await findByText(deleteInputSetModal, 'pipeline.inputSets.invalidOverlayISDesc2')
    const deleteOverlayISBtn = await findByRole(deleteInputSetModal, 'button', {
      name: 'pipeline.inputSets.deleteOverlayIS'
    })

    userEvent.click(deleteOverlayISBtn)
    await waitFor(() => expect(pipelineng.useDeleteInputSetForPipeline).toHaveBeenCalled())
  })
})
