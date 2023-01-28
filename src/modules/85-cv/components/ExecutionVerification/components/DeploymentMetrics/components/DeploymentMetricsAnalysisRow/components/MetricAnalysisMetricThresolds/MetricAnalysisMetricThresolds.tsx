import { Container, Layout, TableV2, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import React, { useMemo } from 'react'
import type { CellProps, Column, Renderer } from 'react-table'
import { isNumber } from 'lodash-es'
import type { MetricThresholdCriteriaV2, MetricThresholdV2 } from 'services/cv'
import { useStrings } from 'framework/strings'
import { CRITERIA_MAPPING, getActionText, THRESHOLD_TYPE_MAPPING } from './MetricAnalysisMetricThresolds.constants'

export interface MetricAnalysisMetricThresoldsProps {
  thresholds: MetricThresholdV2[]
}

export default function MetricAnalysisMetricThresolds(props: MetricAnalysisMetricThresoldsProps): JSX.Element {
  const { getString } = useStrings()
  const { thresholds } = props
  const RenderThresholdType: Renderer<CellProps<MetricThresholdV2>> = ({ row }) => {
    const data = row.original
    const { thresholdType, isUserDefined } = data || {}

    if (thresholdType) {
      return (
        <Layout.Horizontal>
          <Text font={{ variation: FontVariation.BODY2 }} lineClamp={1} padding={{ right: 'small' }}>
            {THRESHOLD_TYPE_MAPPING[thresholdType?.toLocaleUpperCase()]}
          </Text>
          {isUserDefined ? (
            <Text font={{ variation: FontVariation.BODY2 }} lineClamp={1}>
              {'(System)'}
            </Text>
          ) : null}
        </Layout.Horizontal>
      )
    } else return <></>
  }

  const RenderCriteria: Renderer<CellProps<MetricThresholdV2>> = ({ row }) => {
    const data = row.original
    const { criteria } = data || {}

    if (criteria?.measurementType) {
      return (
        <Text font={{ variation: FontVariation.BODY2 }} lineClamp={1} padding={{ right: 'small' }}>
          {CRITERIA_MAPPING[criteria?.measurementType?.toLocaleUpperCase()]}
        </Text>
      )
    } else return <></>
  }

  const RenderValue: Renderer<CellProps<MetricThresholdV2>> = ({ row }) => {
    const data = row.original
    const { criteria } = data || {}
    const { greaterThanThreshold, lessThanThreshold } = (criteria || {}) as MetricThresholdCriteriaV2
    if (isNumber(greaterThanThreshold) || isNumber(lessThanThreshold)) {
      return (
        <Layout.Horizontal>
          {isNumber(lessThanThreshold) ? (
            <Text font={{ variation: FontVariation.BODY2 }} lineClamp={1} padding={{ right: 'small' }}>
              {`< ${lessThanThreshold}`}
            </Text>
          ) : null}
          {isNumber(greaterThanThreshold) ? (
            <Text font={{ variation: FontVariation.BODY2 }} lineClamp={1} padding={{ right: 'small' }}>
              {isNumber(lessThanThreshold) ? ` - > ${greaterThanThreshold}` : `   > ${greaterThanThreshold}`}
            </Text>
          ) : null}
        </Layout.Horizontal>
      )
    } else return <></>
  }

  const RenderAction: Renderer<CellProps<MetricThresholdV2>> = ({ row }) => {
    const data = row.original
    const { action, criteria } = data || {}

    if (action) {
      return (
        <Text font={{ variation: FontVariation.BODY2 }} lineClamp={1}>
          {getActionText(action?.toLocaleUpperCase(), criteria?.actionableCount)}
        </Text>
      )
    } else return <></>
  }

  const columns: Column<MetricThresholdV2>[] = useMemo(
    () => [
      {
        Header: getString('cv.metricsAnalysis.metricThresholds.thresholdType'),
        accessor: 'thresholdType',
        width: '25%',
        Cell: RenderThresholdType
      },
      {
        Header: getString('cv.metricsAnalysis.metricThresholds.criteria'),
        accessor: row => row?.criteria?.measurementType,
        width: '25%',
        Cell: RenderCriteria
      },
      {
        Header: getString('cv.metricsAnalysis.metricThresholds.value'),
        accessor: row => row?.criteria,
        width: '25%',
        Cell: RenderValue
      },
      {
        Header: getString('cv.metricsAnalysis.metricThresholds.action'),
        accessor: 'action',
        width: '25%',
        Cell: RenderAction
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [thresholds]
  )

  return (
    <Container data-testid="metric-analysis-metric-threshold">
      <TableV2<MetricThresholdV2> columns={columns} data={thresholds as MetricThresholdV2[]} />
    </Container>
  )
}
