/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Layout } from '@harness/uicore'
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetCounts } from 'services/dashboard-service'
import { OverviewGalanceCard } from '@projects-orgs/components/OverviewGlanceCards/OverviewGlanceCards'
import type { CountChangeAndCountChangeRateInfo } from 'services/dashboard-service'
import routes from '@common/RouteDefinitions'
import type { StringKeys } from 'framework/strings'
import OverviewGlanceCardV2 from './OverviewGlanceCardV2/OverviewGlanceCardV2'
import css from './OverviewGlanceCardsContainer.module.scss'

interface GlanceCard {
  type: OverviewGalanceCard
  label: StringKeys
  count?: number
  countChangeInfo?: CountChangeAndCountChangeRateInfo
  url?: string
}

const OverviewGlanceCardsV2 = () => {
  const { accountId } = useParams<AccountPathProps>()
  const [range] = useState([Date.now() - 30 * 24 * 60 * 60000, Date.now()])

  const { data: countResponse, loading } = useGetCounts({
    queryParams: {
      accountIdentifier: accountId,
      startTime: range[0],
      endTime: range[1]
    }
  })

  const { projectsCountDetail, envCountDetail, servicesCountDetail, pipelinesCountDetail } =
    countResponse?.data?.response || {}

  const GLANCE_CARDS: GlanceCard[] = [
    {
      type: OverviewGalanceCard.PROJECT,
      label: 'projectsText',
      count: projectsCountDetail?.count,
      countChangeInfo: projectsCountDetail?.countChangeAndCountChangeRateInfo,
      url: routes.toProjects({ accountId })
    },
    {
      type: OverviewGalanceCard.SERVICES,
      label: 'services',
      count: servicesCountDetail?.count,
      countChangeInfo: servicesCountDetail?.countChangeAndCountChangeRateInfo
    },
    {
      type: OverviewGalanceCard.ENV,
      label: 'environments',
      count: envCountDetail?.count,
      countChangeInfo: envCountDetail?.countChangeAndCountChangeRateInfo
    },
    {
      type: OverviewGalanceCard.PIPELINES,
      label: 'pipelines',
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
