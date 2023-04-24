import React from 'react'
import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvService from 'services/cv'
import * as ticketService from 'services/ticket-service/ticketServiceComponents'
import {
  jiraIssueTypeMock,
  jiraPrioritiesMock,
  jiraProjectsMock
} from '@cv/components/ExecutionVerification/components/LogAnalysisContainer/components/LogAnalysisRow/__tests__/LogAnalysisRow.mocks'
import JiraCreationForm from '../JiraCreationForm'
import { feedbackData } from '../../../LogAnalysisDataRow/components/__tests__/LogAnalysisRiskDisplayTooltip.mock'

const showErrorMock = jest.fn()
const getIssueTypesRefetch = jest.fn()
const createJiraMutate = jest.fn()

jest.mock('@harness/uicore', () => ({
  ...jest.requireActual('@harness/uicore'),
  useToaster: jest.fn(() => ({
    showSuccess: jest.fn(),
    showError: showErrorMock
  }))
}))

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
jest.spyOn(ticketService, 'useMetadataListProjects').mockReturnValue({
  error: { payload: { message: 'some error' } },
  isLoading: false,
  data: jiraProjectsMock
})

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
jest.spyOn(ticketService, 'useMetadataListPriorities').mockReturnValue({
  error: null,
  isLoading: false,
  data: jiraPrioritiesMock
})

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
jest.spyOn(ticketService, 'useMetadataGetProject').mockReturnValue({
  error: null,
  isLoading: false,
  data: jiraIssueTypeMock,
  refetch: getIssueTypesRefetch
})

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
jest.spyOn(cvService, 'useCreateTicketForFeedback').mockReturnValue({
  cancel: jest.fn(),
  error: null,
  loading: false,
  mutate: createJiraMutate
})

describe('JiraViewDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('should show error toaster if any get API call results in error', async () => {
    const onHideCallbackMock = jest.fn()

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    jest.spyOn(ticketService, 'useMetadataListProjects').mockReturnValue({
      error: { payload: { message: 'some error' } },
      isLoading: false,
      data: null
    })

    render(
      <TestWrapper>
        <JiraCreationForm feedback={feedbackData} onHideCallback={onHideCallbackMock} />
      </TestWrapper>
    )
    expect(showErrorMock).toHaveBeenCalled()
  })

  test('should show error toaster if POST API call results in error', async () => {
    const onHideCallbackMock = jest.fn()

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    jest.spyOn(cvService, 'useCreateTicketForFeedback').mockReturnValue({
      cancel: jest.fn(),
      error: null,
      loading: false,
      mutate: () => {
        throw new Error('Something went wrong')
      }
    })

    const { container } = render(
      <TestWrapper>
        <JiraCreationForm feedback={feedbackData} onHideCallback={onHideCallbackMock} />
      </TestWrapper>
    )

    const addFieldButton = screen.getByText(/pipeline.jiraCreateStep.addFields/)

    act(() => {
      userEvent.click(addFieldButton)
    })

    const keyInput = screen.getByPlaceholderText(/pipeline.keyPlaceholder/)
    const valueInput = screen.getByPlaceholderText(/Type and press enter to create a tag/)

    await waitFor(() => expect(keyInput).toBeInTheDocument())

    act(() => {
      userEvent.type(keyInput, 'key1')
    })

    await waitFor(() => expect(keyInput).toHaveValue('key1'))

    act(() => {
      userEvent.type(valueInput, 'value1')
    })

    await waitFor(() => expect(valueInput).toHaveValue('value1'))

    act(() => {
      userEvent.click(addFieldButton)
    })

    const keyInputs = screen.getAllByPlaceholderText(/pipeline.keyPlaceholder/)

    await waitFor(() => expect(keyInputs).toHaveLength(2))

    const deleteIcon = container.querySelector('[data-icon="main-trash"]:last-child')

    act(() => {
      userEvent.click(deleteIcon!)
    })

    expect(showErrorMock).toHaveBeenCalled()
  })

  test('should call onHideCallbackMock when close button is clicked', async () => {
    const onHideCallbackMock = jest.fn()
    render(
      <TestWrapper>
        <JiraCreationForm feedback={feedbackData} onHideCallback={onHideCallbackMock} />
      </TestWrapper>
    )

    act(() => {
      userEvent.click(screen.getByTestId('jiraDrawerClose_button'))
    })

    await waitFor(() => expect(onHideCallbackMock).toHaveBeenCalled())
  })
})
