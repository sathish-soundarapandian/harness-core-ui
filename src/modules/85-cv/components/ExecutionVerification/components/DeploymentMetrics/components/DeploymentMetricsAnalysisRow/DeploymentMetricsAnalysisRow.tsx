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
import { Container, Button, ButtonVariation, Accordion, Text, SelectOption } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import type { AnalysedDeploymentTestDataNode, MetricsAnalysis, NodeRiskCountDTO } from 'services/cv'
import { useStrings } from 'framework/strings'
import { getRiskColorValue, getSecondaryRiskColorValue } from '@cv/utils/CommonUtils'
import { chartsConfig } from './DeeploymentMetricsChartConfig'
import {
  filterRenderCharts,
  getControlDataType,
  transformControlAndTestDataToHighChartsSeries
} from './DeploymentMetricsAnalysisRow.utils'
import type { DeploymentMetricsAnalysisRowChartSeries } from './DeploymentMetricsAnalysisRow.types'
import {
  widthPercentagePerGraph,
  HostTestData,
  HostControlTestData,
  getAnalysisReason,
  MINIMUM_DEVIATION
} from './DeploymentMetricsAnalysisRow.constants'
import MetricAnalysisMetricThresolds from './components/MetricAnalysisMetricThresolds/MetricAnalysisMetricThresolds'
import css from './DeploymentMetricsAnalysisRow.module.scss'

export interface DeploymentMetricsAnalysisRowProps {
  transactionName: string
  metricName: string
  controlData?: HostControlTestData[]
  testData?: HostTestData[]
  className?: string
  risk?: MetricsAnalysis['analysisResult']
  nodeRiskCount?: NodeRiskCountDTO
  thresholds?: MetricsAnalysis['thresholds']
  selectedDataFormat: SelectOption
  healthSource: MetricsAnalysis['healthSource']
  deeplinkURL?: string
  appliedThresholds?: AnalysedDeploymentTestDataNode['appliedThresholds']
}

export function DeploymentMetricsAnalysisRow(props: DeploymentMetricsAnalysisRowProps): JSX.Element {
  const {
    controlData = [],
    testData = [],
    className,
    metricName,
    transactionName,
    thresholds,
    healthSource,
    appliedThresholds
  } = props
  const { getString } = useStrings()
  const graphContainerRef = useRef<HTMLDivElement>(null)
  const [graphWidth, setGraphWidth] = useState(0)
  const { type } = healthSource || {}

  const charts: DeploymentMetricsAnalysisRowChartSeries[][] = useMemo(() => {
    return transformControlAndTestDataToHighChartsSeries(controlData || [], testData || [])
  }, [controlData, testData])

  const [chartsOffset, setChartsOffset] = useState(1)
  const filteredCharts = filterRenderCharts(charts, chartsOffset)

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
                options={chartsConfig(series, graphWidth, testData?.[index], controlData?.[index], getString)}
              />
              <Container className={css.metricInfo} padding={{ bottom: 'small', left: 'small' }}>
                <Container
                  className={css.node}
                  background={getRiskColorValue(testData?.[index]?.risk, false)}
                ></Container>
                <Text
                  tooltip={testData?.[index]?.name}
                  font={{ variation: FontVariation.SMALL }}
                  margin={{ right: 'large' }}
                >
                  {`${getString('pipeline.verification.testHost')}: ${testData?.[index]?.name}`}
                </Text>
                <Container
                  style={{ borderColor: Color.PRIMARY_7 }}
                  className={css.node}
                  background={Color.PRIMARY_2}
                ></Container>
                <Text
                  tooltip={controlData?.[index]?.name as string}
                  font={{ variation: FontVariation.SMALL }}
                >{`${getString('pipeline.verification.controlHost')}: ${controlData?.[index]?.name}`}</Text>
                {controlData?.[index]?.controlDataType === MINIMUM_DEVIATION ? (
                  <Text font={{ variation: FontVariation.SMALL }} padding={{ left: 'small' }}>
                    {`(${getControlDataType(controlData?.[index]?.controlDataType, getString)})`}
                  </Text>
                ) : null}
              </Container>
              <Container className={css.metricInfo} padding={{ left: 'small' }}>
                <Text
                  font={{ variation: FontVariation.TABLE_HEADERS }}
                  color={getRiskColorValue(testData?.[index]?.risk, false)}
                  style={{ background: getSecondaryRiskColorValue(testData?.[index]?.risk) }}
                  className={css.metricRisk}
                  margin={{ right: 'small' }}
                >
                  {testData?.[index]?.risk}
                </Text>
                <Text className={css.analysisReason}>
                  {getAnalysisReason(testData?.[index]?.analysisReason as string, getString)}
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
      {Array.isArray(thresholds) && thresholds.length ? (
        <Accordion allowMultiOpen>
          <Accordion.Panel
            key={`${transactionName}-${metricName}-${type}`}
            id={`${transactionName}-${metricName}-${type}`}
            summary={
              <Text className={css.showDetailsText} padding={{ left: 'small' }} margin={{ right: 'small' }}>
                {getString('cv.metricsAnalysis.showDetails')}
              </Text>
            }
            details={<MetricAnalysisMetricThresolds thresholds={thresholds} appliedThresholds={appliedThresholds} />}
          />
        </Accordion>
      ) : null}
    </Container>
  )
}
