/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useCallback, useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Container, ExpandingSearchInput, ExpandingSearchInputHandle, Pagination } from '@harness/uicore'
import { defer } from 'lodash-es'
import {
  FeatureMetric,
  GetAllFeaturesQueryParams,
  GetFeatureMetricsQueryParams,
  useDeleteFeatureFlag,
  useGetAllFeatures,
  useGetFeatureMetrics
} from 'services/cf'
import { useStrings } from 'framework/strings'
import { useToggleFeatureFlag } from '@cf/hooks/useToggleFeatureFlag'
import ListingPageTemplate from '@cf/components/ListingPageTemplate/ListingPageTemplate'
import { useEnvironmentSelectV2 } from '@cf/hooks/useEnvironmentSelectV2'
import { CFEnvironmentSelect } from '@cf/components/CFEnvironmentSelect/CFEnvironmentSelect'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import { CF_DEFAULT_PAGE_SIZE } from '@cf/utils/CFUtils'
import FlagDialog from '@cf/components/CreateFlagDialog/FlagDialog'
import GitSyncActions from '@cf/components/GitSyncActions/GitSyncActions'
import { useGovernance } from '@cf/hooks/useGovernance'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { useQueryParamsState } from '@common/hooks/useQueryParamsState'
import { FeatureFlag } from '@common/featureFlags'
import { useFFGitSyncContext } from '@cf/contexts/ff-git-sync-context/FFGitSyncContext'
import type { FilterProps } from '@cf/components/TableFilters/TableFilters'
import routes from '@common/RouteDefinitions'
import { FlagTableFilters } from './components/FlagTableFilters'
import { NoFeatureFlags } from './components/NoFeatureFlags'
import AllEnvironmentsFlagsListing from './components/AllEnvironmentsFlagsListing'
import FeatureFlagsListing from './components/FeatureFlagsListing'
import css from './FeatureFlagsPage.module.scss'

