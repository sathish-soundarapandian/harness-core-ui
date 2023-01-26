import { Layout, TableV2, Text } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import React, { useMemo } from 'react'
import type { CellProps, Column, Renderer } from 'react-table'
import { isNumber } from 'lodash-es'
import type { MetricThresholdCriteriaV2, MetricThresholdV2 } from 'services/cv'
import { CRITERIA_MAPPING, getActionText, THRESHOLD_TYPE_MAPPING } from './MetricAnalysisMetricThresolds.constants'
import css from './MetricAnalysisMetricThresholds.module.scss'

interface MetricAnalysisMetricThresoldsProps {
  thresholds?: MetricThresholdV2[]
}

export default function MetricAnalysisMetricThresolds(props: MetricAnalysisMetricThresoldsProps): JSX.Element {
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
        Header: 'THRESHOLD TYPE',
        accessor: 'thresholdType',
        width: '25%',
        Cell: RenderThresholdType
      },
      {
        Header: 'CRITERIA',
        accessor: row => row?.criteria?.measurementType,
        width: '25%',
        Cell: RenderCriteria
      },
      {
        Header: 'VALUE',
        accessor: row => row?.criteria,
        width: '25%',
        Cell: RenderValue
      },
      {
        Header: 'ACTION',
        accessor: 'action',
        width: '25%',
        Cell: RenderAction
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [thresholds]
  )

  if (!(Array.isArray(thresholds) && thresholds.length)) {
    return <></>
  }

  return (
    <TableV2<MetricThresholdV2>
      // TODO check why css is not reflecting
      className={css.metricsAnalysisMetricThresold}
      columns={columns}
      data={thresholds as MetricThresholdV2[]}
    />
  )
}
