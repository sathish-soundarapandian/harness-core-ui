/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef, useState, useLayoutEffect, useMemo, useCallback } from 'react'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import cx from 'classnames'
import { Container, Button, ButtonVariation, Accordion, Text, SelectOption, Layout } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import type { MetricsAnalysis, NodeRiskCountDTO } from 'services/cv'
import { useStrings } from 'framework/strings'
import { getRiskColorValue, getSecondaryRiskColorValue } from '@cv/utils/CommonUtils'
import { chartsConfig } from './DeeploymentMetricsChartConfig'
import { filterRenderCharts, transformControlAndTestDataToHighChartsSeries } from './DeploymentMetricsAnalysisRow.utils'
import type { DeploymentMetricsAnalysisRowChartSeries } from './DeploymentMetricsAnalysisRow.types'
import {
  widthPercentagePerGraph,
  HostTestData,
  HostControlTestData,
  ANALYSIS_REASON_MAPPING
} from './DeploymentMetricsAnalysisRow.constants'
import MetricAnalysisMetricThresolds from './components/MetricAnalysisMetricThresolds/MetricAnalysisMetricThresolds'
import css from './DeploymentMetricsAnalysisRow.module.scss'

export interface DeploymentMetricsAnalysisRowProps {
  transactionName: string
  metricName: string
  controlData?: HostControlTestData[]
  testData?: HostTestData[]
  normalisedControlData: HostControlTestData[]
  normalisedTestData: HostTestData[]
  className?: string
  risk?: MetricsAnalysis['analysisResult']
  nodeRiskCount?: NodeRiskCountDTO
  thresholds?: MetricsAnalysis['thresholds']
  selectedDataFormat: SelectOption
  healthSource: MetricsAnalysis['healthSource']
  deeplinkURL?: string
}

export function DeploymentMetricsAnalysisRow(props: DeploymentMetricsAnalysisRowProps): JSX.Element {
  const {
    controlData = [],
    testData = [],
    normalisedControlData = [],
    normalisedTestData = [],
    className,
    metricName,
    transactionName,
    thresholds,
    selectedDataFormat,
    healthSource
  } = props
  const graphContainerRef = useRef<HTMLDivElement>(null)
  const [graphWidth, setGraphWidth] = useState(0)
  const { type } = healthSource || {}

  const { controlDataInfo, testDataInfo } = useMemo(() => {
    const data1 = selectedDataFormat?.value === 'normalised' ? [...normalisedControlData] : [...controlData]
    const data2 = selectedDataFormat?.value === 'normalised' ? [...normalisedTestData] : [...testData]
    return {
      controlDataInfo: data1,
      testDataInfo: data2
    }
  }, [controlData, normalisedControlData, normalisedTestData, selectedDataFormat?.value, testData])

  const charts: DeploymentMetricsAnalysisRowChartSeries[][] = useMemo(() => {
    return transformControlAndTestDataToHighChartsSeries(controlDataInfo || [], testDataInfo || [])
  }, [controlDataInfo, testDataInfo])

  const [chartsOffset, setChartsOffset] = useState(1)
  const filteredCharts = filterRenderCharts(charts, chartsOffset)
  const { getString } = useStrings()

  const handleLoadMore = useCallback(() => {
    setChartsOffset(currentOffset => {
      return currentOffset + 1
    })
  }, [])

  useLayoutEffect(() => {
    if (!graphContainerRef?.current) {
      return
    }
    const containerWidth = graphContainerRef.current.getBoundingClientRect().width
    setGraphWidth(containerWidth / widthPercentagePerGraph)
  }, [graphContainerRef])

  return (
    <Container className={cx(css.main, className)}>
      <div className={css.graphs} ref={graphContainerRef}>
        <>
          {filteredCharts.map((series, index) => (
            <>
              <HighchartsReact
                key={index}
                highcharts={Highcharts}
                options={chartsConfig(series, graphWidth, testData?.[index], controlDataInfo?.[index], getString)}
              />
              <Container className={css.metricInfo} padding={{ bottom: 'small' }}>
                <Container
                  className={css.node}
                  background={getRiskColorValue(testDataInfo?.[index]?.risk, false)}
                ></Container>
                <Text
                  tooltip={testDataInfo?.[index]?.name}
                  font={{ variation: FontVariation.SMALL }}
                  margin={{ right: 'large' }}
                >
                  {`Test host: ${testDataInfo?.[index]?.name}`}
                </Text>
                <Container
                  style={{ borderColor: Color.PRIMARY_7 }}
                  className={css.node}
                  background={Color.PRIMARY_2}
                ></Container>
                <Text
                  tooltip={controlDataInfo?.[index]?.name as string}
                  font={{ variation: FontVariation.SMALL }}
                >{`Control host: ${controlDataInfo?.[index]?.name}`}</Text>
              </Container>
              <Container className={css.metricInfo}>
                <Text
                  font={{ variation: FontVariation.TABLE_HEADERS }}
                  color={getRiskColorValue(testDataInfo?.[index]?.risk, false)}
                  style={{ background: getSecondaryRiskColorValue(testDataInfo?.[index]?.risk) }}
                  className={css.metricRisk}
                  margin={{ right: 'small' }}
                >
                  {testDataInfo?.[index]?.risk}
                </Text>
                <Text font={{ variation: FontVariation.BODY2_SEMI }}>
                  {ANALYSIS_REASON_MAPPING[testDataInfo?.[index]?.analysisReason as string]}
                </Text>
              </Container>
            </>
          ))}
        </>
      </div>
      {filteredCharts.length < charts.length && (
        <Container style={{ textAlign: 'center' }}>
          <Button data-testid="loadMore_button" onClick={handleLoadMore} variation={ButtonVariation.LINK}>
            {getString('pipeline.verification.loadMore')}
          </Button>
        </Container>
      )}
      <Accordion allowMultiOpen>
        <Accordion.Panel
          key={`${transactionName}-${metricName}-${type}`}
          id={`${transactionName}-${metricName}-${type}`}
          summary={
            <Text
              font={{ variation: FontVariation.TABLE_HEADERS }}
              className={css.showDetailsText}
              margin={{ right: 'small' }}
            >
              Show details
            </Text>
          }
          details={<MetricAnalysisMetricThresolds thresholds={thresholds} />}
        />
      </Accordion>
    </Container>
  )
}
