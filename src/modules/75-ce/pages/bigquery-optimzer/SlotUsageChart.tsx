import React, { useEffect, useState } from 'react'
import {
  Color,
  Container,
  FontVariation,
  Layout,
  Text,
  PillToggle,
  Icon,
  OverlaySpinner,
  FlexExpander,
  Button,
  ButtonSize,
  ButtonVariation,
  useToaster
} from '@harness/uicore'
import { useParams } from 'react-router-dom'
import CEChart from '@ce/components/CEChart/CEChart'
import { useBuySlots, useGetSlotStats, useReleaseSlots } from 'services/ce'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import formatCost from '@ce/utils/formatCost'
// import requestMarker from '../../components/RecommendationHistogram/images/requestMarker.svg'
import data from './data.json'
import css from './BigQuery.module.scss'

const InfoBlock = ({ label, subLabel, value, isCost }) => {
  return (
    <Container>
      <Text font={{ variation: FontVariation.SMALL }}>{label}</Text>
      <Text
        padding={{
          top: 'xsmall',
          bottom: 'xsmall'
        }}
        iconProps={{
          size: 24
        }}
        font={{ variation: FontVariation.H3 }}
      >
        {isCost ? formatCost(value) : value}
      </Text>
      <Text font={{ variation: FontVariation.SMALL }}>{subLabel}</Text>
    </Container>
  )
}

const enum OptimizationType {
  COST_OPTIMIZED = 'COST_OPTIMIZED',
  PERFORMANCE_OPTIMIZED = 'PERFORMANCE_OPTIMIZED'
}

const enum TimeRange {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY'
}

const Configurations = ({
  setCommitmentDuration,
  setOptimisationType,
  optimisationType,
  commitmentDuration,
  setShouldFetch,
  setIsEditing,
  selectedSlots
}) => {
  const { accountId } = useParams<AccountPathProps>()
  const { showSuccess, showError } = useToaster()
  const { data, refetch } = useBuySlots({
    queryParams: {
      accountIdentifier: accountId
    },
    lazy: true
  })

  const { refetch: releaseSlots } = useReleaseSlots({
    queryParams: {
      accountIdentifier: accountId
    },
    lazy: true
  })

  const toggleEditing = () => {
    setIsEditing(val => !val)
  }
  return (
    <Layout.Horizontal spacing="large" margin={{ top: 'small', bottom: 'small' }}>
      <Container className={css.pillToggleContainer}>
        <Text font={{ variation: FontVariation.SMALL }} margin={{ right: 'small' }}>
          Optimisation Type
        </Text>
        <PillToggle
          onChange={val => {
            setShouldFetch(true)
            setOptimisationType(val)
          }}
          className={css.pill}
          options={[
            {
              label: 'Cost Optimised',
              value: OptimizationType.COST_OPTIMIZED
            },
            {
              label: 'Performance Optimised',
              value: OptimizationType.PERFORMANCE_OPTIMIZED
            }
          ]}
          selectedView={optimisationType}
        />
      </Container>
      <Container className={css.pillToggleContainer}>
        <Text font={{ variation: FontVariation.SMALL }} margin={{ right: 'small' }}>
          Commitment Duration
        </Text>
        <PillToggle
          className={css.pill2}
          onChange={val => {
            setShouldFetch(true)
            setCommitmentDuration(val)
          }}
          options={[
            {
              label: 'Monthly',
              value: TimeRange.MONTHLY
            },
            {
              label: 'Yearly',
              value: TimeRange.YEARLY
            }
          ]}
          selectedView={commitmentDuration}
        />
      </Container>
      <FlexExpander />
      <Container>
        <Button
          text={`Buy ${selectedSlots} Slots`}
          icon="small-tick"
          variation={ButtonVariation.PRIMARY}
          size={ButtonSize.SMALL}
          onClick={() => {
            refetch({
              queryParams: {
                accountIdentifier: accountId,
                slotCount: selectedSlots
              }
            })
            showSuccess(`Successfully Bought ${selectedSlots}`)
          }}
          margin={{
            right: 'small'
          }}
        />
        <Button
          icon="cross"
          size={ButtonSize.SMALL}
          margin={{
            right: 'small'
          }}
          onClick={() => {
            releaseSlots({
              queryParams: {
                accountIdentifier: accountId,
                slotCount: selectedSlots
              }
            })
            showSuccess(`Successfully Released All Slots`)
          }}
          text="Release All Slots"
          intent="danger"
          variation={ButtonVariation.PRIMARY}
        />
        <Button
          icon="small-cross"
          text="Cancel"
          variation={ButtonVariation.SECONDARY}
          size={ButtonSize.SMALL}
          onClick={toggleEditing}
        />
      </Container>
    </Layout.Horizontal>
  )
}

const InfoComponent = ({
  data,
  setCommitmentDuration,
  setOptimisationType,
  optimisationType,
  commitmentDuration,
  selectedSlots,
  setShouldFetch,
  setIsEditing
}) => {
  return (
    <Container>
      <Configurations
        setCommitmentDuration={setCommitmentDuration}
        setOptimisationType={setOptimisationType}
        optimisationType={optimisationType}
        commitmentDuration={commitmentDuration}
        setShouldFetch={setShouldFetch}
        setIsEditing={setIsEditing}
        selectedSlots={selectedSlots}
      />
      <Layout.Horizontal
        margin={{
          top: 'large',
          bottom: 'large'
        }}
        spacing="large"
      >
        <InfoBlock label={'Potential savings'} subLabel="per month" isCost={true} value={data.potentialSavings} />
        <InfoBlock
          label={'On-demand Slots used'}
          subLabel="per month"
          isCost={false}
          value={data.averageOnDemandSlots}
        />
        <InfoBlock
          label={'Recommended Slots for Purchase'}
          subLabel="per month"
          isCost={false}
          value={data.recommendedSlots}
        />
        <InfoBlock label={'Selected Slots'} subLabel="per month" isCost={false} value={selectedSlots} />
      </Layout.Horizontal>
    </Container>
  )
}

