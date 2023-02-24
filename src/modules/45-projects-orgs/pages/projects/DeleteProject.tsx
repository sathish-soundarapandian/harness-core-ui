/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Intent } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { useToaster, useConfirmationDialog, Checkbox, Button, ButtonVariation, Layout } from '@harness/uicore'
import React, { useState } from 'react'
import { useStrings } from 'framework/strings'
import { Project, useDeleteProject } from 'services/cd-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useAppStore, SavedProjectDetails } from 'framework/AppStore/AppStoreContext'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'

interface UseDeleteProjectDialogReturn {
  openDialog: () => void
}
interface DeleteProjectOrgButtonsProps {
  onDelete: () => void
  onCancel: () => void
}
export const DeleteProjectOrgButtons: React.FC<DeleteProjectOrgButtonsProps> = ({ onDelete, onCancel }) => {
  const { getString } = useStrings()
  const [doubleCheckDelete, setDoubleCheckDelete] = useState<boolean>(false)
  return (
    <Layout.Vertical spacing="none">
      <Checkbox
        margin={{ top: 'none', bottom: 'medium' }}
        label={getString('projectsOrgs.yesIamSure')}
        onChange={(event: React.FormEvent<HTMLInputElement>) => {
          setDoubleCheckDelete(event.currentTarget.checked)
        }}
      />
      <Layout.Horizontal spacing="xsmall" flex={{ alignItems: 'flex-start' }}>
        <Button
          disabled={!doubleCheckDelete}
          text={getString('delete')}
          intent={Intent.DANGER}
          onClick={() => {
            onDelete?.()
          }}
        />
        <Button text={getString('cancel')} variation={ButtonVariation.TERTIARY} onClick={() => onCancel?.()} />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}
const useDeleteProjectDialog = (data: Project, onSuccess: () => void): UseDeleteProjectDialogReturn => {
  const { accountId } = useParams<AccountPathProps>()
  const { updateAppStore, selectedProject: selectedProjectFromAppStore } = useAppStore()
  const { getRBACErrorMessage } = useRBACError()
  const { preference: savedProjectFromPreferenceStore, clearPreference: clearSavedProject } =
    usePreferenceStore<SavedProjectDetails>(PreferenceScope.USER, 'savedProject')
  const { mutate: deleteProject } = useDeleteProject({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: data.orgIdentifier || /* istanbul ignore next */ ''
    }
  })
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const onDeleteAction = async () => {
    try {
      const deleted = await deleteProject(data.identifier || /* istanbul ignore next */ '', {
        headers: { 'content-type': 'application/json' }
      })
      if (deleted.data) {
        showSuccess(
          getString('projectCard.successMessage', { projectName: data.name || /* istanbul ignore next */ '' })
        )
        if (savedProjectFromPreferenceStore?.projectIdentifier === data?.identifier) {
          clearSavedProject()
        }
        if (selectedProjectFromAppStore?.identifier === data?.identifier) {
          updateAppStore({ selectedProject: undefined, selectedOrg: undefined })
        }
        onSuccess()
      } else {
        showError(
          getString('projectsOrgs.projectDeleteErrorMessage', {
            projectName: data.name || /* istanbul ignore next */ ''
          })
        )
      }
    } catch (err) {
      /* istanbul ignore next */
      showError(getRBACErrorMessage(err))
    } finally {
      closeDialog()
    }
  }
  const { openDialog, closeDialog } = useConfirmationDialog({
    contentText: getString('projectCard.confirmDelete', { name: data.name }),
    titleText: getString('projectCard.confirmDeleteTitle'),
    intent: Intent.DANGER,
    customButtons: (
      <DeleteProjectOrgButtons
        onCancel={() => {
          closeDialog()
        }}
        onDelete={onDeleteAction}
      />
    ),
    onCloseDialog: async (isConfirmed: boolean) => {
      if (isConfirmed) {
        onDeleteAction()
      }
    }
  })
  return {
    openDialog
  }
}

export default useDeleteProjectDialog
