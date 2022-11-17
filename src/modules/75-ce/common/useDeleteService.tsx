/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Intent } from '@blueprintjs/core'
import { useConfirmationDialog } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import { Service, useDeleteService } from 'services/lw'

interface UseDeleteServiceHookProps {
  serviceData: Service
  accountId: string
  onSuccess?: (data: Service) => void
  onFailure?: (error: any) => void
}

interface UseDeleteServiceHookReturn {
  triggerDelete: () => void
}

const useDeleteServiceHook = (props: UseDeleteServiceHookProps): UseDeleteServiceHookReturn => {
  const { accountId, serviceData } = props
  const { getString } = useStrings()
  const { mutate: deleteServiceApiCall } = useDeleteService({
    account_id: accountId,
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const deleteRule = async (isConfirmed: boolean) => {
    if (isConfirmed) {
      try {
        const deletionResponse: any = await deleteServiceApiCall(serviceData.id as number)
        if (deletionResponse.success) {
          props.onSuccess?.(serviceData)
        } else {
          props.onFailure?.(deletionResponse.errors?.join('\n'))
        }
      } catch (e) {
        props.onFailure?.(e)
      }
    }
  }

  const { openDialog } = useConfirmationDialog({
    titleText: getString('ce.co.autoStoppingRule.confirm.deleteServiceTitle', { name: serviceData.name }),
    contentText: getString('ce.co.autoStoppingRule.confirm.deleteDialogText'),
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    onCloseDialog: deleteRule
  })

  return {
    triggerDelete: () => openDialog()
  }
}

export default useDeleteServiceHook
