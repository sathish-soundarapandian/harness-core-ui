/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Intent } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { useToaster, useConfirmationDialog } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { Project, useDeleteProject } from 'services/cd-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useAppStore, SavedProjectDetails } from 'framework/AppStore/AppStoreContext'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'

interface UseDeleteProjectDialogReturn {
  openDialog: () => void
}

const useDeleteProjectDialog = (data: Project, onSuccess: () => void): UseDeleteProjectDialogReturn => {
  const { accountId } = useParams<AccountPathProps>()
  const { updateAppStore } = useAppStore()
  const { getRBACErrorMessage } = useRBACError()
  const { preference: savedProject, clearPreference: clearSavedProject } = usePreferenceStore<SavedProjectDetails>(
    PreferenceScope.USER,
    'savedProject'
  )
  const { mutate: deleteProject } = useDeleteProject({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: data.orgIdentifier || /* istanbul ignore next */ ''
    }
  })
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { openDialog } = useConfirmationDialog({
    contentText: getString('projectCard.confirmDelete', { name: data.name }),
    titleText: getString('projectCard.confirmDeleteTitle'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: async (isConfirmed: boolean) => {
      if (isConfirmed) {
        try {
          const deleted = await deleteProject(data.identifier || /* istanbul ignore next */ '', {
            headers: { 'content-type': 'application/json' }
          })
          if (deleted)
            showSuccess(
              getString('projectCard.successMessage', { projectName: data.name || /* istanbul ignore next */ '' })
            )
          if (savedProject.projectIdentifier === data.identifier) {
            clearSavedProject()
            updateAppStore({ selectedProject: undefined, selectedOrg: undefined })
          }
          onSuccess()
        } catch (err) {
          /* istanbul ignore next */
          showError(getRBACErrorMessage(err))
        }
      }
    }
  })
  return {
    openDialog
  }
}

export default useDeleteProjectDialog
