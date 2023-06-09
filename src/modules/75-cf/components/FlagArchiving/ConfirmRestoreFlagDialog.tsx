import React from 'react'
import { useToaster } from '@harness/uicore'
import { Intent } from '@harness/design-system'
import { String, useStrings } from 'framework/strings'
import { useConfirmAction } from '@common/hooks'
import { getErrorMessage } from '@cf/utils/CFUtils'

const ConfirmRestoreFlagDialog = () => {
  const { getString } = useStrings()
  const { showError } = useToaster()

  return useConfirmAction({
    title: getString('cf.featureFlags.archiving.restoreFlag'),
    intent: Intent.DANGER,
    confirmText: getString('cf.featureFlags.archiving.restore'),
    message: <String stringID="cf.featureFlags.archiving.restoreDescription" />,
    action: async () => {
      try {
        console.log(' await restoreFlag()')
      } catch (e) {
        showError(getErrorMessage(e), 0, 'cf.delete.target.error')
      }
    }
  })
}

export default ConfirmRestoreFlagDialog
