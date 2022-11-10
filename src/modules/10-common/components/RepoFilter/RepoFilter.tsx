/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
import React from 'react'
import { Color, Container, DropDown, Icon, Layout, SelectOption } from '@harness/uicore'
import { defaultTo, isEmpty } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { UseGetReturn } from 'restful-react'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { Failure, GetRepositoryListQueryParams, UseGetRepositoryListProps } from 'services/pipeline-ng'
import css from './RepoFilter.module.scss'

export interface RepoFilterProps {
  value?: string
  onChange?: (repoName: string) => void
  className?: string
  getRepoListPromise: (
    props: UseGetRepositoryListProps
  ) => UseGetReturn<any, Failure | Error, GetRepositoryListQueryParams, unknown>
}

export function RepoFilter({ value, onChange, className, getRepoListPromise }: RepoFilterProps) {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()

  const {
    data: repoListData,
    error,
    loading,
    refetch
  } = getRepoListPromise({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier
    }
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

  if (loading) {
    return null
  }

  return (
    <Container css={className}>
      <Layout.Horizontal spacing="xsmall">
        <DropDown
          items={dropDownItems}
          disabled={!isEmpty(error)}
          buttonTestId={'repo-filter'}
          value={value}
          onChange={selected => onChange?.(selected.value.toString())}
          placeholder={getString('repository')}
          addClearBtn={true}
          minWidth={160}
          usePortal={true}
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
      </Layout.Horizontal>
    </Container>
  )
}

export default RepoFilter
