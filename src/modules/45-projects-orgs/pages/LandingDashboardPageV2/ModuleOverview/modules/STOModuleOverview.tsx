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

const STOModuleOverview: React.FC<ModuleOverviewBaseProps> = ({ isExpanded }) => {
  const { accountId } = useParams<AccountPathProps>()

  if (isExpanded) {
    return (
      <EmptyStateExpandedView
        title={'common.moduleDetails.sto.expanded.title'}
        description={[
          'common.moduleDetails.sto.expanded.list.one',
          'common.moduleDetails.sto.expanded.list.two',
          'common.moduleDetails.sto.expanded.list.three',
          'common.moduleDetails.sto.expanded.list.four',
          'common.moduleDetails.sto.expanded.list.five'
        ]}
        footer={
          <DefaultFooter
            learnMoreLink="https://docs.harness.io/category/txlccquh5c-sto-category"
            getStartedLink={routes.toSTO({ accountId })}
          />
        }
      />
    )
  }

  return <EmptyStateCollapsedView description={'common.moduleDetails.sto.collapsed.title'} />
}

export default STOModuleOverview
