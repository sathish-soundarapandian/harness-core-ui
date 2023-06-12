import React, { useCallback, useState } from 'react'
import {
  Button,
  ButtonVariation,
  Layout,
  ModalDialog,
  MultiSelect,
  MultiSelectOption,
  useToaster
} from '@harness/uicore'
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
      title={getString('assessments.inviteToTakeAssessment')}
    >
      <Layout.Horizontal flex={{ justifyContent: 'space-between' }} padding={{ bottom: 'xlarge' }}>
        <MultiSelect
          value={invitedUsers}
          items={invitedUsers}
          className={css.inviteModalFieldInput}
          placeholder={getString('assessments.enterEmailAddress')}
          onChange={(items: React.SetStateAction<MultiSelectOption[]>) => {
            setInvitedUsers(items)
          }}
        />
        <Button
          variation={ButtonVariation.SECONDARY}
          id="invite-button"
          data-testid="invite-button"
          text={getString('assessments.sendInvite')}
          onClick={handleSendInvite}
          margin={{ right: 'small' }}
        />
      </Layout.Horizontal>
    </ModalDialog>
  )
}

export default InviteModal
