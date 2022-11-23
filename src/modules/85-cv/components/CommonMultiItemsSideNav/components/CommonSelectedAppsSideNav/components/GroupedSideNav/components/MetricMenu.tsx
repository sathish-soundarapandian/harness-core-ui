/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useState } from 'react'
import { Classes, Intent, Menu, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { Icon, Popover, useConfirmationDialog } from '@harness/uicore'
import { String, useStrings } from 'framework/strings'
import type { MetricMenuProps } from './MetricMenu.types'

export default function MetricMenu({
  onEdit,
  onDelete,
  titleText,
  contentText,
  confirmButtonText,
  deleteLabel,
  editLabel,
  itemName,
  index,
  metricThresholdTitleText,
  metricThresholdCancelButtonText,
  metricThresholdWarningContentText,
  showPromptOnDelete
}: MetricMenuProps): JSX.Element {
  const { getString } = useStrings()
  const [popoverOpen, setPopoverOpen] = useState(false)
  const { openDialog } = useConfirmationDialog({
    titleText,
    contentText,
    confirmButtonText: confirmButtonText ?? getString('delete'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: function (shouldDelete: boolean) {
      if (shouldDelete) {
        handleDelete()
      }
    }
  })

  const handleOnClose = useCallback(
    didConfirm => {
      if (didConfirm) {
        onDelete?.(itemName, index)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [index, itemName]
  )

  const { openDialog: openMetricThresholdConfirmationDialog } = useConfirmationDialog({
    contentText: metricThresholdWarningContentText ?? getString('common.confirmText'),
    titleText: metricThresholdTitleText ?? getString('common.confirmAction'),
    confirmButtonText: confirmButtonText ?? getString('confirm'),
    cancelButtonText: metricThresholdCancelButtonText ?? getString('cancel'),
    intent: Intent.WARNING,
    onCloseDialog: handleOnClose
  })

  const handleDelete = useCallback(() => {
    if (showPromptOnDelete) {
      openMetricThresholdConfirmationDialog()
    } else {
      onDelete?.(itemName, index)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, itemName, showPromptOnDelete])

  return (
    <Popover
      isOpen={popoverOpen}
      interactionKind={PopoverInteractionKind.HOVER}
      className={Classes.DARK}
      position={Position.RIGHT_TOP}
      onInteraction={nextOpenState => {
        setPopoverOpen(nextOpenState)
      }}
    >
      <Icon
        data-testid={`sideNav-options`}
        name="Options"
        onClick={() => {
          setPopoverOpen(!popoverOpen)
        }}
      />
      <Menu>
        <Menu.Item
          data-testid={`sideNav-edit`}
          icon="edit"
          text={editLabel ?? <String stringID="edit" />}
          onClick={onEdit}
        />
        <Menu.Item
          data-testid={`sideNav-delete`}
          icon="trash"
          text={deleteLabel ?? <String stringID="delete" />}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
            openDialog()
          }}
        />
      </Menu>
    </Popover>
  )
}