const FeatureFlagsPage: React.FC = () => {
  const { projectIdentifier, orgIdentifier, accountId: accountIdentifier } = useParams<Record<string, string>>()
  const { activeEnvironment: environmentIdentifier, withActiveEnvironment } = useActiveEnvironment()
  const history = useHistory()
  const searchRef = React.useRef<ExpandingSearchInputHandle>({} as ExpandingSearchInputHandle)

  const [pageNumber, setPageNumber] = useQueryParamsState('page', 0)
  const [searchTerm, setSearchTerm] = useQueryParamsState('search', '')
  const [flagFilter, setFlagFilter] = useQueryParamsState<Optional<FilterProps>>('filter', {})

  const queryParams = useMemo<GetAllFeaturesQueryParams | GetFeatureMetricsQueryParams>(() => {
    return {
      projectIdentifier,
      environmentIdentifier,
      accountIdentifier,
      orgIdentifier,
      pageSize: CF_DEFAULT_PAGE_SIZE,
      pageNumber,
      metrics: false,
      flagCounts: true,
      name: searchTerm,
      summary: true,
      [flagFilter.queryProps?.key]: flagFilter.queryProps?.value
    }
  }, [
    projectIdentifier,
    environmentIdentifier,
    accountIdentifier,
    orgIdentifier,
    pageNumber,
    searchTerm,
    flagFilter.queryProps?.key,
    flagFilter.queryProps?.value
  ])

  const {
    data: features,
    loading: flagsLoading,
    error: flagsError,
    refetch: refetchFlags
  } = useGetAllFeatures({
    queryParams,
    lazy: true
  })

  const { data: featureMetrics, loading: featureMetricsLoading } = useGetFeatureMetrics({
    queryParams: {
      ...queryParams,
      environmentIdentifier: environmentIdentifier
    }
  })

  const {
    EnvironmentSelect,
    loading: envsLoading,
    error: envsError,
    refetch: refetchEnvironments,
    environments,
    projectFlags,
    refetchProjectFlags
  } = useEnvironmentSelectV2({
    selectedEnvironmentIdentifier: environmentIdentifier,
    allowAllOption: true,
    searchTerm
  })

  const toggleFeatureFlag = useToggleFeatureFlag({
    accountIdentifier,
    orgIdentifier,
    projectIdentifier,
    environmentIdentifier
  })

  const deleteFlag = useDeleteFeatureFlag({ queryParams })

  const { getString } = useStrings()

  const gitSync = useFFGitSyncContext()
  const governance = useGovernance()

  const loading = flagsLoading || envsLoading
  const gitSyncing = toggleFeatureFlag.loading || deleteFlag.loading
  const error = flagsError || envsError || deleteFlag.error || (toggleFeatureFlag.error && !governance.governanceError)

  const onSearchInputChanged = useCallback(
    name => {
      defer(() => setSearchTerm(name))
      defer(() => setPageNumber(0))
    },
    [setSearchTerm, setPageNumber]
  )

  useEffect(() => {
    if (projectFlags) {
      refetchProjectFlags()
    } else {
      refetchFlags()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParams])

  const emptyFeatureFlags = !features?.features?.length
  // use emptyFeatureFlags below as temp fallback to ensure FilterCards still display in case featureCounts is unavailable or flag STALE_FLAGS_FFM_1510 is toggled off on backend only
  const hasFeatureFlags = !!features?.featureCounts?.totalFeatures || !emptyFeatureFlags
  const title = getString('featureFlagsText')
  const FILTER_FEATURE_FLAGS = useFeatureFlag(FeatureFlag.STALE_FLAGS_FFM_1510)
  const showFilterCards = FILTER_FEATURE_FLAGS && hasFeatureFlags && environmentIdentifier

  const onClearFilter = (): void => {
    defer(() => setFlagFilter({}))
  }
  const onClearSearch = (): void => searchRef.current.clear()

  const onRowClick = useCallback(
    (flagId: string): void => {
      history.push(
        withActiveEnvironment(
          routes.toCFFeatureFlagsDetail({
            orgIdentifier: orgIdentifier as string,
            projectIdentifier: projectIdentifier as string,
            featureFlagIdentifier: flagId,
            accountId: accountIdentifier
          })
        )
      )
    },
    [withActiveEnvironment, orgIdentifier, projectIdentifier, accountIdentifier, history]
  )

  return (
    <ListingPageTemplate
      title={title}
      titleTooltipId="ff_ffListing_heading"
      headerContent={!!environments?.length && <CFEnvironmentSelect component={<EnvironmentSelect />} />}
      toolbar={
        hasFeatureFlags && (
          <>
            <div className={css.leftToolbar}>
              <FlagDialog environment={environmentIdentifier} />
              <GitSyncActions isLoading={gitSync.isGitSyncActionsEnabled && (gitSync.gitSyncLoading || gitSyncing)} />
            </div>
            <ExpandingSearchInput
              ref={searchRef}
              alwaysExpanded
              name="findFlag"
              placeholder={getString('search')}
              onChange={onSearchInputChanged}
              defaultValue={searchTerm}
            />
          </>
        )
      }
      pagination={
        !emptyFeatureFlags && (
          <Pagination
            itemCount={projectFlags ? projectFlags.itemCount : features?.itemCount || 0}
            pageSize={CF_DEFAULT_PAGE_SIZE}
            pageCount={projectFlags ? projectFlags.pageCount : features?.pageCount || 0}
            pageIndex={pageNumber}
            gotoPage={setPageNumber}
            showPagination
          />
        )
      }
      loading={loading}
      error={error}
      retryOnError={() => {
        setPageNumber(0)
        refetchEnvironments()
        refetchFlags()
      }}
    >
      {showFilterCards && !projectFlags && (
        <Container padding={{ top: 'medium', right: 'xlarge', left: 'xlarge' }}>
          <FlagTableFilters
            features={features}
            currentFilter={flagFilter}
            updateTableFilter={currentFilter => {
              defer(() => setPageNumber(0))
              defer(() => setFlagFilter(currentFilter))
            }}
          />
        </Container>
      )}
      {!emptyFeatureFlags || !!projectFlags?.flags?.length ? (
        <Container padding={{ top: 'medium', right: 'xlarge', left: 'xlarge' }}>
          {projectFlags && !!environments?.length ? (
            <AllEnvironmentsFlagsListing
              environments={environments}
              projectFlags={projectFlags}
              refetchFlags={refetchProjectFlags}
              deleteFlag={deleteFlag.mutate}
              queryParams={queryParams}
            />
          ) : (
            <FeatureFlagsListing
              features={features}
              featureMetrics={featureMetrics as FeatureMetric[]}
              featureMetricsLoading={featureMetricsLoading}
              refetchFlags={refetchFlags}
              toggleFeatureFlag={toggleFeatureFlag}
              deleteFlag={deleteFlag.mutate}
              queryParams={queryParams}
              numberOfEnvs={environments?.length}
              governance={governance}
              onRowClick={onRowClick}
            />
          )}
        </Container>
      ) : (
        <NoFeatureFlags
          hasFeatureFlags={hasFeatureFlags}
          hasSearchTerm={searchTerm.length > 0}
          hasFlagFilter={flagFilter.queryProps?.key?.length > 0 && flagFilter.queryProps?.value?.length > 0}
          environmentIdentifier={environmentIdentifier}
          clearFilter={onClearFilter}
          clearSearch={onClearSearch}
        />
      )}
    </ListingPageTemplate>
  )
}

export default FeatureFlagsPage
