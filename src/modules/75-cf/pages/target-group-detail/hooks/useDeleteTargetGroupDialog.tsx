/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Text, useToaster, UseConfirmationDialogReturn } from '@harness/uicore'
import { Intent } from '@harness/design-system'
import { useDeleteSegment, Segment } from 'services/cf'
import { useStrings } from 'framework/strings'
import { useConfirmAction } from '@common/hooks'
import { getErrorMessage, showToaster } from '@cf/utils/CFUtils'
import routes from '@common/RouteDefinitions'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'

const useDeleteTargetGroupDialog = (targetGroup: Segment): UseConfirmationDialogReturn['openDialog'] => {
  const { accountId: accountIdentifier, orgIdentifier, projectIdentifier } = useParams<Record<string, string>>()
  const { getString } = useStrings()
  const { showError, clear } = useToaster()
  const history = useHistory()
  const { withActiveEnvironment } = useActiveEnvironment()

  const { mutate: deleteTargetGroup } = useDeleteSegment({
    queryParams: {
      projectIdentifier,
      orgIdentifier,
      accountIdentifier,
      environmentIdentifier: targetGroup?.environment as string
    }
  })

  return useConfirmAction({
    title: getString('cf.segments.delete.title'),
    intent: Intent.DANGER,
    confirmText: getString('delete'),
    message: (
      <Text>
        <span
          dangerouslySetInnerHTML={{
            __html: getString('cf.segments.delete.message', { segmentName: targetGroup?.name })
          }}
        />
      </Text>
    ),
    action: async () => {
      clear()

      try {
        await deleteTargetGroup(targetGroup.identifier)

        showToaster(getString('cf.messages.segmentDeleted'))

        history.push(
          withActiveEnvironment(
            routes.toCFSegments({
              projectIdentifier,
              orgIdentifier,
              accountId: accountIdentifier
            })
          )
        )
      } catch (e) {
        showError(getErrorMessage(e), 0, 'cf.delete.segment.error')
      }
    }
  })
}

export default useDeleteTargetGroupDialog
