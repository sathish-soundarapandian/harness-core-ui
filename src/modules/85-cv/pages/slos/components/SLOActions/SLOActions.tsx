/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, Layout, useConfirmationDialog, Text } from '@harness/uicore'
import { Color, Intent } from '@harness/design-system'
import { PopoverInteractionKind, Position } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import type { DowntimeStatusDetails, SLOHealthListView } from 'services/cv'
import downTime from '@cv/assets/downTime.svg'
import dataCollectionFailure from '@cv/assets/dataCollectionFailure.svg'
import { DowntimeStatus } from '../../SLODowntimePage/SLODowntimePage.types'
import DowntimeTooltip from '../../common/DowntimeTooltip/DowntimeTooltip'
import DataCollectionFailureTooltip from '../../common/DataCollectionFailureTooltip/DataCollectionFailureTooltip'
import css from './SLOActions.module.scss'

export interface SLOActionsProps {
  onDelete: (sloIdentifier: string, title: string, sloType?: SLOHealthListView['sloType']) => Promise<void>
  onEdit: (sloIdentifier: string) => void
  sloIdentifier: string
  title: string
  sloType?: SLOHealthListView['sloType']
  downtimeStatusDetails: DowntimeStatusDetails
  sloError?: SLOHealthListView['sloError']
}

export default function SLOActions(props: SLOActionsProps): JSX.Element {
  const { onDelete, onEdit, sloIdentifier, title, sloType, downtimeStatusDetails, sloError } = props
  const { getString } = useStrings()

  const { openDialog } = useConfirmationDialog({
    titleText: getString('common.delete', { name: title }),
    contentText: <Text color={Color.GREY_800}>{getString('cv.slos.confirmDeleteSLO', { name: title })}</Text>,
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: (isConfirmed: boolean) => {
      if (isConfirmed) {
        onDelete(sloIdentifier, title, sloType)
      }
    }
  })

  return (
    <Layout.Horizontal className={css.actions} spacing={'medium'}>
      {downtimeStatusDetails && downtimeStatusDetails.status === DowntimeStatus.ACTIVE && (
        <Text
          flex
          tooltip={<DowntimeTooltip downtimeStatusDetails={downtimeStatusDetails} renderOnSLOListingPage />}
          tooltipProps={{
            isDark: true,
            interactionKind: PopoverInteractionKind.HOVER,
            position: Position.BOTTOM_RIGHT,
            usePortal: false
          }}
        >
          <img className={css.downtimeIcon} src={downTime} />
        </Text>
      )}
      {sloError?.failedState && (
        <Text
          flex
          tooltip={<DataCollectionFailureTooltip sloError={sloError} />}
          tooltipProps={{
            isDark: true,
            interactionKind: PopoverInteractionKind.HOVER,
            position: Position.BOTTOM_RIGHT,
            usePortal: false
          }}
        >
          <img className={css.downtimeIcon} src={dataCollectionFailure} />
        </Text>
      )}
      <Icon
        className={css.actionIcons}
        padding={'xsmall'}
        name="Edit"
        title={getString('edit')}
        size={16}
        onClick={e => {
          e.stopPropagation()
          onEdit(sloIdentifier)
        }}
      />
      <Icon
        className={css.actionIcons}
        padding={'xsmall'}
        name="main-trash"
        title={getString('delete')}
        size={16}
        onClick={e => {
          e.stopPropagation()
          openDialog()
        }}
      />
    </Layout.Horizontal>
  )
}
