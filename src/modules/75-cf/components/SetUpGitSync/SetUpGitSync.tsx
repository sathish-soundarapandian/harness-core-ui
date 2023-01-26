/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { FontVariation, Color } from '@harness/design-system'
import { Button, ButtonVariation, Heading, Layout, ModalDialog } from '@harness/uicore'
import GitSyncSetupButton from '@cf/components/GitSyncSetupButton/GitSyncSetupButton'
import { useStrings } from 'framework/strings'

const SetUpGitSync: React.FC = () => {
  const { getString } = useStrings()
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const hideModal = useCallback(() => setIsOpen(false), [])
  const openModal = useCallback(() => setIsOpen(true), [])

  const handleSave = useCallback((): void => {
    hideModal()
  }, [hideModal])

  const handleCancel = useCallback((): void => {
    hideModal()
  }, [hideModal])

  return (
    <>
      <ModalDialog
        isOpen={isOpen}
        enforceFocus={false}
        title={
          <Heading level={4} font={{ variation: FontVariation.H4 }} color={Color.GREY_800}>
            {getString('cf.gitSync.setUpGitConnection')}
          </Heading>
        }
        footer={
          <Layout.Horizontal spacing="small">
            <Button
              variation={ButtonVariation.PRIMARY}
              text={getString('save')}
              intent="primary"
              onClick={handleSave}
            />
            <Button variation={ButtonVariation.TERTIARY} text={getString('cancel')} onClick={handleCancel} />
          </Layout.Horizontal>
        }
        onClose={hideModal}
      >
        <div>Modal content</div>
      </ModalDialog>
      <GitSyncSetupButton showModal={openModal} />
    </>
  )
}

export default SetUpGitSync
