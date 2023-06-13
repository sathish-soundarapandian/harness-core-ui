import React from 'react'
import { Card, Text, Container } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { useStrings, StringKeys } from 'framework/strings'
import type { SectionScore } from 'services/assessments'
import SectionPerformanceCard from '../SectionPerformanceCard/SectionPerformanceCard'
import css from './PerformanceOverview.module.scss'

interface PerformanceOverviewProps {
  sectionList: SectionScore[]
  isBest?: boolean
  resultsCode: string
}

const PerformanceOverview = ({ sectionList, isBest, resultsCode }: PerformanceOverviewProps): JSX.Element => {
  const { getString } = useStrings()
  const titleProp = isBest ? 'yourBestPerformance' : 'yourTopOpportunities'
  return (
    <Card className={css.performanceOverviewCard}>
      <Text font={{ variation: FontVariation.H4 }}>{getString(`assessments.${titleProp}` as StringKeys)}</Text>
      <Container className={css.recommendationsContainer}>
        {sectionList.length
          ? sectionList.map(sec => {
              return <SectionPerformanceCard key={sec.sectionId} sectionScore={sec} resultCode={resultsCode} />
            })
          : null}
      </Container>
    </Card>
  )
}

export default PerformanceOverview
