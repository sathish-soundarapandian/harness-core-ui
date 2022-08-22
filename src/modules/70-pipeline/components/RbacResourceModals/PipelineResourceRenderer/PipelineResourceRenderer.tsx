/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback } from 'react'
import type { RbacResourceRendererProps } from '@rbac/factories/RbacFactory'
import StaticResourceRenderer from '@rbac/components/StaticResourceRenderer/StaticResourceRenderer'
import { PageSpinner } from '@common/components'
import { useStrings } from 'framework/strings'
import {
  PagePMSPipelineSummaryResponse,
  PipelineFilterProperties,
  PMSPipelineSummaryResponse,
  useGetPipelineList
} from 'services/pipeline-ng'
import type { ResourceHandlerTableData } from '@rbac/components/ResourceHandlerTable/ResourceHandlerTable'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { RenderColumnPipeline, RenderLastRunDate } from '../PipelineResourceModal/PipelineResourceModal'

function PipelineResourceRenderer({
  identifiers,
  resourceScope,
  resourceType,
  onResourceSelectionChange
}: RbacResourceRendererProps): React.ReactElement {
  const { accountIdentifier, orgIdentifier = '', projectIdentifier = '' } = resourceScope
  const { getString } = useStrings()
  const { isGitSyncEnabled: isGitSyncEnabledForProject, gitSyncEnabledOnlyForFF } = useAppStore()
  const isGitSyncEnabled = isGitSyncEnabledForProject && !gitSyncEnabledOnlyForFF
  const [pipelineData, setData] = React.useState<PagePMSPipelineSummaryResponse | undefined>()

  const {
    loading,
    mutate: reloadPipelines,
    cancel
  } = useGetPipelineList({
    queryParams: {
      accountIdentifier,
      projectIdentifier,
      orgIdentifier,
      size: 10,
      ...(isGitSyncEnabled ? { getDistinctFromBranches: true } : {})
    }
  })

  const fetchPipelines = useCallback(async () => {
    cancel()
    const filter = {
      filterType: 'PipelineSetup',
      pipelineIdentifiers: identifiers
    } as PipelineFilterProperties

    setData(await (await reloadPipelines(filter)).data)
  }, [cancel])

  React.useEffect(() => {
    cancel()
    fetchPipelines()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountIdentifier, projectIdentifier, orgIdentifier, module])

  const pipelineContentData: PMSPipelineSummaryResponse[] = pipelineData?.content || []

  return pipelineData && !loading ? (
    <StaticResourceRenderer
      data={pipelineContentData as ResourceHandlerTableData[]}
      resourceType={resourceType}
      onResourceSelectionChange={onResourceSelectionChange}
      columns={[
        {
          Header: getString('common.pipeline'),
          id: 'name',
          accessor: 'name' as any,
          Cell: RenderColumnPipeline,
          width: '40%',
          disableSortBy: true
        },
        {
          Header: getString('lastExecutionTs'),
          id: 'details',
          accessor: 'executionSummaryInfo',
          Cell: RenderLastRunDate,
          width: '55%',
          disableSortBy: true
        }
      ]}
    />
  ) : (
    <PageSpinner />
  )
}

export default PipelineResourceRenderer
