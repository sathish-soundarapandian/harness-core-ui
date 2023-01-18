/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Layout } from '@harness/uicore'
import React from 'react'
import { useParams } from 'react-router-dom'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetCounts } from 'services/dashboard-service'
import type { CountChangeAndCountChangeRateInfo } from 'services/dashboard-service'
import routes from '@common/RouteDefinitions'
import type { StringKeys } from 'framework/strings'
import type { TimeRangeFilterType } from '@common/types'
import { getGMTEndDateTime, getGMTStartDateTime } from '@common/utils/momentUtils'
import OverviewGlanceCardV2 from './OverviewGlanceCardV2/OverviewGlanceCardV2'
import css from './OverviewGlanceCardsContainer.module.scss'

export enum OverviewGalanceCardV2 {
  PROJECT = 'PROJECT',
  SERVICES = 'SERVICES',
  ENV = 'ENV',
  PIPELINES = 'PIPELINES',
  USERS = 'USERS'
}

interface GlanceCard {
  type: OverviewGalanceCardV2
  label: StringKeys
  count?: number
  countChangeInfo?: CountChangeAndCountChangeRateInfo
  url?: string
}

interface OverviewGlanceCardsV2Props {
  timeRange: TimeRangeFilterType
}

const OverviewGlanceCardsV2: React.FC<OverviewGlanceCardsV2Props> = ({ timeRange }) => {
  const { accountId } = useParams<AccountPathProps>()

  const { data: countResponse, loading } = useGetCounts({
    queryParams: {
      accountIdentifier: accountId,
      startTime: getGMTStartDateTime(timeRange.from),
      endTime: getGMTEndDateTime(timeRange.to)
    }
  })

  const { projectsCountDetail, envCountDetail, servicesCountDetail, pipelinesCountDetail } =
    countResponse?.data?.response || {}

  const GLANCE_CARDS: GlanceCard[] = [
    {
      type: OverviewGalanceCardV2.PROJECT,
      label: 'projectsText',
      count: projectsCountDetail?.count,
      countChangeInfo: projectsCountDetail?.countChangeAndCountChangeRateInfo,
      url: routes.toProjects({ accountId })
    },
    {
      type: OverviewGalanceCardV2.SERVICES,
      label: 'services',
      count: servicesCountDetail?.count,
      countChangeInfo: servicesCountDetail?.countChangeAndCountChangeRateInfo
    },
    {
      type: OverviewGalanceCardV2.ENV,
      label: 'environments',
      count: envCountDetail?.count,
      countChangeInfo: envCountDetail?.countChangeAndCountChangeRateInfo
    },
    {
      type: OverviewGalanceCardV2.PIPELINES,
      label: 'pipelines',
      count: pipelinesCountDetail?.count,
      countChangeInfo: pipelinesCountDetail?.countChangeAndCountChangeRateInfo
    },
    {
      type: OverviewGalanceCardV2.USERS,
      label: 'users',
      count: pipelinesCountDetail?.count,
      countChangeInfo: pipelinesCountDetail?.countChangeAndCountChangeRateInfo
    }
  ]

  return (
    <Layout.Horizontal className={css.container}>
      {GLANCE_CARDS.map(card => {
        return (
          <OverviewGlanceCardV2
            key={card.type}
            className={css.card}
            loading={loading}
            redirectUrl={card.url}
            {...card}
          />
        )
      })}
    </Layout.Horizontal>
  )
}

export default OverviewGlanceCardsV2
