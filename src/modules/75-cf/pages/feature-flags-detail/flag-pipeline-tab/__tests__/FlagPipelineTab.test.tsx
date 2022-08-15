/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as cfServicesMock from 'services/cf'
import type { FeaturePipelineExecution } from 'services/cf'
import FlagPipelineTab, { FlagPipelineTabProps } from '../FlagPipelineTab'
import mockAvailablePipelines from './__data__/mockAvailablePipelines'
import mockExecutionHistory from './__data__/mockExecutionHistory'

const renderComponent = (props: Partial<FlagPipelineTabProps> = {}): void => {
  render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags/TEST_FLAG"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      queryParams={{ tab: 'flag_pipeline', activeEnvironment: 'TEST_ENV' }}
    >
      <FlagPipelineTab
        flagIdentifier="TEST_FLAG"
        flagVariations={[
          {
            identifier: 'true',
            name: 'True',
            value: 'true'
          },
          {
            identifier: 'false',
            name: 'False',
            value: 'false'
          }
        ]}
        {...props}
      />
    </TestWrapper>
  )
}

describe('FlagPipelineTab', () => {
  const refetchAvailablePipelinesMock = jest.fn()
  const patchFeaturePipelineMock = jest.fn()
  const createFeaturePipelineMock = jest.fn()
  const deleteFeaturePipelineMock = jest.fn()

  afterEach(() => {
    jest.clearAllMocks()
  })
  beforeEach(() => {
    jest.spyOn(cfServicesMock, 'useCreateFlagPipeline').mockReturnValue({
      mutate: createFeaturePipelineMock
    } as any)

    jest.spyOn(cfServicesMock, 'usePatchFeaturePipeline').mockReturnValue({
      mutate: patchFeaturePipelineMock
    } as any)

    jest.spyOn(cfServicesMock, 'useDeleteFeaturePipeline').mockReturnValue({
      mutate: deleteFeaturePipelineMock
    } as any)

    jest.spyOn(cfServicesMock, 'useGetAvailableFeaturePipelines').mockReturnValue({
      data: {
        availablePipelines: mockAvailablePipelines
      },
      loading: false,
      refetch: refetchAvailablePipelinesMock
    } as any)
  })

  describe('Flag pipeline error banner', () => {
    beforeEach(() => {
      jest.spyOn(cfServicesMock, 'useGetFeaturePipeline').mockReturnValue({
        data: {
          pipelineConfigured: true,
          pipelineErrorState: true
        },
        loading: false,
        refetch: jest.fn()
      } as any)
    })

    test('it should show error banner when pipelineErrorState = true', async () => {
      renderComponent()

      await waitFor(() => expect(screen.getByText('cf.featureFlags.flagPipeline.pipelineDeleted')).toBeInTheDocument())
      userEvent.click(screen.getByTestId('close-banner-button'))
      await waitFor(() =>
        expect(screen.queryByText('cf.featureFlags.flagPipeline.pipelineDeleted')).not.toBeInTheDocument()
      )
    })
  })

  describe('Flag pipeline fetching states', () => {
    beforeEach(() => {
      jest.spyOn(cfServicesMock, 'useGetFeaturePipeline').mockReturnValue({
        data: {
          pipelineConfigured: true
        },
        loading: true,
        refetch: jest.fn()
      } as any)
    })

    test('it should show loading spinner when loading', async () => {
      renderComponent()

      await waitFor(() => expect(screen.getByText('Loading, please wait...')).toBeInTheDocument())
    })
  })

  describe('Flag pipeline not configured', () => {
    beforeEach(() => {
      jest.spyOn(cfServicesMock, 'useGetFeaturePipeline').mockReturnValue({
        data: {
          pipelineConfigured: false
        },
        loading: false,
        refetch: jest.fn()
      } as any)
    })

    test('it should create flag pipeline correctly', async () => {
      renderComponent()

      // assert empty state initially
      const addFlagPipelineButton = screen.getByRole('button', {
        name: 'cf.featureFlags.flagPipeline.noDataButtonText'
      })
      expect(screen.getByText('cf.featureFlags.flagPipeline.noDataMessage')).toBeInTheDocument()
      expect(addFlagPipelineButton).toBeInTheDocument()
      expect(screen.getByText('cf.featureFlags.flagPipeline.noDataDescription')).toBeInTheDocument()

      // assert drawer opens with correct text. Save button hidden initially
      userEvent.click(addFlagPipelineButton)
      await waitFor(() => {
        expect(screen.getByText('cf.featureFlags.flagPipeline.drawerTitle')).toBeInTheDocument()
        expect(screen.getByText('cf.featureFlags.flagPipeline.drawerDescription')).toBeInTheDocument()
        expect(screen.getByText('cf.featureFlags.flagPipeline.envText')).toBeInTheDocument()
        expect(
          screen.queryByRole('button', { name: 'cf.featureFlags.flagPipeline.drawerButtonText' })
        ).not.toBeInTheDocument()
      })

      // assert correct number of pipelines and pipeline content is displayed
      await waitFor(() => {
        const items = screen.getAllByRole('listitem')
        expect(items).toHaveLength(mockAvailablePipelines.length)
        expect(items[0]).toHaveTextContent('Pipeline 1Pipeline 1 description')
      })

      // select a pipeline
      const itemToSelect = screen.getAllByRole('listitem')[4]
      userEvent.click(itemToSelect)
      await waitFor(() => expect(itemToSelect).toHaveClass('cardActive'))

      // save
      const savePipelineButton = screen.getByRole('button', { name: 'cf.featureFlags.flagPipeline.drawerButtonText' })
      expect(savePipelineButton).toBeInTheDocument()

      userEvent.click(savePipelineButton)

      await waitFor(() =>
        expect(createFeaturePipelineMock).toBeCalledWith({
          pipelineIdentifier: 'pipeline5',
          pipelineName: 'Pipeline 5'
        })
      )
    })

    test('it should let user search for a flag pipeline', async () => {
      renderComponent()
      const addFlagPipelineButton = screen.getByRole('button', {
        name: 'cf.featureFlags.flagPipeline.noDataButtonText'
      })
      userEvent.click(addFlagPipelineButton)

      const searchInput = screen.getByPlaceholderText('Search')
      expect(searchInput).toBeInTheDocument()

      userEvent.type(searchInput, 'pipeline 1', { allAtOnce: true })

      await waitFor(() =>
        expect(refetchAvailablePipelinesMock).toBeCalledWith({
          debounce: 500,
          queryParams: {
            accountIdentifier: 'dummy',
            environmentIdentifier: '',
            identifier: 'TEST_FLAG',
            orgIdentifier: 'dummy',
            pageNumber: 0,
            pageSize: 50,
            pipelineName: 'pipeline 1',
            projectIdentifier: 'dummy'
          }
        })
      )
    })

    test('it should close drawer when close icon clicked', async () => {
      renderComponent()
      const addFlagPipelineButton = screen.getByRole('button', {
        name: 'cf.featureFlags.flagPipeline.noDataButtonText'
      })

      userEvent.click(addFlagPipelineButton)

      const closeDrawerButton = screen.getByTestId('close-drawer-button')
      userEvent.click(closeDrawerButton)

      await waitFor(() =>
        expect(screen.queryByText('cf.featureFlags.flagPipeline.drawerTitle')).not.toBeInTheDocument()
      )
    })

    test('it should show loading spinner when available pipelines loading', async () => {
      jest.spyOn(cfServicesMock, 'useGetAvailableFeaturePipelines').mockReturnValue({
        data: {
          availablePipelines: mockAvailablePipelines
        },
        loading: true,
        refetch: jest.fn()
      } as any)

      renderComponent()
      const addFlagPipelineButton = screen.getByRole('button', {
        name: 'cf.featureFlags.flagPipeline.noDataButtonText'
      })
      userEvent.click(addFlagPipelineButton)

      await waitFor(() => expect(screen.getByText('Loading, please wait...')).toBeInTheDocument())
    })

    test.each([undefined, null, { availablePipelines: [] }])(
      'it should show correct message when availablePipelines object is %s',
      async data => {
        jest.spyOn(cfServicesMock, 'useGetAvailableFeaturePipelines').mockReturnValue({
          data,
          loading: false,
          refetch: jest.fn()
        } as any)

        renderComponent()
        const addFlagPipelineButton = screen.getByRole('button', {
          name: 'cf.featureFlags.flagPipeline.noDataButtonText'
        })
        userEvent.click(addFlagPipelineButton)

        await waitFor(() =>
          expect(screen.getByText('cf.featureFlags.flagPipeline.noAvailablePipelines')).toBeInTheDocument()
        )
      }
    )
  })

  describe('Flag pipeline configured with no executions', () => {
    const getFeaturePipelineRefetchMock = jest.fn()
    beforeEach(() => {
      jest.spyOn(cfServicesMock, 'useGetFeaturePipeline').mockReturnValue({
        data: {
          executionHistory: [],
          pipelineConfigured: true,
          pipelineDetails: {
            identifier: 'pipeline5',
            name: 'Pipeline 5',
            description: 'This is a test pipeline'
          }
        },
        loading: false,
        refetch: getFeaturePipelineRefetchMock
      } as any)
    })

    test('it should update flag pipeline correctly', async () => {
      renderComponent()

      // click edit button
      const rbacOptionsMenu = document.querySelector("[data-icon='Options']") as HTMLElement
      userEvent.click(rbacOptionsMenu)
      const editButton = screen.getAllByRole('listitem')[0].querySelector('a') as HTMLElement
      await waitFor(() => {
        expect(editButton).toHaveTextContent(/edit/)
      })
      userEvent.click(editButton)

      await waitFor(() => {
        expect(screen.getByText('cf.featureFlags.flagPipeline.drawerTitle')).toBeInTheDocument()
        expect(screen.getAllByRole('listitem')).toHaveLength(mockAvailablePipelines.length)
      })

      // pipeline should be preselected
      const preselectedItem = screen.getAllByRole('listitem')[4]
      await waitFor(() => expect(preselectedItem).toHaveClass('cardActive'))

      // select another pipeline
      const newSelectedItem = screen.getAllByRole('listitem')[6]
      userEvent.click(newSelectedItem)
      await waitFor(() => expect(newSelectedItem).toHaveClass('cardActive'))

      // save
      const savePipelineButton = screen.getByRole('button', { name: 'cf.featureFlags.flagPipeline.drawerButtonText' })
      expect(savePipelineButton).toBeInTheDocument()

      userEvent.click(savePipelineButton)

      await waitFor(() =>
        expect(patchFeaturePipelineMock).toBeCalledWith({
          pipelineIdentifier: 'pipeline7',
          pipelineName: 'Pipeline 7'
        })
      )
    })

    test('it should delete flag pipeline correctly', async () => {
      renderComponent()

      // click delete button - assert modal appears
      const rbacOptionsMenu = document.querySelector("[data-icon='Options']") as HTMLElement
      userEvent.click(rbacOptionsMenu)
      const deleteButton = screen.getAllByRole('listitem')[1].getElementsByTagName('a')[0]
      await waitFor(() => {
        expect(deleteButton).toHaveTextContent(/delete/)
      })
      userEvent.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByText('cf.featureFlags.flagPipeline.deleteModalTitle')).toBeInTheDocument()
        expect(screen.getByText('cf.featureFlags.flagPipeline.deleteModalText')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'confirm' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'cancel' })).toBeInTheDocument()
      })

      // click confirm
      userEvent.click(screen.getByRole('button', { name: 'confirm' }))

      await waitFor(() => {
        expect(deleteFeaturePipelineMock).toBeCalledWith()
        expect(getFeaturePipelineRefetchMock).toBeCalledWith()
      })
    })

    test('it should not delete flag pipeline and should close modal on cancel click', async () => {
      renderComponent()

      // click delete button - assert modal appears
      const rbacOptionsMenu = document.querySelector("[data-icon='Options']") as HTMLElement
      userEvent.click(rbacOptionsMenu)
      const deleteButton = screen.getAllByRole('listitem')[1].getElementsByTagName('a')[0]
      await waitFor(() => {
        expect(deleteButton).toHaveTextContent(/delete/)
      })
      userEvent.click(deleteButton)

      await waitFor(() => {
        expect(screen.getByText('cf.featureFlags.flagPipeline.deleteModalTitle')).toBeInTheDocument()
        expect(screen.getByText('cf.featureFlags.flagPipeline.deleteModalText')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'confirm' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'cancel' })).toBeInTheDocument()
      })

      // click cancel
      userEvent.click(screen.getByRole('button', { name: 'cancel' }))

      await waitFor(() => {
        expect(screen.queryByText('cf.featureFlags.flagPipeline.deleteModalTitle')).not.toBeInTheDocument()
        expect(deleteFeaturePipelineMock).not.toBeCalledWith()
      })
    })

    test('it should display configured pipeline details and empty execution view correctly', async () => {
      renderComponent()

      expect(screen.getByText('Pipeline 5')).toBeInTheDocument()
      expect(screen.getByText('cf.featureFlags.flagPipeline.envText')).toBeInTheDocument()
      expect(screen.getByText('cf.featureFlags.flagPipeline.noExecutionMessage')).toBeInTheDocument()
      expect(screen.getByText('cf.featureFlags.flagPipeline.noExecutionDescription')).toBeInTheDocument()
    })

    test('it should show error correctly when delete pipeline API request fails', async () => {
      const deletePipelineMock = jest.fn()
      jest.spyOn(cfServicesMock, 'useDeleteFeaturePipeline').mockReturnValue({
        data: null,
        loading: false,
        mutate: deletePipelineMock.mockRejectedValue({ message: 'ERROR DELETING PIPELINE' })
      } as any)

      renderComponent()

      // click delete button - assert modal appears
      const rbacOptionsMenu = document.querySelector("[data-icon='Options']") as HTMLElement
      userEvent.click(rbacOptionsMenu)
      const deleteButton = screen.getAllByRole('listitem')[1].getElementsByTagName('a')[0]
      await waitFor(() => {
        expect(deleteButton).toHaveTextContent(/delete/)
      })
      userEvent.click(deleteButton)

      // click confirm
      const confirmButton = screen.getByRole('button', { name: 'confirm' })
      expect(confirmButton).toBeInTheDocument()
      userEvent.click(confirmButton)

      await waitFor(() => {
        expect(screen.getByText('ERROR DELETING PIPELINE')).toBeInTheDocument()
      })
    })
  })

  describe('Flag pipeline configured with executions', () => {
    const setupExecutionMocks = (executionHistory: FeaturePipelineExecution[] = mockExecutionHistory): void => {
      jest.spyOn(cfServicesMock, 'useGetFeaturePipeline').mockReturnValue({
        data: {
          executionHistory: executionHistory,
          pipelineConfigured: true,
          pipelineDetails: {
            identifier: 'pipeline5',
            name: 'Pipeline 5',
            description: 'This is a test pipeline'
          }
        },
        loading: false,
        refetch: jest.fn()
      } as any)
    }

    test('it should render execution list correctly', async () => {
      setupExecutionMocks()
      renderComponent()

      expect(screen.getByRole('list')).toBeInTheDocument()
      expect(screen.getAllByRole('listitem')).toHaveLength(mockExecutionHistory.length)
    })

    test('it should render execution card with trigger details correctly', async () => {
      setupExecutionMocks([mockExecutionHistory[2]])
      renderComponent()

      // execution card header details
      expect(screen.getByText('tick-circle')).toBeInTheDocument()
      expect(screen.getByText('pipeline.executionStatus.Success')).toBeInTheDocument()
      expect(screen.getByText('pipeline.executionId: 1996')).toBeInTheDocument()
      expect(screen.getByText(/common.durationPrefix/)).toBeInTheDocument()
      expect(screen.getByText('dummy date')).toBeInTheDocument()
      expect(screen.getByText('Production')).toBeInTheDocument()
      expect(screen.getByText('Elenor Pena')).toBeInTheDocument()
      expect(screen.getByText('cf.featureFlags.flagPipeline.triggerDetails')).toBeInTheDocument()

      // stage completion
      expect(screen.getByText('3/3')).toBeInTheDocument()

      // trigger details
      userEvent.click(screen.getByText('cf.featureFlags.flagPipeline.triggerDetails'))
      await waitFor(() => {
        expect(screen.getByTestId('flag-state')).toHaveTextContent('on')
        expect(screen.getAllByTestId('target-variation')[0]).toHaveTextContent('True')

        expect(screen.getAllByTestId('target')[0]).toHaveTextContent('Beta Target, Charlie Target')
        expect(screen.getAllByTestId('target-variation')[1]).toHaveTextContent('False')
        expect(screen.getAllByTestId('target')[1]).toHaveTextContent('Delta Target')
        expect(screen.getAllByTestId('target-group-variation')[0]).toHaveTextContent('True')
        expect(screen.getAllByTestId('target-group')[0]).toHaveTextContent('User Group 1')
        expect(screen.getAllByTestId('target-group-variation')[1]).toHaveTextContent('False')
        expect(screen.getAllByTestId('target-group')[1]).toHaveTextContent('User Group 2')
        expect(screen.getAllByTestId('percentage-rollout-group')[0]).toHaveTextContent('User Group 3')
        expect(screen.getAllByTestId('percentage-rollout-group')[1]).toHaveTextContent('User Group 4')
        expect(screen.getAllByTestId('percentage-rollout-variation-weight')[0]).toHaveTextContent('True (50%)')
        expect(screen.getAllByTestId('percentage-rollout-variation-weight')[1]).toHaveTextContent('False (50%)')
        expect(screen.getAllByTestId('percentage-rollout-variation-weight')[2]).toHaveTextContent('True (70%)')
        expect(screen.getAllByTestId('percentage-rollout-variation-weight')[3]).toHaveTextContent('False (30%)')
      })
    })

    test('it should render execution card with failed stage count correctly', async () => {
      setupExecutionMocks([mockExecutionHistory[3]])
      renderComponent()

      expect(screen.getAllByText('warning-sign')).toHaveLength(2)
      expect(screen.getByTestId('stage-count')).toHaveTextContent('1')
    })
  })
})
