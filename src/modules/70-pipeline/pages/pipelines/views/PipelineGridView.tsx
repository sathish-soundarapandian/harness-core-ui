/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Container, Layout, Pagination } from '@wings-software/uicore'
import React from 'react'
import type { PagePMSPipelineSummaryResponse, PMSPipelineSummaryResponse } from 'services/pipeline-ng'
import { PipelineCard } from './PipelineCard/PipelineCard'
import css from '../PipelinesPage.module.scss'

interface PipelineGridViewProps {
  data?: PagePMSPipelineSummaryResponse
  gotoPage: (pageNumber: number) => void
  goToPipelineDetail: (pipeline?: PMSPipelineSummaryResponse) => void
  goToPipelineStudio: (pipeline?: PMSPipelineSummaryResponse) => void
  refetchPipeline: () => void
  onDeletePipeline: (commitMsg: string) => Promise<void>
  onDelete: (pipeline: PMSPipelineSummaryResponse) => void
  onClonePipeline: (pipeline: PMSPipelineSummaryResponse) => void
}

export function PipelineGridView({
  data,
  gotoPage,
  goToPipelineDetail,
  goToPipelineStudio,
  refetchPipeline,
  onDeletePipeline,
  onDelete,
  onClonePipeline
}: PipelineGridViewProps): React.ReactElement {
  return (
    <>
      <Container className={css.gridLayout}>
        <Layout.Masonry
          center
          gutter={25}
          items={data?.content || []}
          renderItem={(item: PMSPipelineSummaryResponse) => (
            <PipelineCard
              pipeline={item}
              goToPipelineDetail={goToPipelineDetail}
              goToPipelineStudio={goToPipelineStudio}
              refetchPipeline={refetchPipeline}
              onDeletePipeline={onDeletePipeline}
              onDelete={onDelete}
              onClonePipeline={onClonePipeline}
            />
          )}
          keyOf={(item: PMSPipelineSummaryResponse) => item.identifier}
        />
      </Container>
      <Container className={css.pagination}>
        <Pagination
          itemCount={data?.totalElements || /* istanbul ignore next */ 0}
          pageSize={data?.size || /* istanbul ignore next */ 10}
          pageCount={data?.totalPages || /* istanbul ignore next */ -1}
          pageIndex={data?.number || /* istanbul ignore next */ 0}
          gotoPage={gotoPage}
        />
      </Container>
    </>
  )
}
