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
import { DATE_RANGE_SHORTCUTS, getTimePeriodString } from '@ce/utils/momentUtils'
import { convertNumberToFixedDecimalPlaces } from '@ce/utils/convertNumberToFixedDecimalPlaces'
import {
  getCPUValueInCPUFromExpression,
  getECSMemValueInReadableForm,
  getECSRecommendationYaml,
  getECSMemValueFromExpression
} from '@ce/utils/formatResourceValue'
import {
  addBufferWithoutPrecision,
  calculateSavingsPercentage,
  DAYS_IN_A_MONTH,
  getECSFargateResourceValues
} from '@ce/utils/recommendationUtils'
import type { TimeRangeValue, HistogramData, ResourceDetails, CustomHighcharts, ECSResourceObject } from '@ce/types'
import { EcsRecommendationDto, LaunchType, RecommendationOverviewStats } from 'services/ce/services'

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
  recommendationDetails: EcsRecommendationDtoWithCurrentResources
  buffer: number
}

const ECSRecommendationDetails: React.FC<ECSRecommendationDetailsProps> = ({
  recommendationStats,
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

  const currentCPUResource = getCPUValueInCPUFromExpression(recommendationDetails.currentResources.cpu || 1)
  const currentMemResource = getECSMemValueFromExpression(recommendationDetails.currentResources.memory)

  const cpuHistogram = recommendationDetails.cpuHistogram as HistogramData
  const memoryHistogram = recommendationDetails.memoryHistogram as HistogramData

  const { cpu: cpuCost, memory: memoryCost } = recommendationDetails?.lastDayCost || {}

  const cpuReqValueWithBuffer = addBufferWithoutPrecision(Number(cpuHistogram.precomputed[cpuReqVal]), buffer)
  const memReqValueWithBuffer = addBufferWithoutPrecision(Number(memoryHistogram.precomputed[memReqVal]), buffer)

  const fargateResourceValues = getECSFargateResourceValues(cpuReqValueWithBuffer, memReqValueWithBuffer)

  const isFargateRecommendation = recommendationDetails.launchType === LaunchType.Fargate

  const { currentCPU: fargateCurrentCPU, currentMemoryGB: fargateCurrentMem } = fargateResourceValues

  const cpuReqValue = isFargateRecommendation ? fargateCurrentCPU : cpuReqValueWithBuffer
  const memReqValue = isFargateRecommendation ? fargateCurrentMem : memReqValueWithBuffer

  const perfCPUReqValueWithBuffer = addBufferWithoutPrecision(Number(cpuHistogram.precomputed[95]), buffer)
  const perfMemReqValueWithBuffer = addBufferWithoutPrecision(Number(memoryHistogram.precomputed[95]), buffer)

  const { currentCPU: perfFargateCurrentCPU, currentMemoryGB: perfFargateCurrentMem } = getECSFargateResourceValues(
    perfCPUReqValueWithBuffer,
    perfMemReqValueWithBuffer
  )

  const perfCPUReqValue = isFargateRecommendation ? perfFargateCurrentCPU : perfCPUReqValueWithBuffer
  const perfMemReqValue = isFargateRecommendation ? perfFargateCurrentMem : perfMemReqValueWithBuffer

  const costOptimisedCPUReqValueWithBuffer = addBufferWithoutPrecision(Number(cpuHistogram.precomputed[50]), buffer)
  const costOptimisedMemReqValueWithBuffer = addBufferWithoutPrecision(Number(memoryHistogram.precomputed[50]), buffer)

  const { currentCPU: costFargateCurrentCPU, currentMemoryGB: costFargateCurrentMem } = getECSFargateResourceValues(
    costOptimisedCPUReqValueWithBuffer,
    costOptimisedMemReqValueWithBuffer
  )

  const costOptimisedCPUReqValue = isFargateRecommendation ? costFargateCurrentCPU : costOptimisedCPUReqValueWithBuffer
  const costOptimisedMemReqValue = isFargateRecommendation ? costFargateCurrentMem : costOptimisedMemReqValueWithBuffer

  const isLastDayCostDefined = cpuCost && memoryCost

  const numCPUCost = Number(cpuCost)
  const numMemCost = Number(memoryCost)

  const currentSavings = isLastDayCostDefined
    ? (((currentCPUResource - getCPUValueInCPUFromExpression(cpuReqValue)) / currentCPUResource) * numCPUCost +
        ((currentMemResource - getECSMemValueFromExpression(memReqValue)) / currentMemResource) * numMemCost) *
      DAYS_IN_A_MONTH
    : -1

  const performanceOptimizedSavings = isLastDayCostDefined
    ? (((currentCPUResource - getCPUValueInCPUFromExpression(perfCPUReqValue)) / currentCPUResource) * numCPUCost +
        ((currentMemResource - getECSMemValueFromExpression(perfMemReqValue)) / currentMemResource) * numMemCost) *
      DAYS_IN_A_MONTH
    : -1

  const costOptimizedSavings = isLastDayCostDefined
    ? (((currentCPUResource - getCPUValueInCPUFromExpression(costOptimisedCPUReqValue)) / currentCPUResource) *
        numCPUCost +
        ((currentMemResource - getECSMemValueFromExpression(costOptimisedMemReqValue)) / currentMemResource) *
          numMemCost) *
      DAYS_IN_A_MONTH
    : -1

  const isCostOptimizedCustomized =
    selectedRecommendation === RecommendationType.CostOptimized && currentSavings !== costOptimizedSavings

  const isPerfOptimizedCustomized =
    selectedRecommendation === RecommendationType.PerformanceOptimized && currentSavings !== performanceOptimizedSavings

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

    setCPUReqVal(Math.max(val, 0))
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

    const reqVal = Math.max(val, 0)

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
              withRecommendationAmount={formatCost(recommendationStats?.totalMonthlyCost - currentSavings)}
              withoutRecommendationAmount={formatCost(recommendationStats?.totalMonthlyCost)}
              title={getString('ce.recommendation.listPage.monthlyPotentialCostText')}
              spentBy={getTimePeriodString(+DATE_RANGE_SHORTCUTS.THIS_MONTH[1], 'MMM DD')}
            />
          </Container>
          <Container width="100%">
            <RecommendationDetailsSavingsCard
              amount={formatCost(currentSavings)}
              title={getString('ce.recommendation.listPage.monthlySavingsText')}
              amountSubTitle={calculateSavingsPercentage(currentSavings, recommendationStats?.totalMonthlyCost)}
              subTitle={`${getTimePeriodString(+DATE_RANGE_SHORTCUTS.THIS_MONTH[0], 'MMM DD')} - ${getTimePeriodString(
                +DATE_RANGE_SHORTCUTS.THIS_MONTH[1],
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
              memory: getECSMemValueInReadableForm(convertNumberToFixedDecimalPlaces(memReqValue, 3)),
              cpu: String(convertNumberToFixedDecimalPlaces(cpuReqValue, 3))
            }
          }}
          copyRecommendation={
            /* istanbul ignore next */ () => {
              const yamlVal = getECSRecommendationYaml(
                convertNumberToFixedDecimalPlaces(cpuReqValue, 3),
                convertNumberToFixedDecimalPlaces(memReqValue, 3)
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
