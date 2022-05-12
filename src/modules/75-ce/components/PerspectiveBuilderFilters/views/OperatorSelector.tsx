/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Icon } from '@wings-software/uicore'
import { Popover, PopoverInteractionKind, Position } from '@blueprintjs/core'
import cx from 'classnames'
import { QlceViewFilterOperator } from 'services/ce/services'
import CustomMenuItem from '@ce/components/CustomMenu/CustomMenuItem'
import { useStrings } from 'framework/strings'

import css from '../PerspectiveBuilderFilter.module.scss'

interface OperatorSelectorProps {
  operator: QlceViewFilterOperator
  onOperatorChange: (op: QlceViewFilterOperator) => void
  isDisabled: boolean
}

const OperatorSelector: React.FC<OperatorSelectorProps> = ({ operator, onOperatorChange, isDisabled }) => {
  const { getString } = useStrings()
  const operators = [
    {
      value: QlceViewFilterOperator.In,
      label: getString('ce.perspectives.createPerspective.operatorLabels.in')
    },
    {
      value: QlceViewFilterOperator.NotIn,
      label: getString('ce.perspectives.createPerspective.operatorLabels.notIn')
    },
    {
      value: QlceViewFilterOperator.Null,
      label: getString('ce.perspectives.createPerspective.operatorLabels.opNull')
    },
    {
      value: QlceViewFilterOperator.NotNull,
      label: getString('ce.perspectives.createPerspective.operatorLabels.opNotNull')
    },
    {
      value: QlceViewFilterOperator.Like,
      label: getString('ce.perspectives.createPerspective.operatorLabels.opLike')
    }
  ]

  return (
    <Popover
      disabled={isDisabled}
      interactionKind={PopoverInteractionKind.CLICK}
      position={Position.BOTTOM_LEFT}
      modifiers={{
        arrow: { enabled: false },
        flip: { enabled: true },
        keepTogether: { enabled: true },
        preventOverflow: { enabled: true }
      }}
      fill={true}
      usePortal={true}
      content={
        <Container>
          {operators.map(opertor => {
            return (
              <CustomMenuItem
                hidePopoverOnClick={true}
                onClick={() => {
                  onOperatorChange(opertor.value)
                }}
                key={opertor?.label}
                fontSize={'normal'}
                text={opertor.value || ''}
              />
            )
          })}
        </Container>
      }
    >
      <div className={cx(css.operandSelectorContainer, { [css.disabledSelect]: isDisabled })}>
        {operator && !isDisabled ? operator : getString('ce.perspectives.createPerspective.filters.operator')}
        <Icon name="caret-down" />
      </div>
    </Popover>
  )
}

export default OperatorSelector
