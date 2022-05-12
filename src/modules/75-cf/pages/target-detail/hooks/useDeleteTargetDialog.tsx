/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { UseConfirmationDialogReturn, useToaster } from '@wings-software/uicore'
import { Intent } from '@harness/design-system'
import { Target, useDeleteTarget } from 'services/cf'
import { String, useStrings } from 'framework/strings'
import { useConfirmAction } from '@common/hooks'
import { getErrorMessage } from '@cf/utils/CFUtils'
import routes from '@common/RouteDefinitions'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'

const useDeleteTargetDialog = (target?: Target): UseConfirmationDialogReturn['openDialog'] => {
  const { accountId: accountIdentifier, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()
  const { getString } = useStrings()
  const { showSuccess, showError, clear } = useToaster()
  const history = useHistory()
  const { withActiveEnvironment } = useActiveEnvironment()

  const { mutate: deleteTarget } = useDeleteTarget({
    queryParams: {
      projectIdentifier,
      orgIdentifier,
      accountIdentifier,
      environmentIdentifier: target?.environment as string
    }
  })

  return useConfirmAction({
    title: getString('cf.targets.deleteTarget'),
    intent: Intent.DANGER,
    confirmText: getString('delete'),
    message: <String stringID="cf.targets.deleteTargetMessage" vars={{ name: target?.name }} useRichText />,
    action: async () => {
      clear()

      try {
        await deleteTarget(target?.identifier as string)

        showSuccess(getString('cf.messages.targetDeleted'))

        history.push(
          withActiveEnvironment(
            routes.toCFTargets({
              projectIdentifier,
              orgIdentifier,
              accountId: accountIdentifier
            })
          )
        )
      } catch (e) {
        showError(getErrorMessage(e), 0, 'cf.delete.target.error')
      }
    }
  })
}

export default useDeleteTargetDialog
