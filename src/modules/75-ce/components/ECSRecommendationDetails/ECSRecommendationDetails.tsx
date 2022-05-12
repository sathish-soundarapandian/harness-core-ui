/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useRef, useState } from 'react'
import { Container, Layout, Text, Popover, Icon, Button } from '@harness/uicore'
import { PopoverInteractionKind, Position } from '@blueprintjs/core'
import { Color, FontVariation } from '@harness/design-system'
import cx from 'classnames'
import copy from 'copy-to-clipboard'
import { useQueryParamsState } from '@common/hooks/useQueryParamsState'
import { useStrings } from 'framework/strings'

import formatCost from '@ce/utils/formatCost'
import { getTimePeriodString } from '@ce/utils/momentUtils'
import { convertNumberToFixedDecimalPlaces } from '@ce/utils/convertNumberToFixedDecimalPlaces'
import { getECSMemValueInReadableForm, getRecommendationYaml } from '@ce/utils/formatResourceValue'
import { addBufferToValue, calculateSavingsPercentage } from '@ce/utils/recommendationUtils'
import type { TimeRangeValue, HistogramData, ResourceDetails, CustomHighcharts, ECSResourceObject } from '@ce/types'
import type { EcsRecommendationDto, RecommendationOverviewStats } from 'services/ce/services'

import requestLegend from '@ce/components/RecommendationDetails/images/request-legend.svg'
import histogramImg from '@ce/components/RecommendationDetails/images/histogram.gif'

import RecommendationTabs from '../RecommendationDetails/RecommendationTabs'
import { ChartColors, PercentileValues, RecommendationType } from '../RecommendationDetails/constants'
import { ECSRecommendationDiffViewer } from '../RecommendationDiffViewer/RecommendationDiffViewer'
import {
  RecommendationDetailsSavingsCard,
  RecommendationDetailsSpendCard
} from '../RecommendationDetailsSummaryCards/RecommendationDetailsSummaryCards'
import ECSRecommendationHistogram from '../RecommendationHistogram/ECSRecommendationHistogram'

import css from './ECSRecommendationDetails.module.scss'

export type EcsRecommendationDtoWithCurrentResources = EcsRecommendationDto & {
  currentResources: ResourceDetails
}

interface ECSRecommendationDetailsProps {
  recommendationStats: RecommendationOverviewStats
  timeRange: TimeRangeValue
  timeRangeFilter: string[]
  recommendationDetails: EcsRecommendationDtoWithCurrentResources
  buffer: number
}

