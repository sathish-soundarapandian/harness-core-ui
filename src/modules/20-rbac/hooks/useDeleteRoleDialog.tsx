import { useConfirmationDialog, useToaster } from '@harness/uicore'
import { Intent } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { Role, useDeleteRole } from 'services/rbac'

interface DeleteRoleDialogProps {
  role: Role
  refetch: () => void
}

interface DeleteRoleDialogReturn {
  openDeleteDialog: () => void
}

function useDeleteRoleDialog(props: DeleteRoleDialogProps): DeleteRoleDialogReturn {
  const { role, refetch } = props
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps & ModulePathParams>()
  const { showSuccess, showError } = useToaster()
  const { mutate: deleteRole } = useDeleteRole({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })

  const { openDialog: openDeleteDialog } = useConfirmationDialog({
    contentText: getString('rbac.roleCard.confirmDelete', { name: role.name }),
    titleText: getString('rbac.roleCard.confirmDeleteTitle'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: async (isConfirmed: boolean) => {
      /* istanbul ignore else */ if (isConfirmed) {
        try {
          const deleted = await deleteRole(role.identifier, {
            headers: { 'content-type': 'application/json' }
          })
          /* istanbul ignore else */ if (deleted) {
            showSuccess(getString('rbac.roleCard.successMessage', { name: role.name }))
            refetch()
          } else {
            showError(getString('deleteError'))
          }
        } catch (err) {
          /* istanbul ignore next */
          showError(err?.data?.message || err?.message)
        }
      }
    }
  })

  return {
    openDeleteDialog
  }
}

export default useDeleteRoleDialog
