import React, { useCallback } from 'react'
import copy from 'copy-to-clipboard'
import { Button, Container, Layout, ModalDialog, TextInput, Text, ButtonVariation, useToaster } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import HorizontalLineWithText from '../HorizontalLineWithText/HorizontalLineWithText'
import { DialogProps } from './ShareResultModal.constants'
import css from './ShareResultModal.module.scss'

interface ShareResultModalProps {
  isOpen: boolean
  setOpen: (value: boolean) => void
}

const ShareResultModal = (props: ShareResultModalProps): JSX.Element => {
  const { isOpen, setOpen } = props
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const handleShareResultsModalClose = useCallback(() => setOpen(false), [])

  const copy2Clipboard = (text: string): void => {
    copy(`${text}`) ? showSuccess(getString('clipboardCopySuccess')) : showError(getString('clipboardCopyFail'))
  }
  return (
    <ModalDialog
      {...DialogProps}
      isOpen={isOpen}
      onClose={handleShareResultsModalClose}
      title={getString('assessments.shareResults')}
    >
      <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
        <TextInput value={window.location.href} className={css.shareResultModalFieldInput} />
        <Button
          variation={ButtonVariation.SECONDARY}
          text={getString('assessments.copyLink')}
          data-testid="copyLink"
          onClick={() => copy2Clipboard(window.location.href)}
          margin={{ right: 'small' }}
        />
      </Layout.Horizontal>
      <Container padding={{ top: 'small' }}>
        <HorizontalLineWithText text={'OR'} />
      </Container>
      <Layout.Horizontal flex={{ justifyContent: 'space-between' }}>
        <Text padding={{ top: 'large', bottom: 'xxxlarge' }} margin={{ top: 'small' }}>
          {getString('assessments.downloadPDFReport')}
        </Text>
        <Button
          variation={ButtonVariation.SECONDARY}
          text={getString('assessments.downloadPDF')}
          margin={{ right: 'small' }}
          icon={'download'}
          disabled
        />
      </Layout.Horizontal>
    </ModalDialog>
  )
}

export default ShareResultModal
