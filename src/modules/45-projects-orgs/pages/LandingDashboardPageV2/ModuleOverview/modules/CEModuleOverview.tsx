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
import ModuleColumnChart from '../../ModuleColumnChart/ModuleColumnChart'

const CEModuleOverview: React.FC<ModuleOverviewBaseProps> = ({ isExpanded, isEmptyState }) => {
  if (isEmptyState) {
    if (isExpanded) {
      return (
        <EmptyStateExpandedView
          title={'common.moduleDetails.ce.expanded.title'}
          footer={<DefaultFooter learnMoreLink="https://docs.harness.io/category/exgoemqhji-ccm" />}
        />
      )
    }
    return <EmptyStateCollapsedView description={'common.moduleDetails.ce.collapsed.title'} />
  }

  const data = [
    {
      name: 'Success (50)',
      data: [23, 12, 3, 8, 1, 1, 2],
      color: '#01C9CC',
      custom: [
        {
          time: 1679356800000,
          countWithSuccessFailureDetails: {
            count: 969,
            countChangeAndCountChangeRateInfo: null,
            successCount: 23,
            failureCount: 946
          }
        },
        {
          time: 1679443200000,
          countWithSuccessFailureDetails: {
            count: 916,
            countChangeAndCountChangeRateInfo: null,
            successCount: 12,
            failureCount: 904
          }
        },
        {
          time: 1679529600000,
          countWithSuccessFailureDetails: {
            count: 881,
            countChangeAndCountChangeRateInfo: null,
            successCount: 3,
            failureCount: 878
          }
        },
        {
          time: 1679616000000,
          countWithSuccessFailureDetails: {
            count: 874,
            countChangeAndCountChangeRateInfo: null,
            successCount: 8,
            failureCount: 866
          }
        },
        {
          time: 1679702400000,
          countWithSuccessFailureDetails: {
            count: 861,
            countChangeAndCountChangeRateInfo: null,
            successCount: 1,
            failureCount: 860
          }
        },
        {
          time: 1679788800000,
          countWithSuccessFailureDetails: {
            count: 863,
            countChangeAndCountChangeRateInfo: null,
            successCount: 1,
            failureCount: 862
          }
        },
        {
          time: 1679875200000,
          countWithSuccessFailureDetails: {
            count: 270,
            countChangeAndCountChangeRateInfo: null,
            successCount: 2,
            failureCount: 268
          }
        }
      ]
    },
    {
      name: 'Failed (5584)',
      data: [946, 904, 878, 866, 860, 862, 268],
      color: '#01C9CC',
      custom: [
        {
          time: 1679356800000,
          countWithSuccessFailureDetails: {
            count: 969,
            countChangeAndCountChangeRateInfo: null,
            successCount: 23,
            failureCount: 946
          }
        },
        {
          time: 1679443200000,
          countWithSuccessFailureDetails: {
            count: 916,
            countChangeAndCountChangeRateInfo: null,
            successCount: 12,
            failureCount: 904
          }
        },
        {
          time: 1679529600000,
          countWithSuccessFailureDetails: {
            count: 881,
            countChangeAndCountChangeRateInfo: null,
            successCount: 3,
            failureCount: 878
          }
        },
        {
          time: 1679616000000,
          countWithSuccessFailureDetails: {
            count: 874,
            countChangeAndCountChangeRateInfo: null,
            successCount: 8,
            failureCount: 866
          }
        },
        {
          time: 1679702400000,
          countWithSuccessFailureDetails: {
            count: 861,
            countChangeAndCountChangeRateInfo: null,
            successCount: 1,
            failureCount: 860
          }
        },
        {
          time: 1679788800000,
          countWithSuccessFailureDetails: {
            count: 863,
            countChangeAndCountChangeRateInfo: null,
            successCount: 1,
            failureCount: 862
          }
        },
        {
          time: 1679875200000,
          countWithSuccessFailureDetails: {
            count: 270,
            countChangeAndCountChangeRateInfo: null,
            successCount: 2,
            failureCount: 268
          }
        }
      ]
    }
  ]

  return <ModuleColumnChart count={1000} data={data} isExpanded={isExpanded} />
}

export default CEModuleOverview
