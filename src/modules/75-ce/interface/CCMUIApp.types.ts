/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type React from 'react'
import type { UseGetReturn, UseMutateReturn } from 'restful-react'
import type { OverviewAddClusterProps } from '@ce/components/OverviewPage/OverviewAddCluster'
import type { RecommendationFiltersProps } from '@ce/components/RecommendationFilters/RecommendationFilters'
import type {
  ACLAggregateFilter,
  Failure,
  GetAggregatedUsersQueryParams,
  GetConnectorQueryParams,
  ResponseConnectorResponse,
  ResponsePageUserAggregate,
  UseGetAggregatedUsersProps,
  UseGetConnectorProps
} from 'services/cd-ng'
import type { RBACTooltipProps } from '@rbac/components/RBACTooltip/RBACTooltip'
import type { SimpleLogViewerProps } from '@common/components/LogViewer/SimpleLogViewer'

export interface CCMUIAppCustomProps {
  customComponents: {
    OverviewAddCluster: React.ComponentType<OverviewAddClusterProps>
    RecommendationFilters: React.ComponentType<RecommendationFiltersProps>
    RBACTooltip: React.ComponentType<RBACTooltipProps>
    SimpleLogViewer: React.ComponentType<SimpleLogViewerProps>
  }
  customAPIHooks: {
    useGetAggregatedUsers: (
      props: UseGetAggregatedUsersProps
    ) => UseMutateReturn<
      ResponsePageUserAggregate,
      Failure | Error,
      ACLAggregateFilter,
      GetAggregatedUsersQueryParams,
      void
    >
    useGetConnector: (
      props: UseGetConnectorProps
    ) => UseGetReturn<ResponseConnectorResponse, Failure | Error, GetConnectorQueryParams, unknown>
  }
}