const SlotUsageChart = ({ isEditing, setIsEditing }) => {
  const [yVal, setYVal] = useState(0)
  const [optimisationType, setOptimisationType] = useState(OptimizationType.COST_OPTIMIZED)
  const [commitmentDuration, setCommitmentDuration] = useState(TimeRange.MONTHLY)
  const [slotsForApi, setSlotsForApi] = useState(0)
  const [selectedSlots, setSelectedSlots] = useState(0)
  const { accountId } = useParams<AccountPathProps>()

  const queryParams = {
    accountIdentifier: accountId,
    optimizationType: optimisationType,
    commitmentDuration: commitmentDuration
  }

  if (slotsForApi) {
    queryParams.slotCount = slotsForApi
  }

  const {
    data: apiData,
    loading,
    refetch
  } = useGetSlotStats({
    queryParams: queryParams
  })

  const realData = apiData?.data

  const slotStats = {
    potentialSavings: realData?.potentialSavings || 0,
    recommendedSlots: realData?.recommendedSlots || 0,
    coveragePercentage: realData?.coveragePercentage || 0,
    averageOnDemandSlots: realData?.averageOnDemandSlots?.toFixed(0) || 0
  }

  useEffect(() => {
    realData?.recommendedSlots && setSelectedSlots(realData?.recommendedSlots)
  }, [realData?.recommendedSlots])

  const plotOptions = {
    series: {
      connectNulls: true,
      animation: {
        duration: 500
      },
      marker: {
        enabled: false
      }
    },
    area: {
      lineWidth: 1,
      marker: {
        enabled: false
      }
    },
    legend: {
      enabled: true,
      align: 'right',
      verticalAlign: 'middle',
      layout: 'vertical'
    }
  }

  if (!realData) {
    return (
      <Container className={css.loadingContainer} background={Color.WHITE} padding="small">
        <Icon name="spinner" color={Color.BLUE_500} size={32} />
      </Container>
    )
  }

  return (
    <Container background={Color.WHITE} padding="small">
      <OverlaySpinner show={loading}>
        {isEditing ? (
          <InfoComponent
            setCommitmentDuration={setCommitmentDuration}
            setOptimisationType={setOptimisationType}
            optimisationType={optimisationType}
            commitmentDuration={commitmentDuration}
            selectedSlots={selectedSlots}
            data={slotStats}
            setIsEditing={setIsEditing}
            setShouldFetch={() => {}}
          />
        ) : null}
        <CEChart
          options={{
            series: [
              {
                yAxis: 0,
                name: 'Slots',
                data: data.stats.map(item => [item[0], item[1]])
              }
            ],
            yAxis: [
              {
                labels: {
                  format: '{value}'
                },
                title: {
                  text: 'Number of Slots'
                },
                opposite: true,
                plotBands: [
                  {
                    color: 'rgba(0,173,228,.1)',
                    from: 0,
                    to: selectedSlots
                  }
                ]
              }
            ],
            chart: {
              height: 300,
              spacingTop: 20,
              events: {
                load() {
                  const chart = this

                  // const plotLine = chart.renderer
                  //   .image(requestMarker, 0, 20, 320, 20)
                  //   .attr({
                  //     zIndex: 3
                  //   })
                  //   .add() as any

                  const plotLine = chart.renderer
                    .rect(
                      chart.plotLeft,
                      chart.yAxis[0].toPixels(realData.recommendedSlots),
                      chart.plotWidth + 30,
                      1,
                      1
                    )
                    .attr({
                      'stroke-width': 1,
                      stroke: '#3DC7F6',
                      fill: 'yellow',
                      zIndex: 3
                    })
                    .add()

                  chart.container.onmousemove = function (e) {
                    const chartEvent = e as any
                    chart.pointer.normalize(chartEvent)

                    const extremes = {
                      top: chart.plotTop,
                      bottom: chart.plotTop + chart.plotHeight
                    }

                    if (plotLine.drag) {
                      if (chartEvent.chartY >= extremes.top - 10 && chartEvent.chartY <= extremes.bottom - 10) {
                        plotLine.attr({ y: chartEvent.chartY })
                        plotLine.chartY = chartEvent.chartY

                        const value = Number(chart.yAxis[0].toValue(chartEvent.chartY).toFixed(0))
                        plotLine.value = value
                        setSelectedSlots(value)

                        chart.update({
                          yAxis: {
                            labels: {
                              format: '{value}'
                            },
                            title: {
                              text: 'Total Query Cost'
                            },
                            opposite: true,
                            plotBands: [
                              {
                                color: 'rgba(0,173,228,.1)',
                                from: 0,
                                to: value
                              }
                            ]
                          }
                        })
                      }
                    }
                  }

                  plotLine.element.onmousedown = function () {
                    plotLine.drag = true
                  }

                  plotLine.element.onmouseup = function () {
                    plotLine.drag = false
                    const roundedVal = Math.round(plotLine.value / 100) * 100
                    const yPos = chart.yAxis[0].toPixels(roundedVal)
                    plotLine.attr({ y: yPos })
                    plotLine.chartY = yPos
                    setSelectedSlots(roundedVal)
                    setSlotsForApi(roundedVal)
                  }
                }
              }
            },
            plotOptions
          }}
        />
      </OverlaySpinner>
    </Container>
  )
}

export default SlotUsageChart
