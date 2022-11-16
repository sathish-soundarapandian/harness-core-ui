import { Layout } from '@harness/uicore'
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetCounts } from 'services/dashboard-service'
import { OverviewGalanceCard } from '@projects-orgs/components/OverviewGlanceCards/OverviewGlanceCards'
import type { CountChangeAndCountChangeRateInfo } from 'services/dashboard-service'
import type { StringsMap } from 'stringTypes'
import OverviewGlanceCardV2 from './OverviewGlanceCardV2/OverviewGlanceCardV2'
import css from './OverviewGlanceCardsContainer.module.scss'

interface GlanceCard {
  type: OverviewGalanceCard
  label: StringsMap
  count?: number
  countChangeInfo?: CountChangeAndCountChangeRateInfo
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
      countChangeInfo: projectsCountDetail?.countChangeAndCountChangeRateInfo
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
        return <OverviewGlanceCardV2 key={card.type} className={css.card} loading={loading} {...card} />
      })}
    </Layout.Horizontal>
  )
}

export default OverviewGlanceCardsV2
