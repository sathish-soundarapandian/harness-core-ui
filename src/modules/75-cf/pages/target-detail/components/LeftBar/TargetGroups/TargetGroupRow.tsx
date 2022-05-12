/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { ButtonVariation, FontVariation, Layout, Text } from '@harness/uicore'
import routes from '@common/RouteDefinitions'
import type { TargetDetailSegment } from 'services/cf'
import { useStrings } from 'framework/strings'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ItemContainer } from '@cf/components/ItemContainer/ItemContainer'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import { useConfirmAction, UseConfirmActionDialogProps } from '@common/hooks/useConfirmAction'

export interface TargetGroupRowProps {
  targetGroup: TargetDetailSegment
  confirmActionProps: UseConfirmActionDialogProps
}

const TargetGroupRow: FC<TargetGroupRowProps> = ({ targetGroup, confirmActionProps }) => {
  const history = useHistory()
  const { getString } = useStrings()
  const { activeEnvironment: environmentIdentifier, withActiveEnvironment } = useActiveEnvironment()
  const { orgIdentifier, projectIdentifier, accountId } = useParams<Record<string, string>>()

  const openConfirmDialog = useConfirmAction(confirmActionProps)

  return (
    <ItemContainer
      clickable
      data-testid="target-group-row"
      // the underlying component overrides `className` when `clickable`
      // is set, so need to use inline styling
      style={{ border: '1px solid transparent' }}
      onClick={() =>
        history.push(
          withActiveEnvironment(
            routes.toCFSegmentDetails({
              orgIdentifier,
              projectIdentifier,
              accountId,
              segmentIdentifier: targetGroup.identifier as string
            })
          )
        )
      }
    >
      <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'space-between' }} spacing="small">
        <Text lineClamp={1} font={{ variation: FontVariation.BODY }}>
          {targetGroup.name}
        </Text>
        <RbacButton
          aria-label={getString('cf.targetDetail.removeSegment')}
          icon="trash"
          variation={ButtonVariation.ICON}
          onClick={e => {
            e.stopPropagation()
            openConfirmDialog()
          }}
          permission={{
            resource: { resourceType: ResourceType.ENVIRONMENT, resourceIdentifier: environmentIdentifier },
            permission: PermissionIdentifier.EDIT_FF_TARGETGROUP
          }}
        />
      </Layout.Horizontal>
    </ItemContainer>
  )
}

export default TargetGroupRow
