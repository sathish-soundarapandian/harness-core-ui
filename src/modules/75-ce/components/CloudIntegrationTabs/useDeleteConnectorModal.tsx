/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, ButtonVariation, Container, FlexExpander, Layout, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { Dialog, Classes } from '@blueprintjs/core'
import { useModalHook } from '@harness/use-modal'
import cx from 'classnames'

import { String, useStrings } from 'framework/strings'

import DeleteConnectorImage from './images/DeleteConnector.svg'
import css from './CloudIntegrationTabs.module.scss'

interface UseDeleteConnectorProps {
  onDelete: () => Promise<void>
}

export const useDeleteConnectorModal = ({ onDelete }: UseDeleteConnectorProps) => {
  const { getString } = useStrings()

  const [openModal, closeModal] = useModalHook(
    () => (
      <Dialog isOpen enforceFocus={false} onClose={closeModal} className={cx(css.deleteConnectorModal, Classes.DIALOG)}>
        <Container padding={'xxxlarge'} className={css.ctn}>
          <Layout.Vertical spacing={'xxlarge'} flex={{ alignItems: 'flex-start' }}>
            <Text font={{ variation: FontVariation.H3 }}>
              {getString('ce.cloudIntegration.deleteConnectorDialog.header')}
            </Text>
            <Text font={{ variation: FontVariation.BODY }}>
              <String stringID={'ce.cloudIntegration.deleteConnectorDialog.desc'} useRichText />
            </Text>
            <FlexExpander />
            <div>
              <Button
                text={getString('delete')}
                variation={ButtonVariation.PRIMARY}
                intent="danger"
                margin={{ right: 'small' }}
                onClick={async () => {
                  await onDelete()
                  closeModal()
                }}
              />
              <Button text={'Ignore'} onClick={closeModal} variation={ButtonVariation.TERTIARY} />
            </div>
          </Layout.Vertical>
          <img src={DeleteConnectorImage} className={css.deleteImage} />
        </Container>
        <Button minimal icon="cross" iconProps={{ size: 18 }} onClick={closeModal} className={css.crossIcon} />
      </Dialog>
    ),
    [onDelete]
  )

  return [openModal, closeModal]
}
