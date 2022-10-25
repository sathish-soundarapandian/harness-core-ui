/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type React from 'react'
import type { OverviewAddClusterProps } from '@ce/components/OverviewPage/OverviewAddCluster'
import type { RecommendationFiltersProps } from '@ce/components/RecommendationFilters/RecommendationFilters'
import type { AnomalyFiltersProps } from '@ce/components/AnomaliesFilter/AnomaliesFilter'
import type { ConnectorReferenceFieldProps } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import type { GatewayListFiltersProps } from '@ce/components/COGatewayList/GatewayListFilters'
import type FeatureWarningBanner from '@common/components/FeatureWarning/FeatureWarningBanner'

export interface CCMUIAppCustomProps {
  customComponents: {
    OverviewAddCluster: React.ComponentType<OverviewAddClusterProps>
    RecommendationFilters: React.ComponentType<RecommendationFiltersProps>
    AnomaliesFilter: React.ComponentType<AnomalyFiltersProps>
    ConnectorReferenceField: React.ComponentType<ConnectorReferenceFieldProps>
    GatewayListFilters: React.ComponentType<GatewayListFiltersProps>
    FeatureWarningBanner: typeof FeatureWarningBanner
  }
}
