import React from 'react'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import { defaultAppStoreValues } from '@common/utils/DefaultAppStoreData'
import routes from '@common/RouteDefinitions'
import { accountPathProps, pipelineModuleParams, triggerPathProps } from '@common/utils/routeUtils'
import * as pipelineServices from 'services/pipeline-ng'
import * as FeatureFlag from '@common/hooks/useFeatureFlag'
import MonacoEditor from '@common/components/MonacoEditor/__mocks__/MonacoEditor'
import TriggerActivityHistoryPage from '../TriggerActivityHistoryPage/TriggerActivityHistoryPage'
import { errorLoadingList, triggerActivityHistoryList } from './TriggerActivityHistoryPageMocks'

jest.mock('react-monaco-editor', () => ({
  MonacoDiffEditor: MonacoEditor
}))

jest.mock('@common/components/MonacoEditor/MonacoEditor', () => MonacoEditor)
jest.spyOn(FeatureFlag, 'useFeatureFlags').mockReturnValue({
  CDS_TRIGGER_ACTIVITY_PAGE: true
})

const TEST_PATH = routes.toTriggersActivityHistoryPage({
  ...accountPathProps,
  ...triggerPathProps,
  ...pipelineModuleParams
})

function TestComponent(): React.ReactElement {
  return (
    <TestWrapper
      path={TEST_PATH}
      pathParams={{
        accountId: 'testAcc',
        orgIdentifier: 'testOrg',
        projectIdentifier: 'test',
        pipelineIdentifier: 'pipeline',
        triggerIdentifier: 'triggerIdentifier',
        module: 'cd'
      }}
      defaultAppStoreValues={defaultAppStoreValues}
    >
      <TriggerActivityHistoryPage />
    </TestWrapper>
  )
}

describe('Test Trigger Detail Page Test', () => {
  test('Show page spinner when list is loading', () => {
    jest.spyOn(pipelineServices, 'useTriggerEventHistoryNew').mockImplementation((): any => {
      return {
        data: [],
        refetch: jest.fn(),
        error: null,
        loading: true
      }
    })
    const { container, getByText } = render(<TestComponent />)
    expect(container.querySelector('[data-icon="steps-spinner"]')).toBeDefined()
    expect(getByText('Loading, please wait...')).toBeDefined()
  })

  test('Show empty state message when no data is present', () => {
    jest.spyOn(pipelineServices, 'useTriggerEventHistoryNew').mockImplementation((): any => {
      return {
        data: [],
        refetch: jest.fn(),
        error: null,
        loading: false
      }
    })
    const { getByText } = render(<TestComponent />)
    expect(getByText('triggers.activityHistory.emptyStateMessage')).toBeDefined()
  })

  test('Show error message and retry button when listing api fails', () => {
    const refetchList = jest.fn()
    jest.spyOn(pipelineServices, 'useTriggerEventHistoryNew').mockImplementation((): any => {
      return {
        data: [],
        refetch: refetchList,
        error: errorLoadingList,
        loading: false
      }
    })
    const { getByText } = render(<TestComponent />)

    expect(getByText('Failed to fetch')).toBeDefined()
    const retryButton = getByText(/Retry/)
    expect(retryButton).toBeDefined()
    userEvent.click(retryButton)
    expect(refetchList).toHaveBeenCalled()
  })

  test('Should render activity history list and open specific pipeline execution', async () => {
    jest.spyOn(pipelineServices, 'useTriggerEventHistoryNew').mockImplementation((): any => {
      return { data: triggerActivityHistoryList, refetch: jest.fn(), error: null, loading: false }
    })
    render(<TestComponent />)
    const rows = await screen.findAllByRole('row')
    const triggerActivityRow = rows[1]
    expect(
      within(triggerActivityRow).getByRole('link', {
        name: /djhsuhd/i
      })
    ).toHaveAttribute(
      'href',
      routes.toExecutionPipelineView({
        accountId: 'testAcc',
        orgIdentifier: 'testOrg',
        projectIdentifier: 'test',
        pipelineIdentifier: 'pipeline',
        module: 'cd',
        executionIdentifier: 'MRhKMvFoR5ykglKxe56-FA',
        source: 'executions'
      } as any)
    )
  })

  test('Should open and close Payload drawer', async () => {
    jest.spyOn(pipelineServices, 'useTriggerEventHistoryNew').mockImplementation((): any => {
      return { data: triggerActivityHistoryList, refetch: jest.fn(), error: null, loading: false }
    })
    render(<TestComponent />)
    const viewPayloadyButton = document.querySelectorAll('[data-icon="main-notes"]')[1]
    userEvent.click(viewPayloadyButton)
    expect(await screen.findByRole('heading', { name: 'common.payload' })).toBeInTheDocument()
    userEvent.click(screen.getByRole('button', { name: 'Close' }))
    await waitFor(() => {
      expect(viewPayloadyButton).toBeInTheDocument()
    })
  })

  test('Should show empty payload when invalid json is passed', async () => {
    jest.spyOn(pipelineServices, 'useTriggerEventHistoryNew').mockImplementation((): any => {
      return { data: triggerActivityHistoryList, refetch: jest.fn(), error: null, loading: false }
    })
    render(<TestComponent />)
    const viewPayloadyButton = document.querySelectorAll('[data-icon="main-notes"]')[2]
    userEvent.click(viewPayloadyButton)
    expect(await screen.findByRole('heading', { name: 'common.payload' })).toBeInTheDocument()
  })
})
