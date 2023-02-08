/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef } from 'react'
import { Container, ExpandingSearchInput, ExpandingSearchInputHandle, Icon, PageError, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import { useStrings } from 'framework/strings'
import { useMutateAsGet, useUpdateQueryParams } from '@common/hooks'
import { GetListOfExecutionsQueryParams, PipelineExecutionSummary, useGetListOfExecutions } from 'services/pipeline-ng'
import type { PipelinePathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { MemoisedExecutionListTable } from '@pipeline/pages/execution-list/ExecutionListTable/ExecutionListTable'
import { useModuleInfo } from '@common/hooks/useModuleInfo'
import { usePolling } from '@common/hooks/usePolling'
import { ExecutionCompiledYaml } from '@pipeline/components/ExecutionCompiledYaml/ExecutionCompiledYaml'
import { DEFAULT_PAGE_INDEX } from '@pipeline/utils/constants'
import {
  ExecutionCompareProvider,
  useExecutionCompareContext
} from '@pipeline/components/ExecutionCompareYaml/ExecutionCompareContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { useExecutionListQueryParams } from '@pipeline/pages/execution-list/utils/executionListUtil'
import { ExecutionCompareYamlHeader } from '@pipeline/components/ExecutionCompareYaml/ExecutionCompareYamlHeader'
import { Width } from '@common/constants/Utils'
import { ExecutionListEmptyWithoutCta } from '@pipeline/pages/execution-list/ExecutionListEmpty/ExecutionListEmpty'
import css from './EnvironmentDetailSummary.module.scss'

interface EnvironmentDetailExecutionListProps {
  environmentIdentifiers: string
  serviceIdentifiers: string | undefined
}

function EnvironmentDetailExecutionListInternal(props: EnvironmentDetailExecutionListProps): JSX.Element {
  const { environmentIdentifiers, serviceIdentifiers } = props
  const { getString } = useStrings()
  const searchRef = useRef({} as ExpandingSearchInputHandle)
  const { replaceQueryParams, updateQueryParams } = useUpdateQueryParams<Partial<GetListOfExecutionsQueryParams>>()
  const { module } = useModuleInfo()
  const { isCompareMode } = useExecutionCompareContext()
  const { orgIdentifier, projectIdentifier, accountId } = useParams<PipelineType<PipelinePathProps>>()
  const queryParams = useExecutionListQueryParams()
  const { page, size, sort, myDeployments, status, repoIdentifier, searchTerm, repoName } = queryParams

  const resetFilter = /* istanbul ignore next */ (): void => {
    searchRef.current.clear()
    replaceQueryParams({})
  }

  const executionListFilter = {
    moduleProperties: {
      cd: {
        envIdentifiers: environmentIdentifiers,
        serviceIdentifiers: serviceIdentifiers && serviceIdentifiers.length ? serviceIdentifiers : undefined
      }
    }
  }
  const [viewCompiledYaml, setViewCompiledYaml] = React.useState<PipelineExecutionSummary | undefined>(undefined)

  const {
    data,
    loading,
    initLoading,
    refetch: fetchExecutions,
    error
  } = useMutateAsGet(useGetListOfExecutions, {
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      page,
      size,
      sort: sort.join(','),
      myDeployments,
      status,
      repoName,
      repoIdentifier,
      searchTerm,
      module
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    },
    body: {
      ...executionListFilter,
      filterType: 'PipelineExecution'
    }
  })
  // Only do polling on first page and not initial default loading
  const isPolling = usePolling(fetchExecutions, {
    startPolling: page === DEFAULT_PAGE_INDEX && !loading,
    pollingInterval: 5_000
  })

  const executionList = data?.data
  const hasExecutions = executionList?.totalElements && executionList?.totalElements > 0
  const showSpinner = initLoading || (loading && !isPolling)

  const changeQueryParam = /* istanbul ignore next */ <T extends keyof GetListOfExecutionsQueryParams>(
    key: T,
    value: GetListOfExecutionsQueryParams[T]
  ): void => {
    if (value) {
      updateQueryParams({ [key]: value, page: DEFAULT_PAGE_INDEX })
    } else {
      updateQueryParams({ [key]: undefined })
    }
  }

  return (
    <div>
      {isCompareMode && <ExecutionCompareYamlHeader />}
      <div className={css.titleStyle}>
        <Text color={Color.GREY_800} font={{ weight: 'bold' }}>
          {`${getString('pipeline.dashboards.totalExecutions')}: ${defaultTo(data?.data?.totalElements, 0)} `}
        </Text>
        <ExpandingSearchInput
          defaultValue={queryParams.searchTerm}
          alwaysExpanded
          onChange={value => changeQueryParam('searchTerm', value)}
          width={Width.LARGE}
          ref={searchRef}
        />
      </div>
      {showSpinner ? (
        <Container className={css.loadingContainer}>
          <Icon name="spinner" color={Color.BLUE_500} size={30} />
        </Container>
      ) : error ? (
        <Container data-test="EnvironmentDetailExecutionListError" height="350px" flex={{ justifyContent: 'center' }}>
          <PageError onClick={() => fetchExecutions()} />
        </Container>
      ) : executionList && hasExecutions ? (
        <MemoisedExecutionListTable executionList={executionList} onViewCompiledYaml={setViewCompiledYaml} />
      ) : (
        <ExecutionListEmptyWithoutCta resetFilter={resetFilter} />
      )}

      <ExecutionCompiledYaml onClose={() => setViewCompiledYaml(undefined)} executionSummary={viewCompiledYaml} />
    </div>
  )
}

export function EnvironmentDetailExecutionList(props: EnvironmentDetailExecutionListProps): React.ReactElement {
  return (
    <GitSyncStoreProvider>
      <ExecutionCompareProvider>
        <EnvironmentDetailExecutionListInternal {...props} />
      </ExecutionCompareProvider>
    </GitSyncStoreProvider>
  )
}
