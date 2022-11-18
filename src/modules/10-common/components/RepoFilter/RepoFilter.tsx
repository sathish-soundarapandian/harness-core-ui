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
    data: repoListOfPipeline,
    error: errorForPipeline,
    loading: loadingForPipeline,
    refetch: refetchRepoForPipeline
  } = useGetRepositoryList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: !isPipelinePage
  })

  const {
    data: repoListOfExecutions,
    error: errorForExecution,
    loading: loadingForExecutions,
    refetch: refetchRepoForExecutions
  } = useGetExecutionRepositoriesList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: !isExecutionsPage
  })

  const {
    data: repoListOfTemplate,
    error: errorForTemplate,
    loading: loadingForTemplate,
    refetch: refetchRepoForTemplate
  } = getRepoListForTemplate({
    queryParams: queryParamsForTemplate,
    lazy: !isTemplatesPage
  })

  const onRefetch = React.useCallback((): void => {
    if (isPipelinePage) refetchRepoForPipeline()
    else if (isExecutionsPage) refetchRepoForExecutions()
    else refetchRepoForTemplate()
  }, [isExecutionsPage, isPipelinePage, refetchRepoForExecutions, refetchRepoForPipeline, refetchRepoForTemplate])

  const repositories = useMemo(() => {
    if (isPipelinePage) return repoListOfPipeline?.data?.repositories
    else if (isExecutionsPage) return repoListOfExecutions?.data?.repositories
    return repoListOfTemplate?.data?.repositories
  }, [isExecutionsPage, isPipelinePage, repoListOfExecutions, repoListOfPipeline, repoListOfTemplate])

  const isLoading = useMemo((): boolean => {
    if (isPipelinePage) return loadingForPipeline
    else if (isExecutionsPage) return loadingForExecutions
    return loadingForTemplate
  }, [isExecutionsPage, isPipelinePage, loadingForExecutions, loadingForPipeline, loadingForTemplate])

  const error = useMemo(() => {
    if (isPipelinePage) return errorForPipeline
    else if (isExecutionsPage) return errorForExecution
    return errorForTemplate
  }, [errorForExecution, errorForPipeline, errorForTemplate, isExecutionsPage, isPipelinePage])

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
