/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Popover, PopoverInteractionKind, Position } from '@blueprintjs/core'
import {
  Container,
  Icon,
  Checkbox,
  Layout,
  Text,
  FlexExpander,
  ExpandingSearchInput,
  Button,
  ButtonVariation
} from '@wings-software/uicore'
import { FontVariation, Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { QlceViewFieldInputInput } from 'services/ce/services'
import type { Column } from './Columns'
import css from './ColumnSelector.module.scss'

interface ColumnSelectorProps {
  columns: Column[]
  selectedColumns: Column[]
  onChange: (cols: Column[]) => void
  openDownloadCSVModal?: () => void
  allowExportAsCSV?: boolean
  groupBy: QlceViewFieldInputInput
  setGridSearchParam?: React.Dispatch<React.SetStateAction<string>>
  isPerspectiveDetailsPage?: boolean
}

const ColumSelector = (props: ColumnSelectorProps): JSX.Element => {
  const { getString } = useStrings()
  const {
    columns,
    selectedColumns,
    onChange,
    openDownloadCSVModal,
    allowExportAsCSV = false,
    setGridSearchParam,
    groupBy,
    isPerspectiveDetailsPage
  } = props

  const handleSelectOne = (column: Column): void => {
    const originalPosition = columns.indexOf(column)
    const idx = selectedColumns.indexOf(column)
    const sc =
      idx > -1
        ? [...selectedColumns.slice(0, idx), ...selectedColumns.slice(idx + 1)]
        : [...selectedColumns.slice(0, originalPosition), column, ...selectedColumns.slice(originalPosition)]

    onChange(sc)
  }

  return (
    <Layout.Horizontal style={{ alignItems: 'center' }} padding={{ left: 'xlarge', top: 'xlarge' }}>
      {isPerspectiveDetailsPage ? (
        <Text
          font={{ variation: FontVariation.H6 }}
          color={Color.GREY_400}
          padding={{ right: 'large' }}
          border={{ right: true }}
        >
          {getString('ce.perspectives.groupByByCost', { groupBy: groupBy.fieldName })}
        </Text>
      ) : null}
      {allowExportAsCSV ? (
        <Button
          onClick={openDownloadCSVModal}
          text={getString('ce.perspectives.exportCSV')}
          rightIcon="launch"
          iconProps={{ size: 12 }}
          variation={ButtonVariation.LINK}
        />
      ) : null}
      <FlexExpander />
      {isPerspectiveDetailsPage ? (
        <ExpandingSearchInput onChange={setGridSearchParam} alwaysExpanded width={230} className={css.search} />
      ) : null}
      <Popover
        interactionKind={PopoverInteractionKind.CLICK}
        position={Position.BOTTOM_LEFT}
        modifiers={{
          arrow: { enabled: false },
          flip: { enabled: true },
          keepTogether: { enabled: true },
          preventOverflow: { enabled: true }
        }}
        content={
          <div className={css.dropDown}>
            {columns.map(column => {
              return (
                <div key={column.accessor} className={css.columnInfo}>
                  <Checkbox
                    disabled={column.hideable === false}
                    label={column.Header}
                    onClick={() => handleSelectOne(column)}
                    checked={selectedColumns.includes(column)}
                    data-testid={`checkbox-${column.accessor}`}
                  />
                </div>
              )
            })}
          </div>
        }
      >
        <Container className={css.container}>
          <div className={css.selectBtn}>
            <span>{getString('ce.gridColumnSelector')}</span>
            <Icon name="chevron-down" />
          </div>
        </Container>
      </Popover>
    </Layout.Horizontal>
  )
}

export default ColumSelector
