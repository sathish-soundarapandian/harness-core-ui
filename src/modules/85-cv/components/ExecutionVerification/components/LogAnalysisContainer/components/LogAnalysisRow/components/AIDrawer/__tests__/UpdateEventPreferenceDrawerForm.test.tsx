import React from 'react'
import userEvent from '@testing-library/user-event'
import { act, render, screen, waitFor } from '@testing-library/react'
import * as cvService from 'services/cv'
import { TestWrapper } from '@common/utils/testUtils'
import UpdateEventPreferenceDrawerForm from '../UpdateEventPreferenceDrawerForm'

const onHideCallbackMock = jest.fn()
const saveFeedbackMutateSpy = jest.fn()

describe('UpdateEventPreferenceDrawerForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  test('UpdateEventPreferenceDrawerForm calls correct function upon submitting the form', () => {
    render(
      <TestWrapper
        path="/:accountId/:projectIdentifier/:orgIdentifier"
        pathParams={{ accountId: 'ac1', projectIdentifier: 'project1', orgIdentifier: 'org1' }}
      >
        <UpdateEventPreferenceDrawerForm activityId="123" onHideCallback={onHideCallbackMock} />
      </TestWrapper>
    )

    act(() => {
      userEvent.click(screen.getByTestId(/updatePreferenceDrawerClose_button/))
    })

    expect(onHideCallbackMock).toHaveBeenCalled()
  })

  test('UpdateEventPreferenceDrawerForm should show correct validation errors when values are not filled', async () => {
    render(
      <TestWrapper
        path="/:accountId/:projectIdentifier/:orgIdentifier"
        pathParams={{ accountId: 'ac1', projectIdentifier: 'project1', orgIdentifier: 'org1' }}
      >
        <UpdateEventPreferenceDrawerForm activityId="123" onHideCallback={onHideCallbackMock} />
      </TestWrapper>
    )

    act(() => {
      userEvent.click(screen.getByTestId(/updatePreferenceDrawerSubmit_button/))
    })

    await waitFor(() => {
      expect(screen.getByText(/cv.logs.riskPriorityValidation/)).toBeInTheDocument()
      expect(screen.getByText(/cv.reasonIsRequired/)).toBeInTheDocument()
    })

    expect(onHideCallbackMock).not.toHaveBeenCalled()
  })

  test('UpdateEventPreferenceDrawerForm should call onHideCallback with true indicating API call must be made as the values are updated', async () => {
    jest.spyOn(cvService, 'useSaveLogFeedback').mockReturnValue({
      mutate: saveFeedbackMutateSpy,
      cancel: jest.fn(),
      error: null,
      loading: false
    })
    render(
      <TestWrapper
        path="/:accountId/:projectIdentifier/:orgIdentifier"
        pathParams={{ accountId: 'ac1', projectIdentifier: 'project1', orgIdentifier: 'org1' }}
      >
        <UpdateEventPreferenceDrawerForm
          activityId="123"
          feedback={{ description: 'This is not a risk 2', feedbackScore: 'MEDIUM_RISK' }}
          onHideCallback={onHideCallbackMock}
        />
      </TestWrapper>
    )

    const reasonTextarea = screen.getByPlaceholderText('cv.logs.reasonPlaceholder')

    act(() => {
      userEvent.clear(reasonTextarea)
      userEvent.type(reasonTextarea, 'This is not a risk again')
    })

    const eventPreferenceSubmitButton = screen.getByTestId('updatePreferenceDrawerSubmit_button')

    expect(eventPreferenceSubmitButton).toBeInTheDocument()

    act(() => {
      userEvent.click(eventPreferenceSubmitButton)
    })

    await waitFor(() => {
      expect(onHideCallbackMock).toHaveBeenCalledWith(true)
    })
  })
})
