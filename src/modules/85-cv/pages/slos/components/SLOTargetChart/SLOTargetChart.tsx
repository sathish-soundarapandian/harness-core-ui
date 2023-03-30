/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import { merge } from 'lodash-es'
import { Container, Icon, Text, PageError, NoDataCard, Layout } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { useStrings } from 'framework/strings'
import type { DataPoints } from 'services/cv'
import { TimeSeriesAreaChart } from '@common/components'
import NoChartDataImage from '@cv/assets/noChartData.svg'
import {
  getDefaultChartOptions,
  getMetricAndAreaChartCustomProps,
  getSLIGraphData,
  getMetricTitleAndLoading
} from './SLOTargetChart.utils'
import type { SLOTargetChartProps, SLOTargetChartWithAPIGetSliGraphProps } from './SLOTargetChart.types'
import { convertServiceLevelIndicatorToSLIFormData } from '../CVCreateSLOV2/CVCreateSLOV2.utils'
import { SLIMetricChart } from './components/SLIMetricChart/SLIMetricChart'
import { SLIMetricEnum } from '../../common/SLI/SLI.constants'
import { useConfigureSLIContext } from '../../common/SLI/SLIContext'
import css from './SLOTargetChart.module.scss'

export const SLOTargetChart: React.FC<SLOTargetChartProps> = ({
  topLabel,
  bottomLabel,
  dataPoints,
  customChartOptions
}) => {
  const finalChartOptions = useMemo(() => merge(getDefaultChartOptions(), customChartOptions), [customChartOptions])

  const seriesData: Omit<Highcharts.SeriesColumnOptions, 'type'>[] = [
    {
      data: dataPoints,
      showInLegend: false
    }
  ]

  return (
    <div>
      {topLabel}
      <TimeSeriesAreaChart customChartOptions={finalChartOptions} seriesData={seriesData} />
      {bottomLabel}
    </div>
  )
}

const SLOTargetChartWithAPIGetSliGraph: React.FC<SLOTargetChartWithAPIGetSliGraphProps> = ({
  topLabel,
  bottomLabel,
  customChartOptions,
  serviceLevelIndicator,
  monitoredServiceIdentifier,
  sliGraphData,
  loading,
  error,
  retryOnError,
  showMetricChart
}) => {
  const { getString } = useStrings()
  const dataPoints = useMemo(
    () => sliGraphData?.dataPoints?.map(point => [Number(point.timeStamp) || 0, Number(point.value) || 0]),
    [sliGraphData?.dataPoints]
  )
  const { spec: SLISpec } = serviceLevelIndicator || {}
  const { type, spec } = SLISpec || {}

  const containerHeight = showMetricChart ? '250px' : '100%'

  if (
    (type === SLIMetricEnum.RATIO && (spec?.thresholdValue > 100 || !spec?.thresholdValue)) ||
    (type === SLIMetricEnum.THRESHOLD && !spec?.thresholdValue)
  ) {
    let message = ''
    if (type === SLIMetricEnum.RATIO) {
      message = !spec?.thresholdValue
        ? getString('cv.pleaseFillTheRequiredFieldsToSeeTheSLIData')
        : getString('cv.slos.ratioObjectiveValueCheck')
    } else if (type === SLIMetricEnum.THRESHOLD) {
      message = getString('cv.pleaseFillTheRequiredFieldsToSeeTheSLIData')
    }
    return (
      <Container flex={{ justifyContent: 'center' }} height={containerHeight}>
        <NoDataCard image={NoChartDataImage} containerClassName={css.noData} message={message} />
      </Container>
    )
  }

  if (loading) {
    return (
      <Container flex={{ justifyContent: 'center' }} height={containerHeight}>
        <Icon name="steps-spinner" color={Color.GREY_400} size={30} />
      </Container>
    )
  }

  if (error) {
    return (
      <Container flex={{ justifyContent: 'center' }} height={containerHeight}>
        <PageError
          width={400}
          message={error}
          onClick={() => retryOnError(serviceLevelIndicator, monitoredServiceIdentifier)}
        />
      </Container>
    )
  }

  if (!dataPoints || dataPoints?.length === 0) {
    return (
      <Container flex={{ justifyContent: 'center' }} height={containerHeight} width={'100%'}>
        <NoDataCard
          image={NoChartDataImage}
          containerClassName={css.noData}
          message={getString('cv.pleaseFillTheRequiredFieldsToSeeTheSLIData')}
        />
      </Container>
    )
  }

  return (
    <SLOTargetChart
      topLabel={topLabel}
      bottomLabel={bottomLabel}
      customChartOptions={customChartOptions}
      dataPoints={dataPoints}
    />
  )
}

