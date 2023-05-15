import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as ticketService from 'services/ticket-service/ticketServiceComponents'
import { jiraTicketDetailsMock } from '@cv/components/ExecutionVerification/components/LogAnalysisContainer/components/LogAnalysisRow/__tests__/LogAnalysisRow.mocks'
import { JiraViewDetails } from '../JiraViewDetails'
import { feedbackData } from '../../../LogAnalysisDataRow/components/__tests__/LogAnalysisRiskDisplayTooltip.mock'

describe('JiraViewDetails', () => {
  test('should not render the UI if feedback is not provided', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    jest.spyOn(ticketService, 'useTicketsFindTicketById').mockReturnValue({
      error: null,
      isLoading: false,
      data: jiraTicketDetailsMock
    })
    const { container } = render(
      <TestWrapper>
        <JiraViewDetails onHideCallback={jest.fn()} />
      </TestWrapper>
    )
    expect(container.firstChild).toBeNull()
  })

  test('should not render the UI if get ticket call responds with empty data', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    jest.spyOn(ticketService, 'useTicketsFindTicketById').mockReturnValue({
      error: null,
      isLoading: false,
      data: null
    })
    const { container } = render(
      <TestWrapper>
        <JiraViewDetails feedback={feedbackData} onHideCallback={jest.fn()} />
      </TestWrapper>
    )
    expect(container.firstChild).toBeNull()
  })

  test('should render the error UI if get ticket call responds with error', async () => {
    const refetchTicketDetails = jest.fn()

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    jest.spyOn(ticketService, 'useTicketsFindTicketById').mockReturnValue({
      error: { payload: { message: 'Something went wrong' } },
      isLoading: false,
      data: null,
      refetch: refetchTicketDetails
    })
    render(
      <TestWrapper>
        <JiraViewDetails feedback={feedbackData} onHideCallback={jest.fn()} />
      </TestWrapper>
    )
    expect(screen.getByTestId('jiraDetailsDrawer_error')).toBeInTheDocument()

    const retryButton = screen.getByText(/Retry/)

    await act(() => {
      userEvent.click(retryButton)
    })

    await waitFor(() => expect(refetchTicketDetails).toHaveBeenCalled())
  })

  test('should render the loading UI if get ticket call is loading', () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    jest.spyOn(ticketService, 'useTicketsFindTicketById').mockReturnValue({
      error: null,
      isLoading: true,
      data: null
    })
    render(
      <TestWrapper>
        <JiraViewDetails feedback={feedbackData} onHideCallback={jest.fn()} />
      </TestWrapper>
    )
    expect(screen.getByTestId('jiraDetailsDrawer_loading')).toBeInTheDocument()
  })

  test('should check whether new tab is opened with correct link when view in jira button is clicked', async () => {
    const openSpy = jest.spyOn(window, 'open')

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    jest.spyOn(ticketService, 'useTicketsFindTicketById').mockReturnValue({
      error: null,
      isLoading: false,
      data: jiraTicketDetailsMock
    })
    render(
      <TestWrapper>
        <JiraViewDetails feedback={feedbackData} onHideCallback={jest.fn()} />
      </TestWrapper>
    )

    await act(() => {
      userEvent.click(screen.getByTestId('jiraDetailsLink_button'))
    })

    await waitFor(() =>
      expect(openSpy).toHaveBeenCalledWith('https://example.atlassian.net/browse/ABCD-1234', '_blank')
    )
  })

  test('should call onHideCallback prop when clicked on close button', async () => {
    const openSpy = jest.spyOn(window, 'open')
    const onHideCallbackMock = jest.fn()

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    jest.spyOn(ticketService, 'useTicketsFindTicketById').mockReturnValue({
      error: null,
      isLoading: false,
      data: jiraTicketDetailsMock
    })
    render(
      <TestWrapper>
        <JiraViewDetails feedback={feedbackData} onHideCallback={onHideCallbackMock} />
      </TestWrapper>
    )

    await act(() => {
      return userEvent.click(screen.getByTestId('jiraDetailsLink_button'))
    })

    await waitFor(() =>
      expect(openSpy).toHaveBeenCalledWith('https://example.atlassian.net/browse/ABCD-1234', '_blank')
    )

    await act(() => {
      return userEvent.click(screen.getByTestId('jiraDetailsClose_button'))
    })

    await waitFor(() => expect(onHideCallbackMock).toHaveBeenCalled())
  })
})
