/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color } from '@harness/design-system'
import {
  Button,
  ExpandingSearchInput,
  ExpandingSearchInputHandle,
  HarnessDocTooltip,
  Layout,
  PageSpinner,
  shouldShowError,
  Text,
  useToggleOpen
} from '@harness/uicore'
import { defaultTo, isEmpty, pick } from 'lodash-es'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import GitFilters, { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { Page, useToaster } from '@common/exports'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { ResourceType } from '@common/interfaces/GitSyncInterface'
import routes from '@common/RouteDefinitions'
import CreatePipelineButton from '@pipeline/components/CreatePipelineButton/CreatePipelineButton'
import useImportResource from '@pipeline/components/ImportResource/useImportResource'
import useRBACError from '@rbac/utils/useRBACError/useRBACError'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { useStrings } from 'framework/strings'
import {
  FilterDTO,
  PagePMSPipelineSummaryResponse,
  PipelineFilterProperties,
  PMSPipelineSummaryResponse,
  useGetPipelineList,
  useGetRepositoryList,
  useSoftDeletePipeline
} from 'services/pipeline-ng'
import { DEFAULT_PIPELINE_LIST_TABLE_SORT, DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from '@pipeline/utils/constants'
import { queryParamDecodeAll } from '@common/hooks/useQueryParams'
import type { PartiallyRequired } from '@pipeline/utils/types'
import { ClonePipelineForm } from '@pipeline/components/ClonePipelineForm/ClonePipelineForm'
import { PreferenceScope, usePreferenceStore } from 'framework/PreferenceStore/PreferenceStoreContext'
import { GlobalFreezeBanner } from '@common/components/GlobalFreezeBanner/GlobalFreezeBanner'

import { useGlobalFreezeBanner } from '@common/components/GlobalFreezeBanner/useGlobalFreezeBanner'
import { RepoFilter } from '@common/components/RepoFilter/RepoFilter'
import { PipelineListEmpty } from './PipelineListEmpty/PipelineListEmpty'
import { PipelineListFilter } from './PipelineListFilter/PipelineListFilter'
import { PipelineListTable } from './PipelineListTable/PipelineListTable'
import { getRouteProps } from './PipelineListUtils'
import type { PipelineListPagePathParams, PipelineListPageQueryParams } from './types'
import css from './PipelineListPage.module.scss'

type ProcessedPipelineListPageQueryParams = PartiallyRequired<PipelineListPageQueryParams, 'page' | 'size' | 'sort'>
const queryParamOptions = {
  parseArrays: true,
  decoder: queryParamDecodeAll(),
  processQueryParams(params: PipelineListPageQueryParams): ProcessedPipelineListPageQueryParams {
    return {
      ...params,
      page: params.page ?? DEFAULT_PAGE_INDEX,
      size: params.size ?? DEFAULT_PAGE_SIZE,
      sort: params.sort ?? DEFAULT_PIPELINE_LIST_TABLE_SORT
    }
  }
}

function PipelineListView(): React.ReactElement {
  const { getString } = useStrings()
  const searchRef = useRef({} as ExpandingSearchInputHandle)
  const [pipelineList, setPipelineList] = useState<PagePMSPipelineSummaryResponse | undefined>()
  const [appliedFilter, setAppliedFilter] = useState<FilterDTO | undefined>() // selected filter
  const history = useHistory()
  const { getRBACErrorMessage } = useRBACError()
  const { showSuccess, showError } = useToaster()
  const { isGitSyncEnabled: isGitSyncEnabledForProject, gitSyncEnabledOnlyForFF } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const [pipelineToClone, setPipelineToClone] = useState<PMSPipelineSummaryResponse>()

  const {
    open: openClonePipelineModal,
    isOpen: isClonePipelineModalOpen,
    close: closeClonePipelineModal
  } = useToggleOpen()

  const queryParams = useQueryParams<ProcessedPipelineListPageQueryParams>(queryParamOptions)
  const { searchTerm, repoIdentifier, branch, page, size, repoName } = queryParams
  const pathParams = useParams<PipelineListPagePathParams>()
  const { projectIdentifier, orgIdentifier, accountId } = pathParams
  const { updateQueryParams, replaceQueryParams } = useUpdateQueryParams<Partial<PipelineListPageQueryParams>>()
  const { preference: sortingPreference, setPreference: setSortingPreference } = usePreferenceStore<string | undefined>(
    PreferenceScope.USER,
    'PipelineSortingPreference'
  )

  const sort = sortingPreference ? JSON.parse(sortingPreference) : queryParams.sort

  const handleRepoChange = (filter: GitFilterScope): void => {
    updateQueryParams({
      repoIdentifier: filter.repo || undefined,
      branch: filter.branch || undefined,
      page: undefined
    })
  }

  const goToPipelineStudio = (pipeline?: PMSPipelineSummaryResponse): void =>
    history.push(routes.toPipelineStudio(getRouteProps(pathParams, pipeline)))

  const {
    mutate: loadPipelineList,
    error: pipelineListLoadingError,
    loading: isPipelineListLoading
  } = useGetPipelineList({
    queryParamStringifyOptions: { arrayFormat: 'comma' }
  })

  const onChangeRepo = (_repoName: string): void => {
    updateQueryParams({ repoName: (_repoName || []) as string })
  }

  const { mutate: deletePipeline, loading: isDeletingPipeline } = useSoftDeletePipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const { showImportResourceModal } = useImportResource({
    resourceType: ResourceType.PIPELINES,
    modalTitle: getString('common.importEntityFromGit', { resourceType: getString('common.pipeline') }),
    onSuccess: () => fetchPipelines()
  })

  const fetchPipelines = useCallback(async () => {
    try {
      const filter: PipelineFilterProperties = {
        filterType: 'PipelineSetup',
        repoName,
        ...appliedFilter?.filterProperties
      }
      const { status, data } = await loadPipelineList(filter, {
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
        }
      })
      if (status === 'SUCCESS') {
        setPipelineList(data)
      }
    } catch (e) {
      if (shouldShowError(e)) {
        showError(getRBACErrorMessage(e), undefined, 'pipeline.fetch.pipeline.error')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    repoName,
    appliedFilter?.filterProperties,
    loadPipelineList,
    accountId,
    projectIdentifier,
    orgIdentifier,
    searchTerm,
    page,
    sort,
    size,
    repoIdentifier,
    branch
  ])
  const {
    data: repoListData,
    error,
    loading,
    refetch
  } = useGetRepositoryList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: isGitSyncEnabled
  })

  const repositories = repoListData?.data?.repositories

  const onRefetch = React.useCallback((): void => {
    refetch()
  }, [refetch])

  useDocumentTitle([getString('pipelines')])

  const resetFilter = (): void => {
    searchRef.current.clear()
    setAppliedFilter(undefined)
    replaceQueryParams({})
  }

  useEffect(() => {
    fetchPipelines()
  }, [fetchPipelines])

  const onClonePipeline = (originalPipeline: PMSPipelineSummaryResponse): void => {
    setPipelineToClone(originalPipeline)
    openClonePipelineModal()
  }

  const onDeletePipeline = async (commitMsg: string, pipeline: PMSPipelineSummaryResponse): Promise<void> => {
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
      fetchPipelines()
    } catch (err) {
      showError(getRBACErrorMessage(err), undefined, 'pipeline.delete.pipeline.error')
    }
  }

  const createPipelineButton = (
    <CreatePipelineButton
      label={getString('common.createPipeline')}
      onCreatePipelineClick={() => goToPipelineStudio({ identifier: '-1' })}
      onImportPipelineClick={showImportResourceModal}
    />
  )

  const { globalFreezes } = useGlobalFreezeBanner()

  return (
    <>
      <Page.Header
        title={
          <div className="ng-tooltip-native">
            <h2 data-tooltip-id="pipelinesPageHeading"> {getString('pipelines')}</h2>
            <HarnessDocTooltip tooltipId="pipelinesPageHeading" useStandAlone={true} />
          </div>
        }
        breadcrumbs={<NGBreadcrumbs links={[]} />}
      />
      <Page.SubHeader className={css.subHeader}>
        <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
          {createPipelineButton}
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
              repositories={repositories}
              isError={!isEmpty(error)}
              isLoadingRepos={loading}
              onRefetch={onRefetch}
            />
          )}
        </Layout.Horizontal>
        <Layout.Horizontal style={{ alignItems: 'center' }}>
          <ExpandingSearchInput
            alwaysExpanded
            width={200}
            placeholder={getString('search')}
            onChange={text => {
              updateQueryParams(text ? { searchTerm: text, page: DEFAULT_PAGE_INDEX } : { searchTerm: undefined })
            }}
            defaultValue={searchTerm}
            ref={searchRef}
            className={css.expandSearch}
          />
          <PipelineListFilter
            queryParams={queryParams}
            setAppliedFilter={setAppliedFilter}
            appliedFilter={appliedFilter}
          />
        </Layout.Horizontal>
      </Page.SubHeader>
      <GlobalFreezeBanner globalFreezes={globalFreezes} />
      <Page.Body
        className={css.pageBody}
        error={pipelineListLoadingError?.message}
        retryOnError={() => fetchPipelines()}
      >
        {isPipelineListLoading || isDeletingPipeline ? (
          <PageSpinner />
        ) : pipelineList?.content?.length ? (
          <>
            <div className={css.tableTitle}>
              <Text color={Color.GREY_800} font={{ weight: 'bold' }}>
                {`${getString('total')}: ${pipelineList?.totalElements}`}
              </Text>
              <Button
                intent="primary"
                icon="refresh"
                onClick={() => fetchPipelines()}
                minimal
                tooltipProps={{ isDark: true }}
                tooltip={getString('common.refresh')}
              />
            </div>
            <PipelineListTable
              gotoPage={pageNumber => updateQueryParams({ page: pageNumber })}
              data={pipelineList}
              onDeletePipeline={onDeletePipeline}
              onClonePipeline={onClonePipeline}
              setSortBy={sortArray => {
                setSortingPreference(JSON.stringify(sortArray))
                updateQueryParams({ sort: sortArray })
              }}
              sortBy={sort}
            />
            {pipelineToClone && (
              <ClonePipelineForm
                isOpen={isClonePipelineModalOpen}
                onClose={closeClonePipelineModal}
                originalPipeline={pipelineToClone}
              />
            )}
          </>
        ) : (
          <PipelineListEmpty
            hasFilter={!!(appliedFilter || searchTerm)}
            resetFilter={resetFilter}
            createPipeline={createPipelineButton}
          />
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
        <PipelineListView />
      </GitSyncStoreProvider>
    )
  }
  return <PipelineListView />
}
