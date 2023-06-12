import React from 'react'
import { Card, Text, Container } from '@harness/uicore'
import { useStrings, StringKeys } from 'framework/strings'
import type { SectionScore } from 'services/assessments'
import SectionPerformanceCard from '../SectionPerformanceCard/SectionPerformanceCard'
import css from './PerformanceOverview.module.scss'

interface PerformanceOverviewProps {
  sectionList: SectionScore[]
  isBest?: boolean
}

const PerformanceOverview = ({ sectionList, isBest }: PerformanceOverviewProps): JSX.Element => {
  const { getString } = useStrings()
  const titleProp = isBest ? 'yourBestPerformance' : 'yourTopOpportunities'
  return (
    <Card className={css.performanceOverviewCard}>
      <Text className={css.heading}>{getString(`assessments.${titleProp}` as StringKeys)}</Text>
      <Text className={css.subHeading} padding={{ bottom: 'small' }}>
        {getString('assessments.basedOnResultsHarnessRecommendations')}
      </Text>
      <Container className={css.recommendationsContainer}>
        {sectionList.length
          ? sectionList.map(sec => {
              return <SectionPerformanceCard key={sec.sectionId} sectionScore={sec} />
            })
          : null}
      </Container>
    </Card>
  )
}

export default PerformanceOverview
