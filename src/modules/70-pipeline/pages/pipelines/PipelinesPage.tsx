/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color } from '@harness/design-system'
import { HarnessDocTooltip, Layout, PageSpinner, shouldShowError, Text } from '@wings-software/uicore'
import { defaultTo, pick } from 'lodash-es'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import GitFilters, { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import type { StoreType } from '@common/constants/GitSyncTypes'
import { NavigatedToPage } from '@common/constants/TrackingConstants'
import { Page, useToaster } from '@common/exports'
import { useQueryParams, useUpdateQueryParams } from '@common/hooks'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { ResourceType } from '@common/interfaces/GitSyncInterface'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
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
  useSoftDeletePipeline
} from 'services/pipeline-ng'
import PipelineListEmpty from './PipelineListEmpty'
import PipelineListFilter from './PipelineListFilter'
import type { QueryParams, StringQueryParams } from './types'
import { PipelineListView } from './views/PipelineListView'
import css from './PipelinesPage.module.scss'

export enum Sort {
  DESC = 'DESC',
  ASC = 'ASC'
}

export enum SortFields {
  LastUpdatedAt = 'lastUpdatedAt',
  RecentActivity = 'executionSummaryInfo.lastExecutionTs',
  AZ09 = 'AZ09',
  ZA90 = 'ZA90',
  Name = 'name'
}

const defaultPageNumber = 0
const defaultSizeNumber = 20

function getPathProps(
  pathParams: PipelineType<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>,
  pipeline: PMSPipelineSummaryResponse
) {
  return {
    projectIdentifier: pathParams.projectIdentifier,
    orgIdentifier: pathParams.orgIdentifier,
    accountId: pathParams.accountId,
    module: pathParams.module,
    pipelineIdentifier: pipeline.identifier || '-1',
    branch: pipeline.gitDetails?.branch,
    repoIdentifier: pipeline.gitDetails?.repoIdentifier,
    repoName: pipeline.gitDetails?.repoName,
    connectorRef: pipeline.connectorRef,
    storeType: pipeline.storeType as StoreType
  }
}

