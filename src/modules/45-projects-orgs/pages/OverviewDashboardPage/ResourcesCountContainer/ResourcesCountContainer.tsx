import { Layout, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetCounts } from 'services/dashboard-service'
import type { GlanceCardProps } from '@common/components/GlanceCard/GlanceCard'
import { getDataForCard, OverviewGalanceCard } from '@projects-orgs/components/OverviewGlanceCards/OverviewGlanceCards'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import ModuleTile from '../ModuleTile/ModuleTile'
import css from './ResourceCountContainer.module.scss'

interface CountViewProps extends Omit<GlanceCardProps, 'title'> {
  title: keyof StringsMap
}

const CountView: React.FC<CountViewProps> = ({ title, number, delta }) => {
  const { getString } = useStrings()
  return (
    <Layout.Vertical padding={{ top: 'medium', bottom: 'medium', left: 'small', right: 'small' }}>
      <Text color={Color.GREY_900} font={{ variation: FontVariation.BODY2 }} margin={{ bottom: 'large' }}>
        {getString(title)}
      </Text>
      <Layout.Horizontal flex>
        <Text color={Color.GREY_600} font={{ variation: FontVariation.H3 }}>
          {number}
        </Text>
        {delta}
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

const ResourcesCountContainer = () => {
  const { accountId } = useParams<AccountPathProps>()
  const [range] = useState([Date.now() - 30 * 24 * 60 * 60000, Date.now()])

  const {
    data: countResponse,
    loading,
    error,
    refetch
  } = useGetCounts({
    queryParams: {
      accountIdentifier: accountId,
      startTime: range[0],
      endTime: range[1]
    }
  })

  const { projectsCountDetail, envCountDetail, servicesCountDetail, pipelinesCountDetail } =
    countResponse?.data?.response || {}

  return (
    <Layout.Horizontal style={{ flexFlow: 'wrap' }}>
      <ModuleTile loading={loading} className={css.tile} type="small">
        <CountView {...getDataForCard(OverviewGalanceCard.PROJECT, projectsCountDetail)} />
      </ModuleTile>
      <ModuleTile loading={loading} className={css.tile} type="small">
        <CountView {...getDataForCard(OverviewGalanceCard.PIPELINES, pipelinesCountDetail)} />
      </ModuleTile>
      <ModuleTile loading={loading} className={css.tile} type="small">
        <CountView {...getDataForCard(OverviewGalanceCard.ENV, envCountDetail)} />
      </ModuleTile>
      <ModuleTile loading={loading} className={css.tile} type="small">
        <CountView {...getDataForCard(OverviewGalanceCard.SERVICES, servicesCountDetail)} />
      </ModuleTile>
    </Layout.Horizontal>
  )
}

export default ResourcesCountContainer
