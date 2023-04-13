import React from 'react'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvService from 'services/cv'
import UpdateEventPreferenceDrawer from '../../UpdateEventPreferenceDrawer'
import { feedbackHistoryResponse, updateEventRowData } from './UpdateEventPreferenceDrawer.mock'

const feedbackHistorySpy = jest.fn()

describe('UpdateEventPreferenceDrawer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('clicking close button should close the update event popup', () => {
    jest.spyOn(cvService, 'useGetFeedbackHistory').mockReturnValue({
      refetch: feedbackHistorySpy,
      cancel: jest.fn(),
      error: null,
      loading: false,
      data: {
        resource: feedbackHistoryResponse as cvService.LogFeedbackHistory[]
      },
      absolutePath: '',
      response: null
    })
    const onHideMock = jest.fn()
    render(
      <TestWrapper>
        <UpdateEventPreferenceDrawer rowData={updateEventRowData} activityId="abc" onHide={onHideMock} />
      </TestWrapper>
    )

    const closeBtn = screen.getByTestId('UpdateEventDrawerClose_button_top')
    const drawerContent = screen.getByTestId('updateEventPreferenceDrawer-Container')

    expect(closeBtn).toBeInTheDocument()
    expect(drawerContent).toBeInTheDocument()

    act(() => {
      userEvent.click(closeBtn)
    })

    expect(onHideMock).toHaveBeenCalled()
  })

  test('should test loading UI is shown when feedback call is in progress', () => {
    jest.spyOn(cvService, 'useGetFeedbackHistory').mockReturnValue({
      refetch: feedbackHistorySpy,
      cancel: jest.fn(),
      error: null,
      loading: true,
      data: {
        resource: []
      },
      absolutePath: '',
      response: null
    })
    const onHideMock = jest.fn()
    render(
      <TestWrapper>
        <UpdateEventPreferenceDrawer rowData={updateEventRowData} activityId="abc" onHide={onHideMock} />
      </TestWrapper>
    )

    const loadingUI = screen.getByTestId('updateEventPreferenceDrawer_loader')

    expect(loadingUI).toBeInTheDocument()
  })

  test('should test error UI is shown when feedback call failed', () => {
    jest.spyOn(cvService, 'useGetFeedbackHistory').mockReturnValue({
      refetch: feedbackHistorySpy,
      cancel: jest.fn(),
      error: { message: 'Something went wrong', data: { message: 'Something went wrong' } },
      loading: false,
      data: {
        resource: []
      },
      absolutePath: '',
      response: null
    })
    const onHideMock = jest.fn()
    render(
      <TestWrapper>
        <UpdateEventPreferenceDrawer rowData={updateEventRowData} activityId="abc" onHide={onHideMock} />
      </TestWrapper>
    )

    const errorUI = screen.getByTestId('updateEventPreferenceDrawer_error')
    const errorMessage = screen.getByText('Something went wrong')

    expect(errorUI).toBeInTheDocument()
    expect(errorMessage).toBeInTheDocument()
  })
})
