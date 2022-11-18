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
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Scope } from '@common/interfaces/SecretsInterface'
import { useGetExecutionRepositoriesList, useGetRepositoryList } from 'services/pipeline-ng'
import { useGetRepositoryList as getRepoListForTemplate } from 'services/template-ng'
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
  isPipelinePage?: boolean
  isExecutionsPage?: boolean
  isTemplatesPage?: boolean
}

export function RepoFilter({
  value,
  onChange,
  showBranchFilter,
  isPipelinePage = false,
  isExecutionsPage = false,
  isTemplatesPage = false,
  onBranchChange,
  selectedBranch,
  selectedScope
}: RepoFilterProps): JSX.Element {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()

  const queryParamsForTemplate = useMemo(() => {
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
    data: repoListOfPipelines,
    error: ErrorForPipelines,
    loading: loadingForPipelines,
    refetch: refetchRepoForPipelines
  } = useGetRepositoryList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: isPipelinePage
  })

  const {
    data: repoListOfExecutions,
    error: ErrorForExecutions,
    loading: loadingForExecutions,
    refetch: refetchRepoForExecutions
  } = useGetExecutionRepositoriesList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: isExecutionsPage
  })

  const {
    data: repoListOfTemplates,
    error: ErrorForTemplates,
    loading: loadingForTemplates,
    refetch: refetchRepoForTemplates
  } = getRepoListForTemplate({
    queryParams: queryParamsForTemplate,
    lazy: isTemplatesPage
  })

  const onRefetch = React.useCallback((): void => {
    if (isPipelinePage) refetchRepoForPipelines()
    else if (isExecutionsPage) refetchRepoForExecutions()
    else refetchRepoForTemplates()
  }, [isExecutionsPage, isPipelinePage, refetchRepoForExecutions, refetchRepoForPipelines, refetchRepoForTemplates])

  const repositories = useMemo(() => {
    if (isPipelinePage) return repoListOfPipelines?.data?.repositories
    else if (isExecutionsPage) return repoListOfExecutions?.data?.repositories
    return repoListOfTemplates?.data?.repositories
  }, [isExecutionsPage, isPipelinePage, repoListOfExecutions, repoListOfPipelines, repoListOfTemplates])

  const isLoading = useMemo((): boolean => {
    if (isPipelinePage) return loadingForPipelines
    else if (isExecutionsPage) return loadingForExecutions
    return loadingForTemplates
  }, [isExecutionsPage, isPipelinePage, loadingForExecutions, loadingForPipelines, loadingForTemplates])

  const error = useMemo(() => {
    if (isPipelinePage) return ErrorForPipelines
    else if (isExecutionsPage) return ErrorForExecutions
    return ErrorForTemplates
  }, [ErrorForExecutions, ErrorForPipelines, ErrorForTemplates, isExecutionsPage, isPipelinePage])

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
          disabled={isLoading || !isEmpty(error)}
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
