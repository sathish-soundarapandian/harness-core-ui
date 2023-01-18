/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useMemo, useState } from 'react'
import { Classes, Intent, Menu, PopoverInteractionKind, Position } from '@blueprintjs/core'
import { Icon, Popover, useConfirmationDialog } from '@harness/uicore'
import { String, useStrings } from 'framework/strings'
import { useCommonHealthSource } from '@cv/pages/health-source/connectors/CommonHealthSource/components/CustomMetricForm/components/CommonHealthSourceContext/useCommonHealthSource'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import { isGivenMetricNameContainsThresholds } from '@cv/pages/health-source/common/MetricThresholds/MetricThresholds.utils'
import type { MetricMenuProps } from './MetricMenu.types'
import css from './MetricMenu.module.scss'

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
  metricThresholdWarningContentText,
  hideDeleteIcon
}: MetricMenuProps): JSX.Element {
  const { getString } = useStrings()
  const [popoverOpen, setPopoverOpen] = useState(false)

  const { parentFormValues } = useCommonHealthSource()

  const { isTemplate } = useContext(SetupSourceTabsContext)

  const { ignoreThresholds, failFastThresholds } = parentFormValues

  const shouldShowMetricThresholdsPrompt = useMemo(
    () =>
      Boolean(
        itemName &&
          !isTemplate &&
          isGivenMetricNameContainsThresholds({ ignoreThresholds, failFastThresholds }, itemName)
      ),
    [failFastThresholds, ignoreThresholds, isTemplate, itemName, parentFormValues]
  )

  const { openDialog } = useConfirmationDialog({
    titleText: shouldShowMetricThresholdsPrompt ? metricThresholdTitleText : titleText,
    contentText: shouldShowMetricThresholdsPrompt ? metricThresholdWarningContentText : contentText,
    confirmButtonText: confirmButtonText ?? getString('delete'),
    cancelButtonText: getString('cancel'),
    intent: Intent.DANGER,
    buttonIntent: Intent.DANGER,
    onCloseDialog: function (shouldDelete: boolean) {
      if (shouldDelete) {
        onDelete?.(itemName, index)
      }
    },
    className: css.metricMenuConfirmationPopup
  })

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
          data-testid="sideNav-edit"
          icon="edit"
          text={editLabel ?? <String stringID="edit" />}
          onClick={onEdit}
        />
        {!hideDeleteIcon ? (
          <Menu.Item
            data-testid="sideNav-delete"
            icon="trash"
            text={deleteLabel ?? <String stringID="delete" />}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              openDialog()
            }}
          />
        ) : null}
      </Menu>
    </Popover>
  )
}
