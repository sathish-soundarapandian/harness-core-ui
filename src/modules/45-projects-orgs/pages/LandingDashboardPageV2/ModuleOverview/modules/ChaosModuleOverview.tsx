/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import type { ModuleOverviewBaseProps } from '../Grid/ModuleOverviewGrid'
import EmptyStateExpandedView from '../EmptyState/EmptyStateExpandedView'
import EmptyStateCollapsedView from '../EmptyState/EmptyStateCollapsedView'
import DefaultFooter from '../EmptyState/DefaultFooter'

const ChaosModuleOverview: React.FC<ModuleOverviewBaseProps> = ({ isExpanded }) => {
  const { accountId } = useParams<AccountPathProps>()

  if (isExpanded) {
    return (
      <EmptyStateExpandedView
        title={'common.moduleDetails.chaos.expanded.title'}
        description={[
          'common.moduleDetails.chaos.expanded.list.one',
          'common.moduleDetails.chaos.expanded.list.two',
          'common.moduleDetails.chaos.expanded.list.three'
        ]}
        footer={
          <DefaultFooter
            learnMoreLink="https://docs.harness.io/category/zgffarnh1m-ci-category"
            getStartedLink={routes.toChaos({ accountId })}
          />
        }
      />
    )
  }

  return <EmptyStateCollapsedView description={'common.moduleDetails.chaos.collapsed.title'} />
}

export default ChaosModuleOverview
