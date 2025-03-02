/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color } from '@harness/design-system'
import {
  Button,
  ButtonVariation,
  ExpandingSearchInput,
  ExpandingSearchInputHandle,
  HarnessDocTooltip,
  Layout,
  SortDropdown,
  SortMethod,
  Text,
  useToggleOpen
} from '@harness/uicore'
import { defaultTo, isEmpty, pick } from 'lodash-es'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { flushSync } from 'react-dom'
import { GlobalFreezeBanner } from '@common/components/GlobalFreezeBanner/GlobalFreezeBanner'
import { useGlobalFreezeBanner } from '@common/components/GlobalFreezeBanner/useGlobalFreezeBanner'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { Page, useToaster } from '@common/exports'
import { useMutateAsGet, useQueryParams, useUpdateQueryParams } from '@common/hooks'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { ClonePipelineForm } from '@pipeline/components/ClonePipelineForm/ClonePipelineForm'
import { getModuleRunType } from '@pipeline/utils/runPipelineUtils'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { useStrings } from 'framework/strings'
import {
  FilterDTO,
  PMSPipelineSummaryResponse,
  useGetPipelineList,
  useGetRepositoryList,
  useSoftDeletePipeline
} from 'services/pipeline-ng'
import GitFilters, { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import RepoFilter from '@common/components/RepoFilter/RepoFilter'
import { DEFAULT_PAGE_INDEX } from '@pipeline/utils/constants'
import DeprecatedCallout from '@gitsync/components/DeprecatedCallout/DeprecatedCallout'
import { getFilterByIdentifier } from '@pipeline/utils/PipelineExecutionFilterRequestUtils'
import GetStartedWithCDButton from '@pipeline/components/GetStartedWithCDButton/GetStartedWithCDButton'
import { useGetFreeOrCommunityCD } from '@common/utils/utils'
import { CreatePipeline } from './CreatePipeline/CreatePipeline'
import { PipelineListTable } from './PipelineListTable/PipelineListTable'
import {
  getEmptyStateIllustration,
  usePipelineListSortOptions,
  usePipelinesQueryParamOptions
} from './PipelineListUtils'
import type {
  PipelineListPagePathParams,
  PipelineListPageQueryParams,
  ProcessedPipelineListPageQueryParams
} from './types'
import { PipelineListFilter } from './PipelineListFilter/PipelineListFilter'
import { getIsSavedFilterApplied } from '../execution-list/utils/executionListUtil'
import { prepareFiltersPayload } from '../utils/Filters/filters'
import css from './PipelineListPage.module.scss'

function _PipelineListPage(): React.ReactElement {
  const { getString } = useStrings()
  const searchRef = useRef({} as ExpandingSearchInputHandle)
  const [pipelineToClone, setPipelineToClone] = useState<PMSPipelineSummaryResponse>()
  const { getRBACErrorMessage } = useRBACError()
  const { showSuccess, showError } = useToaster()
  const { isGitSyncEnabled: isGitSyncEnabledForProject, gitSyncEnabledOnlyForFF } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const queryParamOptions = usePipelinesQueryParamOptions()
  const queryParams = useQueryParams<ProcessedPipelineListPageQueryParams>(queryParamOptions)
  const isFreeOrCommunityCD = useGetFreeOrCommunityCD()
  const { searchTerm, repoIdentifier, branch, page, size, repoName, filterIdentifier, filters } = queryParams
  const isSavedFilterApplied = getIsSavedFilterApplied(queryParams.filterIdentifier)
  const [filterList, setFilterList] = useState<FilterDTO[] | undefined>()

  const pathParams = useParams<PipelineListPagePathParams>()
  const { projectIdentifier, orgIdentifier, accountId, module } = pathParams
  const { updateQueryParams, replaceQueryParams } = useUpdateQueryParams<Partial<PipelineListPageQueryParams>>()
  const { preference: sortingPreference, setPreference: setSortingPreference } = usePreferenceStore<string | undefined>(
    PreferenceScope.USER,
    'PipelineSortingPreference'
  )
  const sort = useMemo(
    () => (sortingPreference ? JSON.parse(sortingPreference) : queryParams.sort),
    [queryParams.sort, sortingPreference]
  )
  const sortOptions = usePipelineListSortOptions()

  useDocumentTitle([getString('pipelines')])

  const clonePipelineModalToggle = useToggleOpen()
  const openClonePipelineModal = clonePipelineModalToggle.open

  const repoListQuery = useGetRepositoryList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: isGitSyncEnabled
  })
  const { globalFreezes } = useGlobalFreezeBanner()

  const requestBody = {
    filterType: 'PipelineSetup',
    ...(repoName && { repoName }),
    ...(!isSavedFilterApplied && queryParams.filters && prepareFiltersPayload(queryParams.filters)),
    ...(isSavedFilterApplied && getFilterByIdentifier(queryParams.filterIdentifier!, filterList)?.filterProperties)
  }

  const pipelinesQuery = useMutateAsGet(useGetPipelineList, {
    body: requestBody,
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      searchTerm,
      page,
      sort,
      size,
      ...(repoIdentifier &&
        branch && {
          repoIdentifier,
          branch
        })
    },
    queryParamStringifyOptions: { arrayFormat: 'comma' },
    requestOptions: {
      headers: {
        'content-type': 'application/json'
      }
    }
  })

  const pipelineListRefetchRef = useRef(pipelinesQuery.refetch)
  const memoizedPipelinesRefetch = useCallback(() => {
    pipelineListRefetchRef.current()
  }, [])

  useEffect(() => {
    pipelineListRefetchRef.current = pipelinesQuery.refetch
  }, [pipelinesQuery.refetch])

  const { mutate: deletePipeline, loading: isDeletingPipeline } = useSoftDeletePipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const onChangeRepo = (_repoName: string): void => {
    updateQueryParams({ repoName: (_repoName || []) as string })
  }

  const handleRepoChange = (filter: GitFilterScope): void => {
    updateQueryParams({
      repoIdentifier: filter.repo || undefined,
      branch: filter.branch || undefined,
      page: undefined
    })
  }

  const resetFilter = (): void => {
    flushSync(searchRef.current.clear)
    replaceQueryParams({})
  }

  const onClonePipeline = useCallback(
    (originalPipeline: PMSPipelineSummaryResponse): void => {
      setPipelineToClone(originalPipeline)
      openClonePipelineModal()
    },
    [openClonePipelineModal]
  )

  const onDeletePipeline = useCallback(
    async (commitMsg: string, pipeline: PMSPipelineSummaryResponse): Promise<void> => {
      try {
        const gitParams = pipeline.gitDetails?.objectId
          ? {
              ...pick(pipeline.gitDetails, ['branch', 'repoIdentifier', 'filePath', 'rootFolder']),
              commitMsg,
              lastObjectId: pipeline.gitDetails?.objectId
            }
          : {}

        const { status } = await deletePipeline(defaultTo(pipeline.identifier, ''), {
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            ...gitParams
          },
          headers: { 'content-type': 'application/json' }
        })

        if (status === 'SUCCESS') {
          showSuccess(getString('pipeline-list.pipelineDeleted', { name: pipeline.name }))
        } else {
          throw getString('somethingWentWrong')
        }
        pipelineListRefetchRef.current()
      } catch (err) {
        showError(getRBACErrorMessage(err), undefined, 'pipeline.delete.pipeline.error')
      }
    },
    [
      accountId,
      orgIdentifier,
      projectIdentifier,
      deletePipeline,
      getRBACErrorMessage,
      getString,
      showError,
      showSuccess
    ]
  )

  const hasFilter = !!(filterIdentifier || searchTerm || filters)

  return (
    <>
      <Page.Header
        title={
          <div className="ng-tooltip-native">
            <h2 data-tooltip-id="pipelinesPageHeading">{getString('pipelines')}</h2>
            <HarnessDocTooltip tooltipId="pipelinesPageHeading" useStandAlone={true} />
          </div>
        }
        breadcrumbs={<NGBreadcrumbs links={[]} />}
      />
      <Page.SubHeader className={css.subHeader}>
        <div className={css.subHeaderItems}>
          <CreatePipeline onSuccess={pipelinesQuery.refetch} />
          {isGitSyncEnabled ? (
            <GitFilters
              onChange={handleRepoChange}
              className={css.gitFilter}
              defaultValue={{
                repo: repoIdentifier,
                branch
              }}
            />
          ) : (
            <RepoFilter
              onChange={onChangeRepo}
              value={repoName}
              repositories={repoListQuery.data?.data?.repositories}
              isError={!isEmpty(repoListQuery.error)}
              isLoadingRepos={repoListQuery.loading}
              onRefetch={repoListQuery.refetch}
            />
          )}
          <div className={css.flexExpand} />

          <ExpandingSearchInput
            alwaysExpanded
            width={200}
            placeholder={getString('search')}
            onChange={text => {
              updateQueryParams(text ? { searchTerm: text, page: DEFAULT_PAGE_INDEX } : { searchTerm: undefined })
            }}
            defaultValue={searchTerm}
            ref={searchRef}
          />
          <PipelineListFilter onFilterListUpdate={setFilterList} />
        </div>
      </Page.SubHeader>

      <GlobalFreezeBanner globalFreezes={globalFreezes} />

      <Page.Body
        className={css.pageBody}
        loading={pipelinesQuery.loading || isDeletingPipeline}
        error={pipelinesQuery.error?.message}
        retryOnError={pipelinesQuery.refetch}
        noData={{
          when: () => !pipelinesQuery.data?.data?.content?.length,
          image: getEmptyStateIllustration(hasFilter, module),
          messageTitle: hasFilter
            ? getString('common.filters.noResultsFound')
            : getString('pipeline.noPipelinesLabel', { moduleRunType: getModuleRunType(module) }),
          message: hasFilter
            ? getString('common.filters.noMatchingFilterData')
            : getString('pipeline-list.aboutPipeline'),
          button: hasFilter ? (
            <Button
              text={getString('common.filters.clearFilters')}
              variation={ButtonVariation.LINK}
              onClick={resetFilter}
            />
          ) : (
            <Layout.Vertical flex={{ alignItems: 'center' }}>
              {isFreeOrCommunityCD && <GetStartedWithCDButton />}
              <CreatePipeline
                onSuccess={pipelinesQuery.refetch}
                {...(isFreeOrCommunityCD && { variation: ButtonVariation.LINK })}
              />
            </Layout.Vertical>
          )
        }}
      >
        {pipelinesQuery.data?.data && (
          <>
            <div className={css.tableTitle}>
              <Text color={Color.GREY_800} font={{ weight: 'bold' }}>
                {`${getString('total')}: ${pipelinesQuery.data?.data?.totalElements}`}
              </Text>
              <Layout.Horizontal spacing={'small'}>
                <SortDropdown
                  onSortMethodChange={option => {
                    const sortArray = (option.value as SortMethod)?.split(',')

                    if (!Array.isArray(sortArray)) return

                    setSortingPreference(JSON.stringify(sortArray))
                    updateQueryParams({ sort: sortArray })
                  }}
                  selectedSortMethod={sort?.toString()}
                  sortOptions={sortOptions}
                />
                <Button
                  intent="primary"
                  icon="refresh"
                  onClick={() => pipelinesQuery.refetch()} // don't use pipelinesQuery.refetch directly, that causes passing click event as refetch props causing issues
                  minimal
                  tooltipProps={{ isDark: true }}
                  tooltip={getString('common.refresh')}
                />
              </Layout.Horizontal>
            </div>
            <PipelineListTable
              gotoPage={pageNumber => updateQueryParams({ page: pageNumber })}
              onPageSizeChange={newSize => updateQueryParams({ size: newSize, page: 0 })}
              data={pipelinesQuery.data.data}
              onDeletePipeline={onDeletePipeline}
              onClonePipeline={onClonePipeline}
              refetchList={memoizedPipelinesRefetch}
              setSortBy={sortArray => {
                setSortingPreference(JSON.stringify(sortArray))
                updateQueryParams({ sort: sortArray })
              }}
              sortBy={sort}
            />
            {pipelineToClone && (
              <ClonePipelineForm
                isOpen={clonePipelineModalToggle.isOpen}
                onClose={clonePipelineModalToggle.close}
                originalPipeline={pipelineToClone}
              />
            )}
          </>
        )}
      </Page.Body>
    </>
  )
}

export function PipelineListPage(): React.ReactElement {
  const { isGitSyncEnabled: isGitSyncEnabledForProject, gitSyncEnabledOnlyForFF } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF

  if (isGitSyncEnabled) {
    return (
      <GitSyncStoreProvider>
        <DeprecatedCallout />
        <_PipelineListPage />
      </GitSyncStoreProvider>
    )
  }

  return <_PipelineListPage />
}
