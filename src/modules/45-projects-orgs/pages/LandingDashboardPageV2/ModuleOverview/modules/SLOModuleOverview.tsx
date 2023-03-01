/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { Container, Icon } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { RiskData, useGetServiceLevelObjectivesRiskCount } from 'services/cv'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import type { ModuleOverviewBaseProps } from '../Grid/ModuleOverviewGrid'
import EmptyStateExpandedView from '../EmptyState/EmptyStateExpandedView'
import EmptyStateCollapsedView from '../EmptyState/EmptyStateCollapsedView'
import DefaultFooter from '../EmptyState/DefaultFooter'
import ModuleSemiCircleChart from '../../ModuleSemiCircleChart/ModuleSemiCircleChart'

interface RiskCountData {
  color: string
}

const riskDataMap: Record<NonNullable<RiskData['riskStatus']>, RiskCountData> = {
  HEALTHY: {
    color: '#90BE6D'
  },
  NEED_ATTENTION: {
    color: '#F3722C'
  },
  NO_ANALYSIS: {
    color: '#D8D8D8'
  },
  NO_DATA: {
    color: '#D8D8D8'
  },
  OBSERVE: {
    color: '#F9C74F'
  },
  UNHEALTHY: {
    color: '#F94144'
  }
}

const SLOModuleOverview: React.FC<ModuleOverviewBaseProps> = ({ isExpanded, isEmptyState }) => {
  const { accountId } = useParams<AccountPathProps>()

  const { data, loading } = useGetServiceLevelObjectivesRiskCount({ queryParams: { accountId } })

  if (isEmptyState) {
    if (isExpanded) {
      return (
        <EmptyStateExpandedView
          title={'common.moduleDetails.slo.expanded.title'}
          description={'common.moduleDetails.slo.expanded.title'}
        />
      )
    }
    return <EmptyStateCollapsedView description={'common.moduleDetails.slo.collapsed.title'} />
  }

  // if (isExpanded) {
  //   return (
  //     <EmptyStateExpandedView
  //       title={'common.moduleDetails.slo.expanded.title'}
  //       description={'common.moduleDetails.slo.expanded.description'}
  //       footer={
  //         <DefaultFooter learnMoreLink="https://docs.harness.io/category/ko19u4brsv-howtos-service-reliability-management" />
  //       }
  //     />
  //   )
  // }

  if (loading) {
    return (
      <Container flex={{ justifyContent: 'center' }} height="100%">
        <Icon name="spinner" size={24} color={Color.PRIMARY_7} />
      </Container>
    )
  }

  const riskCounts = data?.data?.riskCounts
  const riskCountData = riskCounts?.map(value => [
    `${value.count} ${value.displayName}` as string,
    (value.count as number) + 10
  ])
  const colors = riskCounts?.map(value => riskDataMap[value.identifier]?.color)

  return <ModuleSemiCircleChart data={riskCountData || []} colors={colors || []} isExpanded={isExpanded} />

  return <EmptyStateCollapsedView description={'common.moduleDetails.slo.collapsed.title'} />
}

export default SLOModuleOverview