const SLOTargetChartWrapper: React.FC<SLOTargetChartWithAPIGetSliGraphProps> = props => {
  const { getString } = useStrings()

  const getEmptyState = (message?: string) => (
    <Container flex={{ justifyContent: 'center' }} width={'100%'} margin={{ top: 'xlarge' }}>
      <NoDataCard
        image={NoChartDataImage}
        containerClassName={css.noData}
        message={message || getString('cv.pleaseFillTheRequiredFieldsToSeeTheSLIData')}
      />
    </Container>
  )

  const { isRatioBased, isWindowBased, showSLIMetricChart } = useConfigureSLIContext()
  const { serviceLevelIndicator, sliGraphData, metricChart, metricsNames, showMetricChart } = props
  const {
    data: metricData,
    loading: metricLoading,
    error: metricError,
    retryOnError: retryMetricOnError
  } = metricChart || {}
  const { metricGraphs, metricPercentageGraph } = metricData || {}
  const { activeGoodMetric, activeValidMetric } = metricsNames || {}

  const { SLIMetricType, validRequestMetric, eventType, goodRequestMetric } =
    convertServiceLevelIndicatorToSLIFormData(serviceLevelIndicator)

  const isInvalidRatioBased =
    !eventType || !(goodRequestMetric || validRequestMetric) || validRequestMetric === goodRequestMetric
  const isGoodAndValidMetricSame = validRequestMetric === goodRequestMetric

  const areaSLIGraphData = getSLIGraphData({
    sliGraphData,
    isRatioBased,
    goodRequestMetric,
    validRequestMetric,
    SLIMetricType
  })

  const { showSLIAreaChart, validRequestGraphColor } = getMetricAndAreaChartCustomProps(
    isWindowBased,
    isRatioBased,
    goodRequestMetric,
    validRequestMetric
  )

  if (showSLIMetricChart || showSLIAreaChart) {
    if (isRatioBased && isInvalidRatioBased) {
      return getEmptyState(
        isGoodAndValidMetricSame ? getString('cv.metricForGoodAndValidRequestsShouldBeDifferent') : ''
      )
    }

    const {
      goodRequestMetricLoading,
      goodRequestMetricTitle,
      validRequestMetricLoading,
      validRequestMetricTitle,
      metricPercentageGraphTitle
    } = getMetricTitleAndLoading({
      getString,
      eventType,
      metricGraphs,
      goodRequestMetric,
      validRequestMetric,
      metricLoading,
      activeGoodMetric,
      activeValidMetric
    })

    return (
      <Layout.Vertical spacing="small">
        {showSLIMetricChart && showMetricChart && (
          <Layout.Vertical spacing="large" margin={{ bottom: 'xlarge' }}>
            {goodRequestMetric && (
              <SLIMetricChart
                loading={goodRequestMetricLoading}
                title={goodRequestMetricTitle}
                error={metricError}
                subTitle={getString('cv.slos.sliMetricChartSubHeader')}
                metricName={goodRequestMetric}
                dataPoints={
                  metricGraphs?.[goodRequestMetric || '']?.dataPoints?.map((graphData: DataPoints) => [
                    graphData.timeStamp,
                    graphData.value
                  ]) || []
                }
                retryOnError={retryMetricOnError}
              />
            )}
            {validRequestMetric && (
              <SLIMetricChart
                showLegend={(isWindowBased && !isRatioBased) || isWindowBased}
                loading={validRequestMetricLoading}
                title={validRequestMetricTitle}
                error={metricError}
                subTitle={getString('cv.slos.sliMetricChartSubHeader')}
                metricName={validRequestMetric}
                dataPoints={
                  metricGraphs?.[validRequestMetric || '']?.dataPoints?.map((graphData: DataPoints) => [
                    graphData.timeStamp,
                    graphData.value
                  ]) || []
                }
                retryOnError={retryMetricOnError}
                {...validRequestGraphColor}
              />
            )}
            {validRequestMetric && goodRequestMetric && (
              <SLIMetricChart
                showLegend
                legendTypePercentage
                loading={metricLoading}
                error={metricError}
                metricName={'ratio'}
                title={metricPercentageGraphTitle}
                dataPoints={
                  metricPercentageGraph?.dataPoints?.map((graphData: DataPoints) => [
                    graphData.timeStamp,
                    graphData.value
                  ]) || []
                }
                retryOnError={retryMetricOnError}
              />
            )}
          </Layout.Vertical>
        )}
        <Layout.Vertical spacing="small">
          {showSLIAreaChart && (
            <>
              <Text
                color={Color.PRIMARY_10}
                font={{ size: 'normal', weight: 'semi-bold' }}
                margin={{ bottom: 'small' }}
              >
                {getString('cv.slos.slis.SLIChartTitle')}
              </Text>
              <SLOTargetChartWithAPIGetSliGraph {...props} sliGraphData={areaSLIGraphData} />
            </>
          )}
        </Layout.Vertical>
      </Layout.Vertical>
    )
  }

  return getEmptyState()
}

export default SLOTargetChartWrapper
