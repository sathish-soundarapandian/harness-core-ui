/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, TextInput } from '@harness/uicore'
import { MenuItem } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import {
  QlceViewFieldInputInput,
  ViewFieldIdentifier,
  Maybe,
  QlceViewFieldIdentifierData,
  QlceViewField
} from 'services/ce/services'

import css from '../PerspectiveBuilderPreview.module.scss'

interface GroupByViewSubMenuProps {
  labelData: Maybe<Maybe<string>[]>
  field: QlceViewFieldIdentifierData
  setGroupBy: (groupBy: QlceViewFieldInputInput) => void
}

/* istanbul ignore next */
const GroupByViewSubMenu: (props: GroupByViewSubMenuProps) => JSX.Element | null = ({
  field,
  labelData,
  setGroupBy
}) => {
  const { getString } = useStrings()
  const [searchText, setSearchText] = React.useState('')

  const filteredLabelData = (labelData || []).filter(label => {
    if (!label) {
      return false
    }
    return label.toLocaleLowerCase().indexOf(searchText.toLocaleLowerCase()) < 0 ? false : true
  })

  const renderLabels: (value: QlceViewField) => void = value => {
    return (
      <MenuItem className={css.menuItem} key={value.fieldId} text={value.fieldName}>
        <div className={css.groupByLabel}>
          <TextInput
            value={searchText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchText(e.target.value)
            }}
            placeholder={getString('ce.perspectives.createPerspective.filters.searchText')}
          />
          <Container className={css.labelValueContainer}>
            {filteredLabelData.map(label => (
              <MenuItem
                className={css.menuItem}
                key={label}
                text={label}
                onClick={() =>
                  setGroupBy({
                    identifier: ViewFieldIdentifier.Label,
                    fieldId: 'labels.value',
                    fieldName: label || '',
                    identifierName: 'Label'
                  })
                }
              />
            ))}
          </Container>
        </div>
      </MenuItem>
    )
  }

  if (field.values.length) {
    return (
      <>
        {field.values.map(value => {
          if (value) {
            if (value.fieldId === 'label') {
              return renderLabels(value)
            }
            return (
              <MenuItem
                className={css.menuItem}
                key={value.fieldId}
                text={value.fieldName}
                onClick={() =>
                  setGroupBy({
                    fieldId: value.fieldId,
                    fieldName: value.fieldName,
                    identifier: field.identifier,
                    identifierName: field.identifierName
                  })
                }
              />
            )
          }
          return null
        })}
      </>
    )
  }
  return null
}

export default GroupByViewSubMenu
