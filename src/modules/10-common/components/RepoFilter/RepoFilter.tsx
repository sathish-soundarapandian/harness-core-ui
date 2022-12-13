/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, DropDown, Icon, Layout, SelectOption } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { defaultTo } from 'lodash-es'
import { useStrings } from 'framework/strings'

import BranchFilter from '../BranchFilter/BranchFilter'
import css from './RepoFilter.module.scss'

export interface RepoFilterProps {
  value?: string
  onChange?: (repoName: string) => void
  repositories?: string[] | undefined
  isLoadingRepos?: boolean
  isError?: boolean
  className?: string
  showBranchFilter?: boolean
  selectedBranch?: string
  onBranchChange?: (selected: SelectOption) => void
  onRefetch?: () => void
  disabled?: boolean
}

export function RepoFilter({
  repositories,
  isLoadingRepos,
  isError,
  value,
  onChange,
  showBranchFilter,
  onBranchChange,
  selectedBranch,
  onRefetch
}: RepoFilterProps): JSX.Element {
  const { getString } = useStrings()

  const dropDownItems = React.useMemo(
    () =>
      repositories?.map((repo: string) => ({
        label: defaultTo(repo, ''),
        value: defaultTo(repo, '')
      })) as SelectOption[],
    [repositories]
  )

  return (
    <Container>
      <Layout.Horizontal spacing="xsmall">
        <DropDown
          className={css.repoFilterContainer}
          items={dropDownItems}
          disabled={isLoadingRepos || isError}
          buttonTestId={'repo-filter'}
          value={value}
          onChange={selected => onChange?.(selected.value.toString())}
          placeholder={getString('common.selectRepository')}
          addClearBtn={true}
          minWidth={160}
          usePortal={true}
          resetOnClose
          resetOnSelect
        ></DropDown>
        {isError && (
          <Icon
            name="refresh"
            size={16}
            color={Color.PRIMARY_7}
            background={Color.PRIMARY_1}
            padding="small"
            className={css.refreshIcon}
            onClick={onRefetch}
          />
        )}
        {showBranchFilter && (
          <BranchFilter disabled={!value} repoName={value} selectedBranch={selectedBranch} onChange={onBranchChange} />
        )}
      </Layout.Horizontal>
    </Container>
  )
}

export default RepoFilter
