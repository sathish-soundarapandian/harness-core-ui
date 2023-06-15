/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

/* eslint-disable react/display-name */
import React from 'react'
import { render, waitFor, fireEvent, act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import mockImport from 'framework/utils/mockImport'
import type { GraphLayoutNode } from 'services/pipeline-ng'
import * as logsService from 'services/logs'
import { TestWrapper } from '@common/utils/testUtils'
import { ExecutionContext, ExecutionContextParams } from '@pipeline/context/ExecutionContext'
import { nodeLayoutForCIStage } from '@pipeline/utils/__tests__/mockJson/mockExecutionContext'
import { LogsContent, DefaultConsoleViewStepDetails } from '../LogsContent'
import { useLogsContent } from '../useLogsContent'
import { getDefaultReducerState } from '../LogsState/utils'
import type { UseActionCreatorReturn } from '../LogsState/actions'
import { testReducerState } from './mocks'
import responseMessages from './reponseMessages.json'

jest.mock('../components/GroupedLogs', () => ({
  GroupedLogsWithRef: React.forwardRef(() => <div>Grouped logs</div>)
}))

const SELECTED_STEP_SYMBOL = Symbol('SELECTED_STEP_SYMBOL')
const RETRY_STEP_SYMBOL = Symbol(' RETRY_STEP_SYMBOL')
const actions: UseActionCreatorReturn = {
  createSections: jest.fn(),
  fetchSectionData: jest.fn(),
  fetchingSectionData: jest.fn(),
  updateSectionData: jest.fn(),
  updateManuallyToggled: jest.fn(),
  toggleSection: jest.fn(),
  resetSection: jest.fn(),
  search: jest.fn(),
  resetSearch: jest.fn(),
  goToNextSearchResult: jest.fn(),
  goToPrevSearchResult: jest.fn()
}

const execContextValues: ExecutionContextParams = {
  pipelineExecutionDetail: null,
  allNodeMap: {},
  pipelineStagesMap: new Map(),
  childPipelineStagesMap: new Map(),
  rollbackPipelineStagesMap: new Map(),
  allStagesMap: new Map(),
  selectedStageId: '',
  selectedStepId: '',
  selectedStageExecutionId: '',
  selectedCollapsedNodeId: '',
  loading: false,
  isDataLoadedForSelectedStage: false,
  queryParams: {},
  logsToken: '',
  setLogsToken: jest.fn(),
  refetch: undefined,
  addNewNodeToMap: jest.fn()
}

jest.mock('moment', () => () => ({ format: () => 'DUMMY_DATE' }))

jest.mock('services/logs', () => ({
  useGetToken: jest.fn(() => ({})),
  logBlobPromise: jest.fn(() => Promise.resolve({})),
  rcaPromise: jest.fn().mockImplementation(() => Promise.resolve({ rca: '```sample markdown text```' }))
}))
jest.mock('../useLogsContent.tsx', () => ({
  useLogsContent: jest.fn(() => ({
    state: getDefaultReducerState(),
    actions
  }))
}))

mockImport('@common/hooks/useFeatureFlag', {
  useFeatureFlags: () => ({ CI_AI_ENHANCED_REMEDIATIONS: true, CD_AI_ENHANCED_REMEDIATIONS: true })
})

describe('<LogsContent /> tests', () => {
  beforeEach(() => {
    Object.entries(actions).map(([_, fn]: [string, jest.Mock]) => fn.mockReset())
  })
  test('DefaultConsoleViewStepDetails snapshot test', () => {
    const { container } = render(
      <TestWrapper>
        <DefaultConsoleViewStepDetails step={{} as any} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('console-view snapshot test', () => {
    const { container } = render(
      <TestWrapper>
        <LogsContent mode="console-view" />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('step-details snapshot test', () => {
    const { container } = render(
      <TestWrapper>
        <LogsContent mode="step-details" />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('console-view error message test', () => {
    const { container } = render(
      <TestWrapper>
        <ExecutionContext.Provider
          value={{
            ...execContextValues,
            selectedStepId: 'SELECTED_STEP',
            selectedStageId: 'SELECTED_STAGE',
            allNodeMap: { SELECTED_STEP: { failureInfo: { responseMessages } } } as any
          }}
        >
          <LogsContent mode="console-view" />
        </ExecutionContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('console-view warning message test', () => {
    const { container } = render(
      <TestWrapper>
        <ExecutionContext.Provider
          value={{
            ...execContextValues,
            selectedStepId: 'SELECTED_STEP',
            selectedStageId: 'SELECTED_STAGE',
            allNodeMap: { SELECTED_STEP: { failureInfo: { responseMessages } } } as any
          }}
        >
          <LogsContent mode="console-view" isWarning />
        </ExecutionContext.Provider>
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  describe('createSections tests', () => {
    test('createSections is called with correct arguments', async () => {
      render(
        <TestWrapper>
          <ExecutionContext.Provider
            value={{
              ...execContextValues,
              selectedStepId: 'SELECTED_STEP',
              selectedStageId: 'SELECTED_STAGE',
              allNodeMap: { SELECTED_STEP: SELECTED_STEP_SYMBOL, RETRY_STEP: RETRY_STEP_SYMBOL } as any
            }}
          >
            <DefaultConsoleViewStepDetails step={{} as any} />
          </ExecutionContext.Provider>
        </TestWrapper>
      )

      await waitFor(() =>
        expect(actions.createSections).toHaveBeenCalledWith({
          selectedStep: 'SELECTED_STEP',
          node: SELECTED_STEP_SYMBOL,
          selectedStage: 'SELECTED_STAGE',
          getSectionName: expect.any(Function)
        })
      )
    })

    test('createSections is called with correct arguments (retry step)', async () => {
      render(
        <TestWrapper>
          <ExecutionContext.Provider
            value={{
              ...execContextValues,
              selectedStepId: 'SELECTED_STEP',
              selectedStageId: 'SELECTED_STAGE',
              allNodeMap: { SELECTED_STEP: SELECTED_STEP_SYMBOL, RETRY_STEP: RETRY_STEP_SYMBOL } as any,
              queryParams: {
                retryStep: 'RETRY_STEP'
              }
            }}
          >
            <DefaultConsoleViewStepDetails step={{} as any} />
          </ExecutionContext.Provider>
        </TestWrapper>
      )

      await waitFor(() =>
        expect(actions.createSections).toHaveBeenCalledWith({
          selectedStep: 'SELECTED_STEP',
          node: RETRY_STEP_SYMBOL,
          selectedStage: 'SELECTED_STAGE',
          getSectionName: expect.any(Function)
        })
      )
    })
  })

  describe('search tests', () => {
    test('search works', async () => {
      const { container } = render(
        <TestWrapper>
          <LogsContent mode="console-view" errorMessage="This is an error message" />
        </TestWrapper>
      )

      const searchElem = container.querySelector('[type="search"]')!

      fireEvent.change(searchElem, { target: { value: 'hello' } })

      await waitFor(() => expect(actions.search).toHaveBeenCalledWith('hello'))

      fireEvent.change(searchElem, { target: { value: '' } })

      await waitFor(() => expect(actions.resetSearch).toHaveBeenCalledWith())
    })

    test('keyboard nav works', async () => {
      const { container } = render(
        <TestWrapper>
          <LogsContent mode="console-view" errorMessage="This is an error message" />
        </TestWrapper>
      )

      const elem = container.querySelector('.rhs')!

      fireEvent.keyDown(elem, { key: 'ArrowUp' })

      await waitFor(() => expect(actions.goToPrevSearchResult).toHaveBeenCalledWith())

      fireEvent.keyDown(elem, { key: 'ArrowDown' })

      await waitFor(() => expect(actions.goToNextSearchResult).toHaveBeenCalledWith())
    })
  })

  describe('Logs test', () => {
    test('SingleSectionLogs', () => {
      ;(useLogsContent as jest.Mock).mockImplementation(() => ({
        state: { ...testReducerState, units: ['Section 1'] },
        actions
      }))

      const { container, getByText } = render(
        <TestWrapper>
          <LogsContent mode="console-view" />
        </TestWrapper>
      )
      const button = getByText('Bottom')
      userEvent.click(button)
      expect(container).toMatchSnapshot()
    })

    test('GroupedLogs', () => {
      ;(useLogsContent as jest.Mock).mockImplementation(() => ({
        state: { ...testReducerState, units: ['Section 1', 'Section 2'] },
        actions
      }))

      const { container, getByText } = render(
        <TestWrapper>
          <LogsContent mode="console-view" />
        </TestWrapper>
      )

      expect(container).toMatchSnapshot()
      expect(getByText('Grouped logs')).toBeTruthy()
    })
  })

  describe('Harness Copilot integration testing', () => {
    const commonArgs = {
      ...execContextValues,
      selectedStepId: 'SELECTED_STEP',
      selectedStageId: 'SELECTED_CI_STAGE',
      allNodeMap: { SELECTED_STEP: { failureInfo: { responseMessages } } } as any,
      pipelineStagesMap: new Map<string, GraphLayoutNode>([['SELECTED_CI_STAGE', nodeLayoutForCIStage]]),
      logsToken: 'x-harness-token'
    }
    test('Harness Copilot integration', async () => {
      const spy = jest.spyOn(logsService, 'rcaPromise')
      const { getByText } = render(
        <TestWrapper>
          <ExecutionContext.Provider value={commonArgs}>
            <LogsContent mode="console-view" />
          </ExecutionContext.Provider>
        </TestWrapper>
      )
      // Verify footer is visible
      expect(getByText('pipeline.copilot.askAICopilot')).toBeInTheDocument()

      act(() => {
        fireEvent.click(getByText('pipeline.copilot.askAICopilot'))
      })

      // Should update status when clicked on Ask AI
      await waitFor(() => {
        expect(getByText('pipeline.copilot.analyzing')).toBeInTheDocument()
      })

      expect(spy).toBeCalled()
    })

    test('Test success scenario', async () => {
      const { getByText, rerender } = render(
        <TestWrapper>
          <ExecutionContext.Provider value={commonArgs}>
            <LogsContent mode="console-view" />
          </ExecutionContext.Provider>
        </TestWrapper>
      )

      // Verify footer is visible
      expect(getByText('pipeline.copilot.askAICopilot')).toBeInTheDocument()

      act(() => {
        fireEvent.click(getByText('pipeline.copilot.askAICopilot'))
      })

      // Should update status when clicked on Ask AI
      await waitFor(() => {
        expect(getByText('pipeline.copilot.foundPossibleRemediations')).toBeInTheDocument()
      })

      act(() => {
        fireEvent.click(getByText('common.viewText'))
      })

      // wait for the side panel to be visible
      await waitFor(() => {
        expect(getByText('pipeline.copilot.possibleSolutions')).toBeInTheDocument()
      })

      await waitFor(() => expect(document.body.querySelector(`.bp3-drawer`)).not.toBeNull())
      const drawerArr = document.getElementsByClassName('bp3-drawer')
      expect(drawerArr).toHaveLength(1)

      // drawer close takes user back to button view
      const closeDrawerButton = screen.getByTestId('close-drawer-button')
      userEvent.click(closeDrawerButton)

      await waitFor(() => expect(screen.queryByText('pipeline.copilot.possibleSolutions')).not.toBeInTheDocument())

      await waitFor(() => {
        expect(getByText('pipeline.copilot.foundPossibleRemediations')).toBeInTheDocument()
      })

      const argsForNextStepSelection = {
        ...execContextValues,
        selectedStepId: 'SELECTED_STEP',
        selectedStageId: 'SELECTED_CI_STAGE',
        allNodeMap: {
          SELECTED_STEP: { failureInfo: { responseMessages } },
          SELECTED_STEP_1: { failureInfo: { responseMessages } }
        } as any,
        pipelineStagesMap: new Map<string, GraphLayoutNode>([['SELECTED_CI_STAGE', nodeLayoutForCIStage]]),
        logsToken: 'x-harness-token'
      }

      rerender(
        <TestWrapper>
          <ExecutionContext.Provider value={{ ...argsForNextStepSelection, selectedStepId: 'SELECTED_STEP_1' }}>
            <LogsContent mode="console-view" />
          </ExecutionContext.Provider>
        </TestWrapper>
      )

      // Ask AI option should be visible once again if a different step is selected
      expect(getByText('pipeline.copilot.askAICopilot')).toBeInTheDocument()
    })

    test('Stop button option should be visible if remediations take too long to fetch', async () => {
      const { getByText } = render(
        <TestWrapper>
          <ExecutionContext.Provider value={commonArgs}>
            <LogsContent mode="console-view" />
          </ExecutionContext.Provider>
        </TestWrapper>
      )

      act(() => {
        fireEvent.click(getByText('pipeline.copilot.askAICopilot'))
      })

      // Should update status when clicked on Ask AI
      await waitFor(() => {
        expect(getByText('pipeline.copilot.analyzing')).toBeInTheDocument()
      })

      const stopBtn = document.getElementsByClassName('statusActionBtn')?.[0]

      expect(stopBtn).toBeInTheDocument()
    })

    test('Test failure scenario when api fails', async () => {
      jest.spyOn(logsService, 'rcaPromise').mockReturnValue(
        Promise.reject({
          error: {
            message: 'error',
            status: 400
          }
        })
      )

      const { getByText } = render(
        <TestWrapper>
          <ExecutionContext.Provider value={commonArgs}>
            <LogsContent mode="console-view" />
          </ExecutionContext.Provider>
        </TestWrapper>
      )

      act(() => {
        fireEvent.click(getByText('pipeline.copilot.askAICopilot'))
      })

      await waitFor(() => {
        expect(getByText('retry')).toBeInTheDocument()
      })
    })

    test('Test failure scenario when api returns error', async () => {
      jest.spyOn(logsService, 'rcaPromise').mockReturnValue(
        Promise.resolve({
          error_msg: 'Could not connect'
        } as any)
      )

      const { getByText } = render(
        <TestWrapper>
          <ExecutionContext.Provider value={commonArgs}>
            <LogsContent mode="console-view" />
          </ExecutionContext.Provider>
        </TestWrapper>
      )

      act(() => {
        fireEvent.click(getByText('pipeline.copilot.askAICopilot'))
      })

      await waitFor(() => {
        expect(getByText('retry')).toBeInTheDocument()
      })
    })

    test('Test failure scenario when no logsToken is available', async () => {
      const { getByText } = render(
        <TestWrapper>
          <ExecutionContext.Provider value={{ ...commonArgs, logsToken: '' }}>
            <LogsContent mode="console-view" />
          </ExecutionContext.Provider>
        </TestWrapper>
      )

      act(() => {
        fireEvent.click(getByText('pipeline.copilot.askAICopilot'))
      })

      await waitFor(() => {
        expect(getByText('retry')).toBeInTheDocument()
      })
    })
  })
})
