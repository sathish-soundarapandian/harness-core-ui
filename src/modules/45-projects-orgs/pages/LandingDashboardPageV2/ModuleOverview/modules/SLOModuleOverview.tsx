/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { ModuleOverviewBaseProps } from '../Grid/ModuleOverviewGrid'
import EmptyStateExpandedView from '../EmptyState/EmptyStateExpandedView'
import EmptyStateCollapsedView from '../EmptyState/EmptyStateCollapsedView'
import DefaultFooter from '../EmptyState/DefaultFooter'

const SLOModuleOverview: React.FC<ModuleOverviewBaseProps> = ({ isExpanded }) => {
  if (isExpanded) {
    return (
      <EmptyStateExpandedView
        title={'common.moduleDetails.slo.expanded.title'}
        description={'common.moduleDetails.slo.expanded.description'}
        footer={
          <DefaultFooter learnMoreLink="https://docs.harness.io/category/ko19u4brsv-howtos-service-reliability-management" />
        }
      />
    )
  }

  return <EmptyStateCollapsedView description={'common.moduleDetails.slo.collapsed.title'} />
}

export default SLOModuleOverview
