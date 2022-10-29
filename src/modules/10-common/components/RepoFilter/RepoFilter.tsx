/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color, DropDown, Icon, Layout, SelectOption } from '@harness/uicore'
// import { useEffect } from '@storybook/addons'

// import { useStrings } from 'framework/strings'
import React, { useState } from 'react'
// import css from './RepoFilter.module.scss'

export interface RepoSelectOption {
  repo: string
}

export interface RepoFilterProps {
  onChange?: (selected: RepoSelectOption) => void
  disabled?: boolean
  repoFilterClassName?: string
}

const RepoFilter: React.FC<RepoFilterProps> = props => {
  const { disabled = false } = props
  //   const { getString } = useStrings()
  const dropDown = [
    { label: 'suman', value: 'suman7364646373737373' },
    { label: 'gvk', value: 'gvk' }
  ]
  //   const [repoSelectOptions, setRepoSelectOptions] = useState<SelectOption[]>(dropDown)

  const [selectedRepo, setSelectedRepo] = useState<string>('')

  const onChangeRepo = (selected: SelectOption): void => {
    if (selected.value === selectedRepo) {
      return
    }
    setSelectedRepo(selected.value as string)
  }

  return (
    <div>
      <Layout.Horizontal spacing="xsmall">
        <Icon padding={{ top: 'small' }} name="repository" color={Color.GREY_600}></Icon>
        <DropDown
          items={dropDown}
          disabled={disabled}
          buttonTestId={'repo-filter'}
          value={selectedRepo}
          onChange={selected => onChangeRepo(selected)}
          placeholder={'Repository'}
          addClearBtn={true}
          minWidth={160}
        ></DropDown>
      </Layout.Horizontal>
    </div>
  )
}

export default RepoFilter
