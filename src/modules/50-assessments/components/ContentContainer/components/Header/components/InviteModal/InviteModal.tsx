import React, { useCallback, useState } from 'react'
import {
  Button,
  ButtonVariation,
  Container,
  Layout,
  ModalDialog,
  MultiSelect,
  MultiSelectOption,
  useToaster
} from '@harness/uicore'
import { TextArea } from '@blueprintjs/core'
import { capitalize } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { getErrorMessage } from '@auth-settings/utils'
import { useSendAssessmentInvite } from 'services/assessments'
import { DialogProps } from './InviteModal.constants'
import css from './InviteModal.module.scss'

interface InviteModalProps {
  isOpen: boolean
  setOpen: (value: boolean) => void
  assessmentId: string
}

const InviteModal = (props: InviteModalProps): JSX.Element => {
  const { isOpen, setOpen, assessmentId } = props
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { mutate: saveAssessment } = useSendAssessmentInvite({})
  const [invitedUsers, setInvitedUsers] = useState<MultiSelectOption[]>([])
  const [emailContent, setEmailContent] = useState<string>()
  const handleInviteAssessmentModalClose = useCallback(() => setOpen(false), [])

  const handleSendInvite = useCallback(async () => {
    const emails = invitedUsers.map(invitedUser => invitedUser.value as string)
    const saveAssessmentPayload = {
      emails,
      assessmentId: assessmentId as string
    }
    try {
      await saveAssessment(saveAssessmentPayload)
      showSuccess(getString('assessments.invitationSent'))
      setOpen(false)
      setInvitedUsers([])
    } catch (errorInfo) {
      showError(getErrorMessage(errorInfo))
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessmentId, invitedUsers])

  return (
    <ModalDialog
      {...DialogProps}
      isOpen={isOpen}
      onClose={handleInviteAssessmentModalClose}
      title={capitalize(`${getString('common.invite')} ${getString('assessments.inviteToTakeAssessment')}`)}
    >
      <Container className={css.inviteModalContainer}>
        <MultiSelect
          value={invitedUsers}
          items={invitedUsers}
          className={css.inviteModalFieldInput}
          placeholder={getString('assessments.enterEmailAddress')}
          onChange={(items: React.SetStateAction<MultiSelectOption[]>) => {
            setInvitedUsers(items)
          }}
        />
        <TextArea
          placeholder={'Need to decide'}
          maxLength={2048}
          value={emailContent}
          onChange={e => {
            setEmailContent((e.currentTarget as HTMLTextAreaElement).value.trim())
          }}
        />
        <Layout.Horizontal>
          <Button
            variation={ButtonVariation.PRIMARY}
            id="invite-button"
            data-testid="invite-button"
            text={getString('assessments.sendInvite')}
            onClick={handleSendInvite}
            margin={{ right: 'small' }}
            disabled={invitedUsers.length === 0}
          />
          <Button
            variation={ButtonVariation.TERTIARY}
            id="cancel-invite-button"
            data-testid="cancel-invite-button"
            text={getString('cancel')}
            onClick={handleInviteAssessmentModalClose}
          />
        </Layout.Horizontal>
      </Container>
    </ModalDialog>
  )
}

export default InviteModal
