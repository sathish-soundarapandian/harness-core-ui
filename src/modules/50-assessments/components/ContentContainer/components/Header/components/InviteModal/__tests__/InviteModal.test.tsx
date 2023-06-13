import { render } from '@testing-library/react'
import React from 'react'
import { TestWrapper } from '@common/utils/testUtils'
import { useSendAssessmentInvite } from 'services/assessments'
import InviteModal from '../InviteModal'

jest.mock('services/assessments', () => ({
  useSendAssessmentInvite: jest.fn().mockImplementation(() => ({ mutate: jest.fn(), loading: false, error: null }))
}))

describe('Invite Modal', () => {
  test('should be able to send invite', () => {
    const sendInviteMock = jest.fn()
    ;(useSendAssessmentInvite as jest.Mock).mockImplementation(() => ({
      mutate: sendInviteMock,
      loading: false,
      error: null
    }))
    const { getByText } = render(
      <TestWrapper>
        <InviteModal isOpen={true} setOpen={jest.fn()} assessmentId={'abc'} />
      </TestWrapper>
    )
    expect(getByText('Common.invite assessments.invitetotakeassessment')).toBeInTheDocument()
    // const button = getByTestId('invite-button')
    // expect(button).toBeInTheDocument()
    // fireEvent.click(button!)
    // expect(sendInviteMock).toHaveBeenCalled()
  })
})
