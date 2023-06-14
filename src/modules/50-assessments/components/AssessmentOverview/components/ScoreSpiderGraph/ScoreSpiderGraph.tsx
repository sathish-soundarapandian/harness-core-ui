import { Button, ButtonVariation, Card, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import Highcharts from 'highcharts'
import more from 'highcharts/highcharts-more'
import HighchartsReact from 'highcharts-react-official'
import React from 'react'
import { useStrings } from 'framework/strings'
import type { SectionScore } from 'services/assessments'
import { getSpiderChartOptions } from './ScoreSpiderGraph.utils'
import css from './ScoreSpiderGraph.module.scss'

interface ScoreSpiderGraphProps {
  sectionScores: SectionScore[]
}
const ScoreSpiderGraph = ({ sectionScores }: ScoreSpiderGraphProps): JSX.Element => {
  const { getString } = useStrings()
  return (
    <Card className={css.scoreSpiderGraph}>
      <div className={css.header}>
        <Text font={{ weight: 'bold', size: 'medium' }} color={Color.GREY_1000}>
          {getString('assessments.howYouPerformedInSections')}
        </Text>
        <Button variation={ButtonVariation.LINK}>{getString('assessments.viewInDetail')}</Button>
      </div>
      <HighchartsReact highcharts={more(Highcharts)} options={getSpiderChartOptions(sectionScores)} />
    </Card>
  )
}

export default ScoreSpiderGraph
