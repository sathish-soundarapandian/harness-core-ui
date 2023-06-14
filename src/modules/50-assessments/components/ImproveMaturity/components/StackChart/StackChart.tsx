import React from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { Icon, Text } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import { getStackChart } from './StackChart.utils'
import css from './StackChart.module.scss'

interface StackChartProps {
  score: number
  maxScore: number
  improvementScore: number
  companyScore: number
  benchmarkScore: number
}

const StackChart = ({
  score,
  maxScore,
  improvementScore,
  companyScore,
  benchmarkScore
}: StackChartProps): JSX.Element => {
  const { getString } = useStrings()
  if (!getString) return <></>
  return (
    <div className={css.stackChart}>
      <Text font={{ weight: 'bold', size: 'medium' }} color={Color.GREY_1000} margin={{ bottom: 'small' }}>
        {getString('assessments.comparison')}
      </Text>
      <HighchartsReact
        containerProps={{ style: { height: '250px' } }}
        highcharts={Highcharts}
        options={getStackChart(score, maxScore, improvementScore, companyScore, benchmarkScore, getString)}
      />
      <div className={css.legend}>
        <Icon
          name={'full-circle'}
          color={Color.GREEN_500}
          margin={{ right: 'xsmall' }}
          padding={{ top: 'small' }}
          size={10}
        />
        <Text margin="small" font={{ size: 'xsmall' }}>
          {getString('assessments.increment')}
        </Text>
      </div>
    </div>
  )
}

export default StackChart
