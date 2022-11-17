/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import { Container } from '@harness/uicore'
import { Dialog } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { GitRepoRequestRequestBody, useCreateGitRepo } from 'services/cf'
import { getErrorMessage } from '@cf/utils/CFUtils'
import { useToaster } from '@common/exports'
import { useStrings } from 'framework/strings'
import SaveFlagRepoDialogForm from './SaveFlagRepoDialogForm'
import css from './SaveFlagRepoDialog.module.scss'

export interface SaveFlagRepoDialogProps {
  isOpen: boolean
  closeModal: () => void
  gitRepoRefetch: () => void
}

const SaveFlagRepoDialog = ({ isOpen, closeModal, gitRepoRefetch }: SaveFlagRepoDialogProps): ReactElement => {
  const {
    projectIdentifier,
    accountId: accountIdentifier,
    orgIdentifier
  } = useParams<ProjectPathProps & ModulePathParams>()

  const { showError } = useToaster()
  const { getString } = useStrings()

  const { mutate: createGitRepo } = useCreateGitRepo({
    identifier: projectIdentifier,
    queryParams: {
      accountIdentifier,
      orgIdentifier
    }
  })

  const handleCreateGitRepo = async (values: GitRepoRequestRequestBody): Promise<void> => {
    try {
      await createGitRepo({
        ...values
      })

      closeModal()
      gitRepoRefetch()
    } catch (error) {
      showError(getErrorMessage(error), 0, getString('cf.selectFlagRepo.createRepoError'))
    }
  }

  return (
    <Dialog
      enforceFocus={false}
      isOpen={isOpen}
      onClose={() => closeModal()}
      title={getString('cf.selectFlagRepo.dialogTitle')}
    >
      <Container className={css.modalBody}>
        <SaveFlagRepoDialogForm
          onSubmit={(formData: GitRepoRequestRequestBody) => handleCreateGitRepo(formData)}
          onClose={() => closeModal()}
        />
      </Container>
    </Dialog>
  )
}

export default SaveFlagRepoDialog