const ECSRecommendationDetails: React.FC<ECSRecommendationDetailsProps> = ({
  recommendationStats,
  timeRangeFilter,
  recommendationDetails,
  timeRange,
  buffer
}) => {
  const { getString } = useStrings()

  const [selectedRecommendation, setSelectedRecommendation] = useQueryParamsState<RecommendationType>(
    'rType',
    RecommendationType.CostOptimized
  )

  const defaultReqVal =
    selectedRecommendation === RecommendationType.CostOptimized ? PercentileValues.P50 : PercentileValues.P95

  const [cpuReqVal, setCPUReqVal] = useState(defaultReqVal)
  const [memReqVal, setMemReqVal] = useState(defaultReqVal)

  const [reRenderChart, setRerenderChart] = useState(false)

  const cpuHistogram = recommendationDetails.cpuHistogram as HistogramData
  const memoryHistogram = recommendationDetails.memoryHistogram as HistogramData

  const cpuReqValue = Number(cpuHistogram.precomputed[cpuReqVal])
  const memReqValue = Number(memoryHistogram.precomputed[memReqVal])

  const isCostOptimizedCustomized =
    selectedRecommendation === RecommendationType.CostOptimized &&
    (cpuReqVal !== PercentileValues.P50 || memReqVal !== PercentileValues.P50)

  const isPerfOptimizedCustomized =
    selectedRecommendation === RecommendationType.PerformanceOptimized &&
    (cpuReqVal !== PercentileValues.P95 || memReqVal !== PercentileValues.P95)

  const cpuChartRef = useRef<CustomHighcharts>()
  const memoryChartRef = useRef<CustomHighcharts>()

  const setCPUChartRef: (chart: CustomHighcharts) => void = chart => {
    cpuChartRef.current = chart
  }

  const setMemoryChartRef: (chart: CustomHighcharts) => void = chart => {
    memoryChartRef.current = chart
  }

  const resetReqLimitMarkers: (reqCpu: number, reqMem: number) => void = (reqCpu, reqMem) => {
    cpuChartRef.current && cpuChartRef.current.rePlaceMarker(reqCpu)
    memoryChartRef.current && memoryChartRef.current.rePlaceMarker(reqMem)
  }

  /* istanbul ignore next */
  const resetToDefaultRecommendation: (recommendation: RecommendationType) => void = (
    recommendation: RecommendationType
  ) => {
    if (recommendation === RecommendationType.CostOptimized) {
      setCPUReqVal(PercentileValues.P50)
      setMemReqVal(PercentileValues.P50)
      resetReqLimitMarkers(PercentileValues.P50, PercentileValues.P50)
    } else if (recommendation === RecommendationType.PerformanceOptimized) {
      setCPUReqVal(PercentileValues.P95)
      setMemReqVal(PercentileValues.P95)
      resetReqLimitMarkers(PercentileValues.P95, PercentileValues.P95)
    }
    setRerenderChart(state => !state)
  }

  useEffect(() => {
    resetReqLimitMarkers(cpuReqVal, memReqVal)
  }, [selectedRecommendation, cpuReqVal, memReqVal])

  /* istanbul ignore next */
  const updateCPUChart: (val: number) => void = val => {
    const precomputed = cpuHistogram?.precomputed

    setCPUReqVal(val)
    const value = precomputed[val]

    cpuChartRef.current?.series[0].update({
      type: 'column',
      zones: [
        {
          value: value === undefined ? 0 : convertNumberToFixedDecimalPlaces(value, 3) + 0.0001,
          color: ChartColors.BLUE
        },
        {
          color: ChartColors.GREY
        }
      ]
    })
  }

  /* istanbul ignore next */
  const updateMemoryChart: (val: number) => void = val => {
    const precomputed = memoryHistogram?.precomputed

    const reqVal = val

    setMemReqVal(reqVal)

    const reqValHistogram = precomputed[reqVal]

    memoryChartRef.current?.series[0].update({
      type: 'column',
      zones: [
        {
          value: reqValHistogram === undefined ? 0 : convertNumberToFixedDecimalPlaces(reqValHistogram, 3) + 1,
          color: ChartColors.BLUE
        },
        {
          color: ChartColors.GREY
        }
      ]
    })
  }

  return (
    <Container>
      <Container padding="large" background={Color.WHITE} className={css.mainContainer}>
        <Layout.Horizontal padding={{ top: 'large' }}>
          <Container width="100%">
            <RecommendationDetailsSpendCard
              withRecommendationAmount={formatCost(
                recommendationStats?.totalMonthlyCost - recommendationStats?.totalMonthlySaving
              )}
              withoutRecommendationAmount={formatCost(recommendationStats?.totalMonthlyCost)}
              title={getString('ce.recommendation.listPage.monthlyPotentialCostText')}
              spentBy={getTimePeriodString(timeRangeFilter[1], 'MMM DD')}
            />
          </Container>
          <Container width="100%">
            <RecommendationDetailsSavingsCard
              amount={formatCost(recommendationStats?.totalMonthlySaving)}
              title={getString('ce.recommendation.listPage.monthlySavingsText')}
              amountSubTitle={calculateSavingsPercentage(
                recommendationStats?.totalMonthlySaving,
                recommendationStats?.totalMonthlyCost
              )}
              subTitle={`${getTimePeriodString(timeRangeFilter[0], 'MMM DD')} - ${getTimePeriodString(
                timeRangeFilter[1],
                'MMM DD'
              )}`}
            />
          </Container>
        </Layout.Horizontal>
        <RecommendationTabs
          selectedRecommendation={selectedRecommendation}
          setSelectedRecommendation={setSelectedRecommendation}
          setCPUReqVal={setCPUReqVal}
          setMemReqVal={setMemReqVal}
        />
        <DiffViewerContainer
          selectedRecommendation={selectedRecommendation}
          currentResources={{
            requests: {
              memory: getECSMemValueInReadableForm(recommendationDetails.currentResources.memory),
              cpu: recommendationDetails.currentResources.cpu
            }
          }}
          recommendedResources={{
            requests: {
              memory: getECSMemValueInReadableForm(addBufferToValue(memoryHistogram.precomputed[memReqVal], buffer, 3)),
              cpu: String(addBufferToValue(cpuHistogram.precomputed[cpuReqVal], buffer, 3) || 0)
            }
          }}
          copyRecommendation={
            /* istanbul ignore next */ () => {
              const yamlVal = getRecommendationYaml(
                addBufferToValue(cpuReqValue, buffer, 3),
                addBufferToValue(memReqValue, buffer, 3)
              )
              copy(yamlVal)
            }
          }
        />
        <TimeFrameHeader selectedRecommendation={selectedRecommendation} timeRange={timeRange} />
        <Container className={css.histogramContainer}>
          <ECSRecommendationHistogram
            reRenderChart={reRenderChart}
            updateMemoryChart={updateMemoryChart}
            updateCPUChart={updateCPUChart}
            cpuHistogram={cpuHistogram}
            memoryHistogram={memoryHistogram}
            selectedRecommendation={selectedRecommendation}
            cpuReqVal={cpuReqVal}
            memReqVal={memReqVal}
            onCPUChartLoad={setCPUChartRef}
            onMemoryChartLoad={setMemoryChartRef}
          />
        </Container>
        <Container className={css.legendContainer}>
          <Container>
            {isPerfOptimizedCustomized || isCostOptimizedCustomized ? (
              <Button
                onClick={() => {
                  resetToDefaultRecommendation(selectedRecommendation)
                }}
                icon="reset-icon"
                withoutBoxShadow={true}
                intent="none"
                className={css.resetButton}
              >
                {getString('ce.recommendation.detailsPage.resetRecommendationText', {
                  recommendationType: selectedRecommendation
                })}
              </Button>
            ) : null}
          </Container>
          <img src={requestLegend} />
          <Text color={Color.GREY_500} font={{ variation: FontVariation.TINY_SEMI }}>
            {getString('ce.recommendation.detailsPage.reqPercentileLegendText')}
          </Text>
        </Container>
      </Container>
    </Container>
  )
}

