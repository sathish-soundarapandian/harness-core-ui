/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ReactElement} from 'react';
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import type { ProjectPathProps, ModulePathParams } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import type { GitRepoRequestRequestBody} from 'services/cf';
import { useCreateGitRepo } from 'services/cf'
import useCreateGitSyncModal from '@gitsync/modals/useCreateGitSyncModal'
import { useToaster } from '@common/exports'
import { getErrorMessage } from '@cf/utils/CFUtils'
import { DEFAULT_FLAG_GIT_REPO_PATH } from '@cf/constants'

interface CreateNewFlagRepoDialogProps {
  gitRepoRefetch: () => void
  isOpen: boolean
  closeModal: () => void
}

const CreateNewFlagRepoDialog = ({
  gitRepoRefetch,
  isOpen,
  closeModal
}: CreateNewFlagRepoDialogProps): ReactElement => {
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

      hideGitSyncModal()
      gitRepoRefetch()
    } catch (error) {
      showError(getErrorMessage(error), 0, getString('cf.selectFlagRepo.createRepoError'))
    }
  }
  const { openGitSyncModal, hideGitSyncModal } = useCreateGitSyncModal({
    onSuccess: async data => {
      if (data?.branch && data?.identifier && data?.gitSyncFolderConfigDTOs?.[0]?.rootFolder) {
        handleCreateGitRepo({
          branch: data.branch,
          repoIdentifier: data.identifier,
          filePath: DEFAULT_FLAG_GIT_REPO_PATH,
          rootFolder: data.gitSyncFolderConfigDTOs[0].rootFolder
        })
      }
    },
    onClose: () => {
      closeModal()
    }
  })

  useEffect(() => {
    if (isOpen) {
      openGitSyncModal(false, false, undefined)
    } else {
      hideGitSyncModal()
    }
  }, [isOpen])

  return <></>
}

export default CreateNewFlagRepoDialog