function PipelinesPage(): React.ReactElement {
  const { getString } = useStrings()
  const [pipelineList, setPipelineList] = useState<PagePMSPipelineSummaryResponse | undefined>()
  const [appliedFilter, setAppliedFilter] = useState<FilterDTO | undefined>() // one of the stored filters
  const { trackEvent } = useTelemetry()
  const history = useHistory()
  const { getRBACErrorMessage } = useRBACError()
  const { showSuccess, showError } = useToaster()
  const { isGitSyncEnabled } = useAppStore()
  const [pipelineToDelete, setPipelineToDelete] = useState<PMSPipelineSummaryResponse>()
  const defaultSort = useMemo(() => [SortFields.LastUpdatedAt, Sort.DESC], [])
  const queryParams = useQueryParams<QueryParams>({
    processQueryParams(params: StringQueryParams) {
      return {
        ...params,
        page: params.page || defaultPageNumber,
        size: params.size || defaultSizeNumber,
        filters: params.filters ? JSON.parse(params.filters) : undefined
      } as QueryParams
    }
  })
  const { searchTerm, repoIdentifier, branch: repoBranch, getDefaultFromOtherRepo, page, sort, size } = queryParams

  const pathParams = useParams<
    PipelineType<{
      projectIdentifier: string
      orgIdentifier: string
      accountId: string
    }>
  >()

  const { projectIdentifier, orgIdentifier, accountId, module } = pathParams
  const { updateQueryParams, replaceQueryParams } = useUpdateQueryParams<StringQueryParams>()

  const handleRepoChange = (filter: GitFilterScope) => {
    updateQueryParams({
      repoIdentifier: filter.repo || undefined,
      branch: filter.branch || undefined,
      getDefaultFromOtherRepo: filter.getDefaultFromOtherRepo || (undefined as any),
      page: undefined
    })
  }

  const goToPipelineDetail = useCallback(
    (pipeline?: PMSPipelineSummaryResponse) => {
      if (pipeline) history.push(routes.toPipelineDeploymentList(getPathProps(pathParams, pipeline)))
    },
    [history, pathParams]
  )

  const goToPipeline = useCallback(
    (pipeline?: PMSPipelineSummaryResponse) => {
      if (pipeline) history.push(routes.toPipelineStudio(getPathProps(pathParams, pipeline)))
    },
    [history, pathParams]
  )

  const gitFilter: GitFilterScope = {
    repo: repoIdentifier || '',
    branch: repoBranch,
    getDefaultFromOtherRepo: getDefaultFromOtherRepo
  }

  const {
    mutate: loadPipelineList,
    error: pipelineListLoadingError,
    loading: isPipelineListLoading
  } = useGetPipelineList({
    queryParamStringifyOptions: { arrayFormat: 'comma' }
  })

  const { mutate: deletePipeline, loading: isDeletingPipeline } = useSoftDeletePipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const onImportSuccess = (): void => {
    fetchPipelines()
  }

  const { showImportResourceModal } = useImportResource({
    resourceType: ResourceType.PIPELINES,
    modalTitle: getString('common.importEntityFromGit', { resourceType: getString('common.pipeline') }),
    onSuccess: onImportSuccess
  })

  const fetchPipelines = useCallback(async () => {
    try {
      const filter: PipelineFilterProperties = {
        filterType: 'PipelineSetup',
        ...appliedFilter?.filterProperties
      }
      const { status, data } = await loadPipelineList(filter, {
        queryParams: {
          accountIdentifier: accountId,
          projectIdentifier,
          orgIdentifier,
          searchTerm,
          page,
          sort: sort?.split(',') || defaultSort,
          size,
          ...(gitFilter?.repo &&
            gitFilter.branch && {
              repoIdentifier: gitFilter.repo,
              branch: gitFilter.branch
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
  }, [
    accountId,
    appliedFilter?.filterProperties,
    defaultSort,
    gitFilter.branch,
    gitFilter.repo,
    module,
    orgIdentifier,
    page,
    projectIdentifier,
    searchTerm,
    size,
    sort
  ])

  useDocumentTitle([getString('pipelines')])

  const resetFilter = (): void => {
    setAppliedFilter(undefined)
    replaceQueryParams({})
  }

  useEffect(() => {
    fetchPipelines()
  }, [fetchPipelines])

  useEffect(() => {
    trackEvent(NavigatedToPage.PipelinesPage, {})
  }, [])

  const onDeletePipeline = async (commitMsg: string): Promise<void> => {
    try {
      const gitParams = pipelineToDelete?.gitDetails?.objectId
        ? {
            ...pick(pipelineToDelete?.gitDetails, ['branch', 'repoIdentifier', 'filePath', 'rootFolder']),
            commitMsg,
            lastObjectId: pipelineToDelete?.gitDetails?.objectId
          }
        : {}

      const { status } = await deletePipeline(defaultTo(pipelineToDelete?.identifier, ''), {
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          ...gitParams
        }
      })

      if (status === 'SUCCESS') {
        showSuccess(getString('pipeline-list.pipelineDeleted', { name: pipelineToDelete?.name }))
      } else {
        throw getString('somethingWentWrong')
      }
      fetchPipelines()
    } catch (err) {
      showError(getRBACErrorMessage(err), undefined, 'pipeline.delete.pipeline.error')
    }
  }

  const hasAppliedFilters = queryParams.filterIdentifier || queryParams.filters

  const createPipeline = (
    <CreatePipelineButton
      label={getString('common.createPipeline')}
      onCreatePipelineClick={() => goToPipeline()}
      onImportPipelineClick={showImportResourceModal}
    />
  )

  return (
    <GitSyncStoreProvider>
      <Page.Header
        title={
          <div className="ng-tooltip-native">
            <h2 data-tooltip-id="pipelinesPageHeading"> {getString('pipelines')}</h2>
            <HarnessDocTooltip tooltipId="pipelinesPageHeading" useStandAlone={true} />
          </div>
        }
        breadcrumbs={<NGBreadcrumbs links={[]} />}
      />
      {(pipelineList?.content?.length || hasAppliedFilters) && (
        <Page.SubHeader>
          <Layout.Horizontal>
            {createPipeline}
            {isGitSyncEnabled && (
              <GitFilters
                onChange={filter => {
                  handleRepoChange(filter)
                }}
                className={css.gitFilter}
                defaultValue={gitFilter || undefined}
              />
            )}
          </Layout.Horizontal>
          <PipelineListFilter
            queryParams={queryParams}
            setAppliedFilter={setAppliedFilter}
            appliedFilter={appliedFilter}
          />
        </Page.SubHeader>
      )}
      <Page.Body
        className={css.pageBody}
        error={pipelineListLoadingError?.message}
        retryOnError={() => fetchPipelines()}
      >
        {isPipelineListLoading || isDeletingPipeline ? (
          <PageSpinner />
        ) : pipelineList?.content?.length ? (
          <>
            <Text color={Color.GREY_800} iconProps={{ size: 14 }} padding="large">
              {getString('total')}: {pipelineList?.totalElements}
            </Text>
            <PipelineListView
              gotoPage={pageNumber => updateQueryParams({ page: pageNumber.toString() })}
              data={pipelineList}
              goToPipelineDetail={goToPipelineDetail}
              goToPipelineStudio={goToPipeline}
              refetchPipeline={fetchPipelines}
              onDelete={(pipeline: PMSPipelineSummaryResponse) => {
                setPipelineToDelete(pipeline)
              }}
              onDeletePipeline={onDeletePipeline}
            />
          </>
        ) : (
          <PipelineListEmpty
            hasFilter={!!(appliedFilter || searchTerm)}
            resetFilter={resetFilter}
            createPipeline={createPipeline}
          />
        )}
      </Page.Body>
    </GitSyncStoreProvider>
  )
}

export default PipelinesPage
