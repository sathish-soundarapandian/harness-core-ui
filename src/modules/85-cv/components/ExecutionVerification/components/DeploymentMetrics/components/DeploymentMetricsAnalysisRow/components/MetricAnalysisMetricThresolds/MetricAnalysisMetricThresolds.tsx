import { Container, Layout, TableV2, Text } from '@harness/uicore'
import { Color, FontVariation } from '@harness/design-system'
import React, { useMemo } from 'react'
import type { CellProps, Column, Renderer } from 'react-table'
import { isNumber } from 'lodash-es'
import type { MetricThresholdCriteriaV2, MetricThresholdV2 } from 'services/cv'
import { useStrings } from 'framework/strings'
import { CRITERIA_MAPPING, getActionText, THRESHOLD_TYPE_MAPPING } from './MetricAnalysisMetricThresolds.constants'
import css from './MetricAnalysisMetricThresholds.module.scss'

export interface MetricAnalysisMetricThresoldsProps {
  thresholds: MetricThresholdV2[]
  appliedThresholds?: string[]
}

export default function MetricAnalysisMetricThresolds(props: MetricAnalysisMetricThresoldsProps): JSX.Element {
  const { getString } = useStrings()
  const { thresholds, appliedThresholds } = props
  const RenderThresholdType: Renderer<CellProps<MetricThresholdV2>> = ({ row }) => {
    const data = row.original
    const { thresholdType, isUserDefined } = data

    if (thresholdType) {
      return (
        <Layout.Horizontal>
          <Text className={css.label} lineClamp={1} padding={{ right: 'small' }}>
            {THRESHOLD_TYPE_MAPPING[thresholdType?.toLocaleUpperCase()]}
          </Text>
          {!isUserDefined ? (
            <Text className={css.label} lineClamp={1}>
              {'(System)'}
            </Text>
          ) : null}
        </Layout.Horizontal>
      )
    } else return <></>
  }

  const RenderCriteria: Renderer<CellProps<MetricThresholdV2>> = ({ row }) => {
    const data = row.original
    const { criteria } = data

    if (criteria?.measurementType) {
      return (
        <Text className={css.label} lineClamp={1} padding={{ right: 'small' }}>
          {CRITERIA_MAPPING[criteria?.measurementType?.toLocaleUpperCase()]}
        </Text>
      )
    } else return <></>
  }

  const RenderValue: Renderer<CellProps<MetricThresholdV2>> = ({ row }) => {
    const data = row.original
    const { criteria } = data
    const { greaterThanThreshold, lessThanThreshold } = (criteria || {}) as MetricThresholdCriteriaV2
    if (isNumber(greaterThanThreshold) || isNumber(lessThanThreshold)) {
      return (
        <Layout.Horizontal>
          {isNumber(lessThanThreshold) ? (
            <Text className={css.label} lineClamp={1} padding={{ right: 'small' }}>
              {`< ${lessThanThreshold}`}
            </Text>
          ) : null}
          {isNumber(greaterThanThreshold) ? (
            <Text className={css.label} lineClamp={1} padding={{ right: 'small' }}>
              {isNumber(lessThanThreshold) ? ` - > ${greaterThanThreshold}` : `   > ${greaterThanThreshold}`}
            </Text>
          ) : null}
        </Layout.Horizontal>
      )
    } else return <></>
  }

  const RenderAction: Renderer<CellProps<MetricThresholdV2>> = ({ row }) => {
    const data = row.original
    const { action, criteria } = data

    if (action) {
      return (
        <Text className={css.label} lineClamp={1}>
          {getActionText(action?.toLocaleUpperCase(), criteria?.actionableCount)}
        </Text>
      )
    } else return <></>
  }

  const RenderAppliedThresholds: Renderer<CellProps<MetricThresholdV2>> = ({ row }) => {
    const data = row.original
    const { id } = data

    if (Array.isArray(appliedThresholds) && appliedThresholds.length && appliedThresholds.some(el => el === id)) {
      return (
        <Container width={'fit-content'}>
          <Text
            font={{ variation: FontVariation.TINY_SEMI }}
            flex={{ justifyContent: 'center' }}
            color={Color.PRIMARY_7}
            background={Color.PRIMARY_2}
            border={{ radius: 4 }}
            padding={{ top: 'xsmall', bottom: 'xsmall', left: 'small', right: 'small' }}
          >
            {getString('cv.metricsAnalysis.metricThresholds.applied')}
          </Text>
        </Container>
      )
    } else return <></>
  }

  const columns: Column<MetricThresholdV2>[] = useMemo(
    () => [
      {
        Header: getString('cv.metricsAnalysis.metricThresholds.thresholdType'),
        accessor: 'thresholdType',
        width: '22.5%',
        Cell: RenderThresholdType
      },
      {
        Header: getString('cv.metricsAnalysis.metricThresholds.criteria'),
        accessor: row => row?.criteria?.measurementType,
        width: '22.5%',
        Cell: RenderCriteria
      },
      {
        Header: getString('cv.metricsAnalysis.metricThresholds.value'),
        accessor: row => row?.criteria,
        width: '22.5%',
        Cell: RenderValue
      },
      {
        Header: getString('cf.auditLogs.action'),
        accessor: 'action',
        width: '22.5%',
        Cell: RenderAction
      },
      {
        Header: '',
        accessor: 'id',
        width: '10%',
        Cell: RenderAppliedThresholds
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [thresholds]
  )

  return (
    <Container data-testid="metric-analysis-metric-threshold" className={css.main}>
      <TableV2<MetricThresholdV2> columns={columns} data={thresholds as MetricThresholdV2[]} />
    </Container>
  )
}
