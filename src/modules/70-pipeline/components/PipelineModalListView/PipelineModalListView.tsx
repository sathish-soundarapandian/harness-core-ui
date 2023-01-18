/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Color, FontVariation } from '@harness/design-system'
import {
  Button,
  ButtonVariation,
  Container,
  ExpandingSearchInput,
  ExpandingSearchInputHandle,
  Layout,
  Text
} from '@harness/uicore'
import React, { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import GitFilters, { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import { Page } from '@common/exports'
import { useMutateAsGet } from '@common/hooks'
import { CreatePipeline } from '@pipeline/pages/pipeline-list/CreatePipeline/CreatePipeline'
import { PipelineListTable } from '@pipeline/pages/pipeline-list/PipelineListTable/PipelineListTable'
import { DEFAULT_PAGE_INDEX, DEFAULT_PIPELINE_LIST_TABLE_SORT } from '@pipeline/utils/constants'
import { getModuleRunType } from '@pipeline/utils/runPipelineUtils'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { useStrings } from 'framework/strings'
import { useGetPipelineList } from 'services/pipeline-ng'
import type { PipelineListPagePathParams } from '@pipeline/pages/pipeline-list/types'
import { getEmptyStateIllustration } from '@pipeline/pages/pipeline-list/PipelineListUtils'
import css from './PipelineModalListView.module.scss'

interface PipelineModalListViewProps {
  onClose: () => void
}

export default function PipelineModalListView({ onClose }: PipelineModalListViewProps): React.ReactElement {
  const [page, setPage] = useState(0)
  const [searchTerm, setSearchTerm] = React.useState('')
  const searchRef = useRef({} as ExpandingSearchInputHandle)
  const [sort, setSort] = React.useState(DEFAULT_PIPELINE_LIST_TABLE_SORT)
  const [gitFilter, setGitFilter] = useState<GitFilterScope | null>(null)
  const { repo: repoIdentifier, branch } = gitFilter || {}
  const { getString } = useStrings()
  const { isGitSyncEnabled: isGitSyncEnabledForProject, gitSyncEnabledOnlyForFF } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const { projectIdentifier, orgIdentifier, accountId, module } = useParams<PipelineListPagePathParams>()

  const pipelinesQuery = useMutateAsGet(useGetPipelineList, {
    body: {
      filterType: 'PipelineSetup'
    },
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      searchTerm,
      page,
      sort,
      size: 7,
      ...(repoIdentifier &&
        branch && {
          repoIdentifier,
          branch
        })
    },
    queryParamStringifyOptions: { arrayFormat: 'comma' }
  })

  return (
    <>
      <Page.Header
        title={
          <Layout.Horizontal style={{ alignItems: 'center' }} spacing="xxlarge">
            <Text font={{ variation: FontVariation.H4 }} color={Color.GREY_800}>
              {getString('pipelines')}
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
            <ExpandingSearchInput
              alwaysExpanded
              width={200}
              placeholder={getString('search')}
              onChange={text => {
                setSearchTerm(text)
                setPage(DEFAULT_PAGE_INDEX)
              }}
              ref={searchRef}
              defaultValue={searchTerm}
            />
          </Layout.Horizontal>
        }
        toolbar={
          <Container>
            <Button icon="cross" minimal onClick={onClose} />
          </Container>
        }
      />
      <Page.Body
        className={css.pageBody}
        loading={pipelinesQuery.loading}
        error={pipelinesQuery.error?.message}
        retryOnError={pipelinesQuery.refetch}
        noData={{
          when: () => !pipelinesQuery.data?.data?.content?.length,
          image: getEmptyStateIllustration(!!searchTerm, module),
          messageTitle: searchTerm
            ? getString('common.filters.noResultsFound')
            : getString('pipeline.noPipelinesLabel', { moduleRunType: getModuleRunType(module) }),
          message: searchTerm
            ? getString('common.filters.noMatchingFilterData')
            : getString('pipeline-list.aboutPipeline'),
          button: searchTerm ? (
            <Button
              text={getString('common.filters.clearFilters')}
              variation={ButtonVariation.LINK}
              onClick={() => {
                setSearchTerm('')
                searchRef.current.clear()
              }}
            />
          ) : (
            <CreatePipeline onSuccess={pipelinesQuery.refetch} />
          )
        }}
      >
        {pipelinesQuery.data?.data && (
          <PipelineListTable
            gotoPage={pageNumber => setPage(pageNumber)}
            data={pipelinesQuery.data.data}
            setSortBy={setSort}
            sortBy={sort}
            minimal
          />
        )}
      </Page.Body>
    </>
  )
}
