/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { GetListOfExecutionsQueryParams, PipelineExecutionFilterProperties } from 'services/pipeline-ng'

export type ExecutionListPageQueryParams = GetListOfExecutionsQueryParams & {
  filters?: PipelineExecutionFilterProperties
  getDefaultFromOtherRepo?: boolean
}

export interface SortBy {
  sort: 'name' | 'status' | 'startTs'
  order: 'ASC' | 'DESC'
}

export type ProcessedExecutionListPageQueryParams = RequiredPick<ExecutionListPageQueryParams, 'page' | 'size' | 'sort'>
