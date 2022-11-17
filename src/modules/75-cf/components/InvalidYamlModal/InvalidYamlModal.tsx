/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { ButtonVariation, Dialog, Layout, Button, Heading, Icon, Text, Container } from '@harness/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import css from './InvalidYamlModal.module.scss'

export interface InvalidYamlModalProps {
  handleRetry: () => void
  handleClose: () => void
  flagsYamlFilename?: string
  apiError?: string
  isLoading: boolean
}

const InvalidYamlModal = ({
  handleRetry,
  handleClose,
  apiError,
  isLoading,
  flagsYamlFilename
}: InvalidYamlModalProps): ReactElement => {
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
    <Container flex className={css.modalFooter}>
      <Button
        loading={isLoading}
        text={getString('cf.gitSync.tryAgain')}
        variation={ButtonVariation.PRIMARY}
        onClick={event => {
          event.preventDefault()
          handleRetry()
        }}
      />
      <a href="https://github.com" target="_blank" rel="noreferrer noopener">
        {getString('cf.gitSync.goToGit')}
        <Icon name="main-share" color={Color.PRIMARY_7} />
      </a>
    </Container>
  )

  return (
    <Dialog enforceFocus={false} isOpen={true} onClose={handleClose} title={<Title />} footer={<Footer />}>
      <Layout.Vertical
        spacing="large"
        data-testid="invalid-yaml-dialog"
        margin={{ bottom: 'huge' }}
        padding={{ bottom: 'medium' }}
      >
        <Text>{getString('cf.gitSync.invalidYaml', { flagsYamlFilename })}</Text>
        <Text>{apiError}</Text>
      </Layout.Vertical>
    </Dialog>
  )
}

export default InvalidYamlModal
