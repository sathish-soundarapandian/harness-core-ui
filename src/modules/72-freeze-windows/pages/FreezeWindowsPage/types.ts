/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { GetFreezeListQueryParams } from 'services/cd-ng'

export type FreezeWindowListPagePathParams = Pick<
  ProjectPathProps,
  'accountId' | 'orgIdentifier' | 'projectIdentifier'
> &
  ModulePathParams

export type FreezeWindowListPageQueryParams = Omit<
  GetFreezeListQueryParams,
  'accountIdentifier' | 'orgIdentifier' | 'projectIdentifier'
>

export interface SortBy {
  sort: 'lastUpdatedAt' | 'name'
  order: 'ASC' | 'DESC'
}
