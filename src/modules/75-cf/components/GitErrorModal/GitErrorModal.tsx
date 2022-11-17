/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { ButtonVariation, Dialog, Layout, Button, Heading, Icon, Text } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'

export interface GitErrorModalProps {
  onSubmit: () => void
  onClose: () => void
  apiError: string
}

const GitErrorModal = ({ onSubmit, onClose, apiError }: GitErrorModalProps): ReactElement => {
  const { getString } = useStrings()

  const Title = (): ReactElement => (
    <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
      <Icon size={30} name="warning-sign" color={Color.RED_600} />
      <Heading level={3} font={{ variation: FontVariation.H4 }}>
        {getString('cf.gitSync.gitErrorModalTitle')}
      </Heading>
    </Layout.Horizontal>
  )

  const Footer = (): ReactElement => (
    <Layout.Horizontal spacing="small">
      <Button
        text={getString('cf.gitSync.turnOffGitAndContinue')}
        variation={ButtonVariation.PRIMARY}
        onClick={event => {
          event.preventDefault()
          onSubmit()
        }}
      />
      <Button
        text={getString('cancel')}
        variation={ButtonVariation.TERTIARY}
        onClick={event => {
          event.preventDefault()
          onClose()
        }}
      />
    </Layout.Horizontal>
  )

  return (
    <Dialog enforceFocus={false} isOpen={true} onClose={onClose} title={<Title />} footer={<Footer />}>
      <Layout.Vertical
        spacing="large"
        data-testid="git-error-modal"
        margin={{ bottom: 'huge' }}
        padding={{ bottom: 'medium' }}
      >
        <Text>{apiError}</Text>
        <Text>{getString('cf.gitSync.gitServiceApiError')}</Text>
      </Layout.Vertical>
    </Dialog>
  )
}

export default GitErrorModal
