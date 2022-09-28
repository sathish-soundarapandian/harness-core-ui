/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { UseStringsReturn } from 'framework/strings'

export const COST_FILTER_KEYS = ['minSaving', 'minCost']

export function getFiltersLabelName(getString: UseStringsReturn['getString']): Record<string, string> {
  return {
    minSaving: getString('ce.recommendation.listPage.filters.minSaving'),
    minCost: getString('ce.recommendation.listPage.filters.minCost')
  }
}

export function getLabelMappingForFilters(getString: UseStringsReturn['getString']): Record<string, string> {
  return {
    clusterName: getString('common.clusterName'),
    name: getString('ce.recommendation.listPage.filters.name'),
    resourceType: getString('common.resourceTypeLabel'),
    namespace: getString('ce.recommendation.listPage.filters.namespace'),
    clusterNames: getString('common.clusterName'),
    names: getString('ce.recommendation.listPage.filters.name'),
    resourceTypes: getString('common.resourceTypeLabel'),
    namespaces: getString('ce.recommendation.listPage.filters.namespace')
  }
}
