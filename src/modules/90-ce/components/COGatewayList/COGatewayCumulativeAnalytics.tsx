import { ProgressBar } from '@blueprintjs/core'
import { Color, Container, Heading, Icon, Intent, Layout, Tag, Text } from '@wings-software/uicore'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import React from 'react'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/exports'
import { Service, useCumulativeServiceSavings } from 'services/lw'
import odIcon from './images/ondemandIcon.svg'
import spotIcon from './images/spotIcon.svg'
import { geGaugeChartOptionsWithoutLabel, getDay } from './Utils'
import css from './COGatewayCumulativeAnalytics.module.scss'
interface COGatewayCumulativeAnalyticsProps {
  services: Service[]
}
function getStackedAreaChartOptions(
  title: string,
  categories: string[],
  yAxisText: string,
  savingsData: number[],
  spendData: number[]
): Highcharts.Options {
  let step = 1
  if (categories && categories.length) {
    categories = categories.map(x => getDay(x, 'YYYY-MM-DDTHH:mm:ssZ'))
    step = Math.ceil(categories.length * 0.25)
  }
  return {
    chart: {
      type: 'area',
      height: 180,
      spacing: [5, 20, 5, 5]
    },
    colors: ['rgba(71, 213, 223)', 'rgba(124, 77, 211,0.05)'],
    title: {
      text: title
    },
    xAxis: {
      categories: categories,
      labels: {
        step: step
      },
      units: [['day', [1]]],
      startOnTick: true,
      tickmarkPlacement: 'on'
    },
    yAxis: {
      min: 0,
      title: {
        text: yAxisText
      },
      labels: {
        format: '${value}'
      }
    },
    credits: {
      enabled: false
    },
    tooltip: {
      pointFormat: '{series.name}: {point.y}<br/>'
    },
    plotOptions: {
      spline: {
        stacking: 'normal',
        pointPlacement: 'on'
      }
    },
    series: [
      {
        name: 'Savings',
        type: 'area',
        data: savingsData,
        showInLegend: false,
        color: {
          linearGradient: {
            x1: 0,
            x2: 1,
            y1: 0,
            y2: 1
          },
          stops: [
            [0, 'rgba(71, 213, 223, 0.7)'],
            [1, 'rgba(71, 213, 223, 0)']
          ]
        },
        pointPlacement: 'on'
      },
      {
        name: 'Spend',
        type: 'area',
        data: spendData,
        showInLegend: false,
        color: {
          linearGradient: {
            x1: 0,
            x2: 1,
            y1: 0,
            y2: 1
          },
          stops: [
            [0, 'rgba(124, 77, 211, 0.7)'],
            [1, 'rgba(124, 77, 211, 0) 55.59%)']
          ]
        },
        pointPlacement: 'on'
      }
    ]
  }
}
function getSavingsPercentage(totalSavings: number, totalPotentialCost: number): number {
  if (totalPotentialCost == 0) {
    return 0
  }
  return Math.round((totalSavings / totalPotentialCost) * 100)
}
const COGatewayCumulativeAnalytics: React.FC<COGatewayCumulativeAnalyticsProps> = props => {
  const { orgIdentifier, projectIdentifier } = useParams<{
    orgIdentifier: string
    projectIdentifier: string
  }>()
  const { getString } = useStrings()
  const { data: graphData, loading: graphLoading } = useCumulativeServiceSavings({
    org_id: orgIdentifier, // eslint-disable-line
    project_id: projectIdentifier // eslint-disable-line
  })
  return (
    <Container padding="small">
      <Layout.Vertical spacing="large">
        <Heading
          level={2}
          style={{
            marginLeft: '30px'
          }}
        >
          SUMMARY OF RULES
        </Heading>
        <Layout.Horizontal
          spacing="xxlarge"
          background={Color.WHITE}
          style={{
            boxShadow: '0px 0px 1px rgba(40, 41, 61, 0.04), 0px 2px 4px rgba(96, 97, 112, 0.16)',
            borderRadius: '6px',
            margin: 'var(--spacing-medium)',
            padding: 'var(--spacing-medium)'
          }}
        >
          <Layout.Vertical spacing="large">
            <Heading level={2}>ACTIVE RULES</Heading>
            <Layout.Horizontal spacing="small">
              <Heading level={1}>{props.services.length}</Heading>
              <Text style={{ alignSelf: 'center' }}>Rules</Text>
            </Layout.Horizontal>
            <Heading level={2}>INSTANCES MANAGED</Heading>
            <Layout.Horizontal spacing="small">
              <Heading level={1}>{props.services.length}</Heading>
              <Text style={{ alignSelf: 'center' }}>Instances</Text>
            </Layout.Horizontal>
            <Layout.Horizontal spacing="small">
              <Text style={{ alignSelf: 'center' }}>{props.services.length % 2}</Text>
              <Tag intent={Intent.SUCCESS} minimal={true} style={{ borderRadius: '25px' }}>
                RUNNING
              </Tag>
            </Layout.Horizontal>
            <Layout.Horizontal spacing="small">
              <Text style={{ alignSelf: 'center' }}>{props.services.length - (props.services.length % 2)}</Text>
              <Tag intent={Intent.DANGER} minimal={true} style={{ borderRadius: '25px' }}>
                STOPPED
              </Tag>
            </Layout.Horizontal>
          </Layout.Vertical>
          <Layout.Vertical spacing="large">
            <Heading level={2}>SPOT/ON-DEMAND USAGE</Heading>
            <Layout.Vertical spacing="large" padding="small">
              <Layout.Horizontal spacing="small">
                <img src={odIcon} alt="" aria-hidden />
                <Text>On-demand (33%)</Text>
              </Layout.Horizontal>
              <Layout.Vertical spacing="small">
                <Text>300h 55m</Text>
                <ProgressBar intent={Intent.PRIMARY} value={0.33} stripes={false} />
              </Layout.Vertical>
            </Layout.Vertical>
            <Layout.Vertical spacing="large" padding="small">
              <Layout.Horizontal spacing="small">
                <img style={{ width: '20px' }} src={spotIcon} alt="" aria-hidden />
                <Text>Spot (66%)</Text>
              </Layout.Horizontal>
              <Layout.Vertical spacing="small">
                <Text>975h 36m</Text>
                <ProgressBar intent={Intent.PRIMARY} value={0.66} stripes={false} className={css.spotUsage} />
              </Layout.Vertical>
            </Layout.Vertical>
          </Layout.Vertical>
          <Layout.Vertical spacing="large" width="50%" style={{ textAlign: 'center' }}>
            <Heading level={2}>TOTAL SPEND VS SAVINGS</Heading>
            {graphData && graphData.response?.days && graphData.response?.days.length ? (
              <HighchartsReact
                highchart={Highcharts}
                options={getStackedAreaChartOptions(
                  '',
                  graphData?.response?.days as string[],
                  '',
                  graphData?.response?.savings as number[],
                  graphData?.response?.actual_cost as number[]
                )}
              />
            ) : graphLoading ? (
              <Icon name="spinner" size={24} color="blue500" style={{ alignSelf: 'center' }} />
            ) : (
              <Text style={{ marginTop: 'var(--spacing-xxlarge)', fontSize: 'var(--font-size-medium)' }}>
                {getString('ce.co.noData')}
              </Text>
            )}
          </Layout.Vertical>
          <Layout.Vertical spacing="small">
            <Layout.Vertical spacing="medium" padding="small">
              <Container padding="small" style={{ borderRadius: '4px', backgroundColor: 'rgba(71, 213, 223,0.05)' }}>
                <Layout.Vertical spacing="small">
                  <Text style={{ color: '#05AAB6' }}>TOTAL SAVINGS TILL DATE</Text>
                  {graphLoading ? (
                    <Icon name="spinner" size={24} color="blue500" />
                  ) : (
                    <Heading level={1} style={{ color: '#05AAB6' }}>
                      ${(Math.round(graphData?.response?.total_savings as number) * 100) / 100}
                    </Heading>
                  )}
                </Layout.Vertical>
              </Container>
              <Container padding="small" style={{ borderRadius: '4px', backgroundColor: 'rgba(124, 77, 211,0.05)' }}>
                <Layout.Vertical spacing="small">
                  <Text style={{ color: '#592BAA' }}>TOTAL SPEND TILL DATE</Text>
                  {graphLoading ? (
                    <Icon name="spinner" size={24} color="blue500" />
                  ) : (
                    <Heading level={1} style={{ color: '#592BAA' }}>
                      ${(Math.round(graphData?.response?.total_cost as number) * 100) / 100}
                    </Heading>
                  )}
                </Layout.Vertical>
              </Container>
              <Layout.Horizontal spacing="small" padding="small">
                <HighchartsReact
                  highchart={Highcharts}
                  options={
                    graphData?.response != null
                      ? geGaugeChartOptionsWithoutLabel(
                          getSavingsPercentage(
                            graphData?.response?.total_savings as number,
                            graphData?.response?.total_potential as number
                          )
                        )
                      : geGaugeChartOptionsWithoutLabel(0)
                  }
                  style={{ alignSelf: 'flex-end' }}
                />
                <Layout.Vertical spacing="xsmall">
                  <Text>SAVINGS PERCENTAGE</Text>
                  <Heading level={1}>
                    {graphData?.response != null
                      ? getSavingsPercentage(
                          graphData?.response?.total_savings as number,
                          graphData?.response?.total_potential as number
                        )
                      : 0}
                    %
                  </Heading>
                </Layout.Vertical>
              </Layout.Horizontal>
            </Layout.Vertical>
          </Layout.Vertical>
        </Layout.Horizontal>
      </Layout.Vertical>
    </Container>
  )
}

export default COGatewayCumulativeAnalytics
