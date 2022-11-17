/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Button, ButtonVariation, StepWizard } from '@harness/uicore'
import { useModalHook } from '@harness/use-modal'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import type { GitSyncConfig } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import GitSyncRepoFormStep from '@gitsync/pages/steps/GitSyncRepoFormStep'
import GitConnection from '@gitsync/components/GitConnection/GitConnection'
import { GitFullSyncStep } from '@gitsync/pages/steps/GitFullSyncStep/GitFullSyncStep'
import GitSyncRepoForm from '../components/gitSyncRepoForm/GitSyncRepoForm'
import css from './useCreateGitSyncModal.module.scss'

export interface UseCreateGitSyncModalProps {
  onSuccess?: (data?: GitSyncConfig) => void
  onClose?: () => void
}

export interface UseCreateGitSyncModalReturn {
  openGitSyncModal: (
    creatingFirstRepo: boolean,
    isEditMode: boolean,
    syncRepo: GitSyncConfig | undefined,
    modalProps?: IDialogProps
  ) => void
  hideGitSyncModal: () => void
}

const useCreateGitSyncModal = (props: UseCreateGitSyncModalProps): UseCreateGitSyncModalReturn => {
  let shouldRefreshOnClose = false
  const { getString } = useStrings()
  const [isEditMode, setIsEditMode] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)
  const [syncRepo, setSyncRepo] = useState<GitSyncConfig | void>()
  const [modalProps, setModalProps] = useState<IDialogProps>({
    isOpen: true,
    enforceFocus: false,
    style: {
      width: 1200,
      minHeight: 720,
      borderLeft: 0,
      paddingBottom: 0,
      position: 'relative',
      overflow: 'hidden'
    }
  })
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  const handleSuccess = (data?: GitSyncConfig): void => {
    props.onSuccess?.(data)
  }

  const [showModal, hideModal] = useModalHook(() => {
    const closeHandler = (): void => {
      if (shouldRefreshOnClose) {
        handleSuccess()
      }
      props.onClose?.()
      hideModal()
    }

    return isNewUser ? (
      <Dialog {...modalProps}>
        <StepWizard
          stepClassName={css.noPadding}
          title={getString('enableGitExperience')}
          icon="git-landing-page"
          iconProps={{ size: 80, className: css.icon }}
        >
          <GitSyncRepoFormStep
            name={getString('gitsync.configureHarnessFolder')}
            accountId={accountId}
            isEditMode={isEditMode}
            isNewUser={isNewUser}
            gitSyncRepoInfo={undefined}
            orgIdentifier={orgIdentifier}
            projectIdentifier={projectIdentifier}
            onClose={closeHandler}
          />
          <GitConnection
            name={getString('connectors.selectConnectivityMode')}
            onSuccess={() => {
              shouldRefreshOnClose = true
            }}
            isLastStep={false}
          />
          <GitFullSyncStep
            name={getString('gitsync.branchToSync')}
            onClose={closeHandler}
            onSuccess={(data?: GitSyncConfig) => {
              shouldRefreshOnClose = false
              handleSuccess(data)
            }}
          />
        </StepWizard>
        <Button
          minimal
          variation={ButtonVariation.ICON}
          icon="cross"
          iconProps={{ size: 18 }}
          className={css.crossIcon}
          onClick={closeHandler}
        />
      </Dialog>
    ) : (
      <Dialog {...modalProps}>
        <GitSyncRepoForm
          accountId={accountId}
          orgIdentifier={orgIdentifier}
          projectIdentifier={projectIdentifier}
          isEditMode={isEditMode}
          isNewUser={isNewUser}
          gitSyncRepoInfo={undefined}
          onSuccess={(data?: GitSyncConfig) => {
            handleSuccess(data)
            hideModal()
          }}
          onClose={closeHandler}
        />
        <Button
          minimal
          variation={ButtonVariation.ICON}
          icon="cross"
          iconProps={{ size: 18 }}
          className={css.crossIcon}
          onClick={closeHandler}
        />
      </Dialog>
    )
  }, [isEditMode, syncRepo, isNewUser])

  return {
    openGitSyncModal: (
      creatingFirstRepo: boolean,
      isEditing: boolean,
      gitSyncRepo: GitSyncConfig | undefined,
      _modalProps?: IDialogProps
    ) => {
      setSyncRepo(gitSyncRepo)
      setIsNewUser(creatingFirstRepo)
      setIsEditMode(isEditing)
      setModalProps(_modalProps || modalProps)
      showModal()
    },
    hideGitSyncModal: hideModal
  }
}

export default useCreateGitSyncModal
