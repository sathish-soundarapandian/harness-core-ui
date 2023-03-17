/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import { Container, Layout, Text, Icon } from '@harness/uicore'
import type { CellProps, Renderer } from 'react-table'
import { Color } from '@harness/design-system'
import { Position } from '@blueprintjs/core'
import ReactTimeago from 'react-timeago'
import ResourceHandlerTable, {
  ResourceHandlerTableData
} from '@rbac/components/ResourceHandlerTable/ResourceHandlerTable'
import { PageSpinner, TagsPopover } from '@common/components'
import type { RbacResourceModalProps } from '@rbac/factories/RbacFactory'
import { useStrings } from 'framework/strings'
import { PMSPipelineSummaryResponse, useGetPipelineList } from 'services/pipeline-ng'
import { useMutateAsGet } from '@common/hooks'
import {
  CodeSourceCell,
  LastExecutionCell,
  PipelineNameCell
} from '@pipeline/pages/pipeline-list/PipelineListTable/PipelineListCells'

interface PipelineDTO extends PMSPipelineSummaryResponse {
  admin?: string
  collaborators?: string
  status?: string
}

// eslint-disable-next-line react/function-component-definition
export const RenderColumnPipeline: Renderer<CellProps<PipelineDTO>> = ({ row }) => {
  const rowdata = row.original
  const { getString } = useStrings()

  return (
    <Layout.Vertical spacing="xsmall" data-testid={rowdata.identifier}>
      <Layout.Horizontal spacing="medium">
        <Text
          color={Color.GREY_800}
          tooltipProps={{ position: Position.BOTTOM }}
          tooltip={
            <Layout.Vertical spacing="medium" padding="medium" style={{ maxWidth: 400 }}>
              <Text>{getString('nameLabel', { name: rowdata.name })}</Text>
              <Text>{getString('idLabel', { id: rowdata.identifier })}</Text>
              <Text>{getString('descriptionLabel', { description: rowdata.description })}</Text>
            </Layout.Vertical>
          }
        >
          {rowdata.name}
        </Text>
        {rowdata.tags && Object.keys(rowdata.tags).length ? <TagsPopover tags={rowdata.tags} /> : null}
      </Layout.Horizontal>
      <Text tooltipProps={{ position: Position.BOTTOM }} color={Color.GREY_400}>
        {getString('idLabel', { id: rowdata.identifier })}
      </Text>
    </Layout.Vertical>
  )
}

// eslint-disable-next-line react/function-component-definition
export const RenderLastRunDate: Renderer<CellProps<PipelineDTO>> = ({ row }) => {
  const rowdata = row.original
  const lastRunStartTs = rowdata.recentExecutionsInfo?.[0]?.startTs
  const { getString } = useStrings()
  return (
    <Layout.Vertical spacing="xsmall">
      <Text color={Color.GREY_800}>Last run:</Text>
      <Text color={Color.GREY_400}>
        {lastRunStartTs ? <ReactTimeago date={lastRunStartTs} /> : getString('pipelineSteps.pullNeverLabel')}
      </Text>
    </Layout.Vertical>
  )
}

function PipelineResourceModal({
  searchTerm,
  sortMethod,
  onSelectChange,
  selectedData,
  resourceScope
}: RbacResourceModalProps): React.ReactElement {
  const { accountIdentifier, orgIdentifier = '', projectIdentifier = '' } = resourceScope
  const [page, setPage] = useState(0)
  const { getString } = useStrings()

  const pipelinesQuery = useMutateAsGet(useGetPipelineList, {
    body: {
      filterType: 'PipelineSetup'
    },
    queryParams: {
      accountIdentifier,
      projectIdentifier,
      orgIdentifier,
      searchTerm,
      page,
      size: 10,
      sort: [sortMethod]
    },
    queryParamStringifyOptions: { arrayFormat: 'comma' }
  })

  if (pipelinesQuery.loading) return <PageSpinner />

  const data = pipelinesQuery.data?.data

  return data?.content?.length ? (
    <Container>
      <ResourceHandlerTable
        data={data?.content as ResourceHandlerTableData[]}
        selectedData={selectedData}
        columns={[
          {
            Header: getString('filters.executions.pipelineName'),
            accessor: 'name' as any,
            Cell: PipelineNameCell,
            width: '40%',
            disableSortBy: true
          },
          {
            Header: getString('pipeline.codeSource'),
            accessor: 'storeType' as any,
            Cell: CodeSourceCell,
            width: '20%',
            disableSortBy: true
          },
          {
            Header: getString('pipeline.lastExecution'),
            accessor: 'executionSummaryInfo.lastExecutionTs' as any,
            Cell: LastExecutionCell,
            width: '35%',
            disableSortBy: true
          }
        ]}
        pagination={{
          itemCount: data?.totalElements || 0,
          pageSize: data?.size || 10,
          pageCount: data?.totalPages ?? 1,
          pageIndex: data?.number ?? 0,
          gotoPage: pageNumber => setPage(pageNumber)
        }}
        onSelectChange={onSelectChange}
      />
    </Container>
  ) : (
    <Layout.Vertical flex={{ align: 'center-center' }} spacing="small">
      <Icon name="resources-icon" size={20} />
      <Text font="medium" color={Color.BLACK}>
        {getString('noData')}
      </Text>
    </Layout.Vertical>
  )
}

export default PipelineResourceModal
