/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { Container, DropDown, Icon, Layout, SelectOption } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { defaultTo, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { UseGetReturn } from 'restful-react'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { Failure } from 'services/template-ng'

import { Scope } from '@common/interfaces/SecretsInterface'
import BranchFilter from '../BranchFilter/BranchFilter'
import css from './RepoFilter.module.scss'

export interface RepoFilterProps {
  value?: string
  onChange?: (repoName: string) => void
  className?: string
  showBranchFilter?: boolean
  selectedBranch?: string
  onBranchChange?: (selected: SelectOption) => void
  disabled?: boolean

  selectedScope?: string
  getRepoListPromise: (props: any) => UseGetReturn<any, Failure | Error, any, unknown>
}

export function RepoFilter({
  value,
  onChange,
  getRepoListPromise,
  showBranchFilter,
  onBranchChange,
  selectedBranch,
  selectedScope
}: RepoFilterProps) {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()

  const queryParams = useMemo(() => {
    switch (selectedScope) {
      case 'all':
        return {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          includeAllTemplatesAvailableAtScope: true
        }
      case Scope.ACCOUNT:
        return {
          accountIdentifier: accountId
        }
      case Scope.ORG:
        return {
          accountIdentifier: accountId,
          orgIdentifier
        }
      case Scope.PROJECT:
        return {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier
        }
    }
    return {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  }, [selectedScope, accountId, orgIdentifier, projectIdentifier])

  const {
    data: repoListData,
    error,
    loading,
    refetch
  } = getRepoListPromise({
    queryParams: queryParams
  })

  const dropDownItems = React.useMemo(
    () =>
      repoListData?.data?.repositories?.map((repo: string) => ({
        label: defaultTo(repo, ''),
        value: defaultTo(repo, '')
      })) as SelectOption[],
    [repoListData?.data?.repositories]
  )

  const onRefetch = React.useCallback((): void => {
    refetch()
  }, [refetch])

  return (
    <Container>
      <Layout.Horizontal spacing="xsmall">
        <DropDown
          className={css.repoFilterContainer}
          items={dropDownItems}
          disabled={loading || !isEmpty(error)}
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
        {!isEmpty(error) && (
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
