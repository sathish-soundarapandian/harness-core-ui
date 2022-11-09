/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React from 'react'
import { Color, DropDown, Icon, Layout, SelectOption } from '@harness/uicore'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import css from './RepoFilter.module.scss'

export interface RepoFilterProps {
  dropDownItems: SelectOption[]
  selectedRepo: string
  placeholder?: string
  onChange?: (selected: SelectOption) => void
  onClick?: () => void
  disabled?: boolean
  repoFilterClassName?: string
  showRefetchButton?: boolean
}

const RepoFilter: React.FC<RepoFilterProps> = props => {
  const { onChange, dropDownItems, selectedRepo, showRefetchButton = false, onClick } = props
  const { getString } = useStrings()
  const { placeholder = getString('repository'), disabled = false } = props

  return (
    <div>
      <Layout.Horizontal spacing="xsmall">
        <DropDown
          items={dropDownItems}
          disabled={disabled}
          buttonTestId={'repo-filter'}
          value={selectedRepo}
          onChange={selected => onChange?.(selected)}
          placeholder={placeholder}
          addClearBtn={true}
          minWidth={160}
          usePortal={true}
        ></DropDown>

        {showRefetchButton && (
          <Layout.Horizontal
            spacing="small"
            flex={{ alignItems: 'flex-start' }}
            className={cx(css.refreshButtonWrapper)}
          >
            <Icon
              name="refresh"
              size={16}
              color={Color.PRIMARY_7}
              background={Color.PRIMARY_1}
              padding="small"
              className={css.refreshIcon}
              onClick={onClick}
            />
          </Layout.Horizontal>
        )}
      </Layout.Horizontal>
    </div>
  )
}

export default RepoFilter
