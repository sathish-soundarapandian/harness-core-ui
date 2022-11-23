/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Free Trial 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/05/PolyForm-Free-Trial-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { Button, Container } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { Dialog, Classes } from '@blueprintjs/core'
import cx from 'classnames'
import Collaborators from './views/Collaborators'

import css from './useProjectModal.module.scss'

interface UseCollaboratorModalProps {
  projectIdentifier?: string
  orgIdentifier: string
}

export interface UseCollaboratorModalReturn {
  openCollaboratorModal: (props?: UseCollaboratorModalProps) => void
  closeCollaboratorModal: () => void
}

export const useCollaboratorModal = (): UseCollaboratorModalReturn => {
  const [projectIdentifier, setProjectIdentifier] = useState<string>()
  const [orgIdentifier, setOrgIdentifier] = useState<string>()

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        enforceFocus={false}
        isOpen={true}
        onClose={hideModal}
        className={cx(css.dialog, Classes.DIALOG, css.collaborators)}
      >
        <Container padding="xxxlarge">
          <Collaborators projectIdentifier={projectIdentifier} orgIdentifier={orgIdentifier} />
          <Button minimal icon="cross" iconProps={{ size: 18 }} onClick={hideModal} className={css.crossIcon} />
        </Container>
      </Dialog>
    ),
    [projectIdentifier, orgIdentifier]
  )

  const open = useCallback(
    (props?: UseCollaboratorModalProps) => {
      setProjectIdentifier(props?.projectIdentifier)
      setOrgIdentifier(props?.orgIdentifier)
      showModal()
    },
    [showModal]
  )

  return {
    openCollaboratorModal: props => open(props),
    closeCollaboratorModal: hideModal
  }
}