export default ECSRecommendationDetails

interface DiffViewerContainerProps {
  currentResources: ECSResourceObject
  recommendedResources: ECSResourceObject
  selectedRecommendation: RecommendationType
  copyRecommendation: () => void
}

const DiffViewerContainer: React.FC<DiffViewerContainerProps> = ({
  copyRecommendation,
  currentResources,
  recommendedResources,
  selectedRecommendation
}) => {
  const { getString } = useStrings()

  return (
    <section className={css.diffContainer}>
      <Text
        padding="xsmall"
        color={Color.GREY_700}
        font={{ variation: FontVariation.TABLE_HEADERS, align: 'center' }}
        background={Color.GREY_100}
      >
        {getString('ce.recommendation.detailsPage.resourceChanges')}
      </Text>
      <section className={css.diffHeader}>
        <Layout.Horizontal className={css.heading} spacing="xsmall">
          <Text font={{ variation: FontVariation.SMALL_SEMI }}>{getString('common.current')}</Text>
          <Text font={{ variation: FontVariation.SMALL }}>
            {getString('ce.recommendation.detailsPage.ecsRecommendedResources')}
          </Text>
        </Layout.Horizontal>
        <Layout.Horizontal className={cx(css.optimizedHeader, css.heading)} spacing="xsmall">
          <Text font={{ variation: FontVariation.SMALL_SEMI }}>{selectedRecommendation}</Text>
          <Text font={{ variation: FontVariation.SMALL }}>
            {getString('ce.recommendation.detailsPage.ecsRecommendedResources')}
          </Text>
          <Icon
            name="duplicate"
            color={Color.PRIMARY_5}
            onClick={copyRecommendation}
            className={css.copyIcon}
            size={13}
          />
        </Layout.Horizontal>
      </section>
      <ECSRecommendationDiffViewer recommendedResources={recommendedResources} currentResources={currentResources} />
    </section>
  )
}

interface TimeFrameHeaderProps {
  selectedRecommendation: RecommendationType
  timeRange: TimeRangeValue
}

const TimeFrameHeader: React.FC<TimeFrameHeaderProps> = ({ selectedRecommendation, timeRange }) => {
  const { getString } = useStrings()
  return (
    <Container className={css.timeframeContainer}>
      <Layout.Horizontal
        background={Color.GREY_100}
        padding="xsmall"
        style={{
          alignItems: 'baseline',
          justifyContent: 'center'
        }}
        spacing="xsmall"
      >
        <Text color={Color.GREY_700} font={{ variation: FontVariation.TABLE_HEADERS }}>
          {selectedRecommendation === RecommendationType.CostOptimized
            ? getString('ce.recommendation.detailsPage.costOptimizedCaps')
            : getString('ce.recommendation.detailsPage.performanceOptimizedCaps')}
        </Text>
        <Popover
          interactionKind={PopoverInteractionKind.HOVER}
          position={Position.BOTTOM_LEFT}
          usePortal={false}
          modifiers={{
            arrow: { enabled: false },
            flip: { enabled: true },
            keepTogether: { enabled: true },
            preventOverflow: { enabled: true }
          }}
          content={
            <Container padding="medium" className={css.histogram}>
              <Layout.Horizontal spacing="medium">
                <img width="235" src={histogramImg} />
                <Text>{getString('ce.recommendation.detailsPage.histogramTextDetails1')}</Text>
              </Layout.Horizontal>
              <Text padding={{ top: 'small' }}>{getString('ce.recommendation.detailsPage.histogramTextDetails2')}</Text>
            </Container>
          }
        >
          <Text color={Color.PRIMARY_7} className={css.actionText} font={{ variation: FontVariation.TABLE_HEADERS }}>
            {getString('ce.recommendation.detailsPage.histogramText')}
          </Text>
        </Popover>
        <Text color={Color.GREY_700} font={{ variation: FontVariation.TABLE_HEADERS, align: 'center' }}>
          {getString('ce.recommendation.detailsPage.timeChangeText')}
        </Text>
        <Text color={Color.GREY_700} font={{ variation: FontVariation.TABLE_HEADERS }} className={css.actionText}>
          {timeRange?.label}
        </Text>
      </Layout.Horizontal>
    </Container>
  )
}
