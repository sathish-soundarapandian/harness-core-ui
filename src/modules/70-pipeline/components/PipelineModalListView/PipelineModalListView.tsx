/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'

import { Button, Text, Container, ExpandingSearchInput, Layout } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { Color } from '@harness/design-system'
import {
  PagePMSPipelineSummaryResponse,
  ResponsePagePMSPipelineSummaryResponse,
  useGetPipelineList
} from 'services/pipeline-ng'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import type { UseGetMockData } from '@common/utils/testUtils'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import GitFilters, { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import RunPipelineListView from './RunPipelineListView'
import css from './PipelineModalListView.module.scss'

interface PipelineModalListViewProps {
  onClose: () => void
  mockData?: UseGetMockData<ResponsePagePMSPipelineSummaryResponse>
}

export default function PipelineModalListView({ onClose, mockData }: PipelineModalListViewProps): React.ReactElement {
  const [page, setPage] = useState(0)
  const [searchParam, setSearchParam] = React.useState('')
  const { getString } = useStrings()
  const { isGitSyncEnabled: isGitSyncEnabledForProject, gitSyncEnabledOnlyForFF } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const [gitFilter, setGitFilter] = useState<GitFilterScope | null>(null)

  const { projectIdentifier, orgIdentifier, accountId, module } = useParams<
    PipelineType<{
      projectIdentifier: string
      orgIdentifier: string
      accountId: string
    }>
  >()
  const isCIModule = module === 'ci'

  const [data, setData] = React.useState<PagePMSPipelineSummaryResponse | undefined>()

  const {
    loading,
    mutate: reloadPipelines,
    cancel
  } = useGetPipelineList({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      module,
      orgIdentifier,
      searchTerm: searchParam,
      page,
      size: 5,
      ...(gitFilter?.repo &&
        gitFilter.branch && {
          repoIdentifier: gitFilter.repo,
          branch: gitFilter.branch
        })
    },
    mock: mockData
  })

  const fetchPipelines = React.useCallback(async () => {
    cancel()
    setData(await (await reloadPipelines({ filterType: 'PipelineSetup' }))?.data)
  }, [cancel])

  React.useEffect(() => {
    cancel()
    fetchPipelines()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, accountId, projectIdentifier, orgIdentifier, module, searchParam, gitFilter])

  const handleSearch = (query: string): void => {
    setSearchParam(query)
  }

  return (
    <>
      <Page.Header
        title={
          <Layout.Horizontal style={{ alignItems: 'center' }}>
            <Text color={Color.GREY_800} font="medium">
              {getString('runPipelineText')}
            </Text>
            {isGitSyncEnabled && (
              <GitSyncStoreProvider>
                <GitFilters
                  onChange={filter => {
                    setGitFilter(filter)
                    setPage(0)
                  }}
                  className={css.gitFilter}
                />
              </GitSyncStoreProvider>
            )}
          </Layout.Horizontal>
        }
        toolbar={
          <Container>
            <Button icon="cross" minimal onClick={onClose} />
          </Container>
        }
      />
      <Page.Body className={css.main} loading={loading}>
        <ExpandingSearchInput
          alwaysExpanded
          width={250}
          placeholder={getString('search')}
          throttle={200}
          defaultValue={searchParam}
          className={css.searchContainer}
          onChange={handleSearch}
        />

        {!data?.content?.length ? (
          <Text className={css.noResultSection} font={{ size: 'medium' }}>
            {getString(isCIModule ? 'pipeline.runModalNoPipelineText' : 'pipeline.noDeploymentText')}
          </Text>
        ) : (
          <RunPipelineListView data={data} refetch={fetchPipelines} gotoPage={pageNumber => setPage(pageNumber)} />
        )}
      </Page.Body>
    </>
  )
}
