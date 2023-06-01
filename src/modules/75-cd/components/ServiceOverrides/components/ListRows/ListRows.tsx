import React from 'react'
import cx from 'classnames'
import { Card, Container } from '@harness/uicore'
import { useServiceOverridesContext } from '@cd/components/ServiceOverrides/context/ServiceOverrideContext'
import EditableRow from './Editable/EditableRow'
import ViewOnlyRow from './ViewOnly/ViewOnlyRow'
import css from './ListRows.module.scss'

export default function ListRows(): React.ReactElement {
  const { listRowItems } = useServiceOverridesContext()

  return (
    <>
      {listRowItems.map((listRowItem, index) => {
        const { isNew, isEdit, overrideDetails, rowIndex, groupKey } = listRowItem
        const hasTopMargin = index === 0 ? false : groupKey !== listRowItems[index - 1].groupKey
        const hasTopBorder = index === 0 ? false : !hasTopMargin
        const hasTopBorderRadius = index === 0 || hasTopMargin
        const hasBottomBorderRadius =
          index === listRowItems.length - 1 ? true : groupKey !== listRowItems[index + 1].groupKey

        return (
          <>
            {hasTopBorder && <Container height={1} />}
            <Card
              key={index}
              className={cx(css.listRowCard, {
                [css.topMargin]: hasTopMargin,
                [css.topBorderRadius]: hasTopBorderRadius,
                [css.bottomBorderRadius]: hasBottomBorderRadius,
                [css.roundedCard]: hasTopBorderRadius && hasBottomBorderRadius
              })}
            >
              {isNew ? (
                <EditableRow rowIndex={rowIndex} isEdit={false} />
              ) : (
                overrideDetails &&
                (isEdit ? (
                  <EditableRow rowIndex={rowIndex} overrideDetails={overrideDetails} isEdit={true} />
                ) : (
                  <ViewOnlyRow rowIndex={rowIndex} overrideDetails={overrideDetails} />
                ))
              )}
            </Card>
          </>
        )
      })}
    </>
  )
}
