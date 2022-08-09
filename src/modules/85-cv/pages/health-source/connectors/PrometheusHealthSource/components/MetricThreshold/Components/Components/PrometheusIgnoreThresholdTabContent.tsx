/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useEffect } from 'react'
import { Container, Text, Layout, Button, ButtonVariation } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { cloneDeep } from 'lodash-es'
import { useFormikContext, FieldArray } from 'formik'
import { useStrings } from 'framework/strings'
import ThresholdSelect from '@cv/pages/health-source/common/MetricThresholds/Components/ThresholdSelect'
import ThresholdCriteria from '@cv/pages/health-source/common/MetricThresholds/Components/ThresholdCriteria'
import type {
  MetricThresholdsState,
  PrometheusMetricThresholdType
} from '@cv/pages/health-source/connectors/PrometheusHealthSource/PrometheusHealthSource.types'
import { AppDynamicsMonitoringSourceFieldNames as FieldName } from '@cv/pages/health-source/connectors/AppDynamics/AppDHealthSource.constants'
import type { AppDynamicsFomikFormInterface } from '@cv/pages/health-source/connectors/AppDynamics/AppDHealthSource.types'
import { getMetricItems, getMetricTypeItems } from './Components/PrometheusThresholdSelectUtils'
import {
  NewDefaultVauesForIgnoreThreshold,
  PrometheusMetricThresholdContext
} from '../../PrometheusMetricThresholdConstants'

import css from '../PrometheusMetricThresholdContent.module.scss'

export default function PrometheusDIgnoreThresholdTabContent(): JSX.Element {
  const { getString } = useStrings()

  const { values: formValues } = useFormikContext<AppDynamicsFomikFormInterface>()

  const { groupedCreatedMetrics, setMetricThresholds } = useContext(PrometheusMetricThresholdContext)

  useEffect(() => {
    setMetricThresholds((previousValues: MetricThresholdsState) => ({
      ...previousValues,
      ignoreThresholds: formValues.ignoreThresholds
    }))
  }, [formValues.ignoreThresholds, setMetricThresholds])

  const handleAddThreshold = (addFn: (newValue: PrometheusMetricThresholdType) => void): void => {
    addFn(cloneDeep(NewDefaultVauesForIgnoreThreshold) as PrometheusMetricThresholdType)
  }

  return (
    <Container margin={{ top: 'large' }}>
      <Text color={Color.BLACK}>{getString('cv.monitoringSources.appD.ignoreThresholdHint')}</Text>
      <Container>
        <FieldArray
          name="ignoreThresholds"
          render={props => {
            return (
              <Container style={{ minHeight: 300 }}>
                <Container className={css.appDMetricThresholdContentIgnoreTableHeader}>
                  <Text>{getString('cv.monitoringSources.appD.metricType')}</Text>
                  <Text>{getString('cv.monitoringSources.metricLabel')}</Text>
                  <Layout.Horizontal style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text className={css.criteriaHeader}>{getString('cf.segmentDetail.criteria')}</Text>
                    <Button
                      icon="plus"
                      variation={ButtonVariation.LINK}
                      onClick={() => handleAddThreshold(props.unshift)}
                      style={{ justifySelf: 'start' }}
                      data-testid="AddThresholdButton"
                    >
                      {getString('cv.monitoringSources.appD.addThreshold')}
                    </Button>
                  </Layout.Horizontal>
                </Container>

                {props?.form?.values?.ignoreThresholds?.map((data: PrometheusMetricThresholdType, index: number) => {
                  return (
                    <Container
                      key={index}
                      className={css.appDMetricThresholdContentIgnoreTableRow}
                      data-testid="ThresholdRow"
                    >
                      {/* ==== ⭐️ Metric Type ==== */}
                      <ThresholdSelect
                        items={getMetricTypeItems(groupedCreatedMetrics)}
                        disabled
                        key={`${data?.metricType}-${index}`}
                        name={`ignoreThresholds.${index}.${FieldName.METRIC_THRESHOLD_METRIC_TYPE}`}
                      />

                      {/* ==== ⭐️ Metric ==== */}
                      <ThresholdSelect
                        items={getMetricItems(groupedCreatedMetrics)}
                        key={`${data?.metricName}`}
                        name={`ignoreThresholds.${index}.${FieldName.METRIC_THRESHOLD_METRIC_NAME}`}
                      />

                      {/* ==== ⭐️ Criteria ==== */}
                      <ThresholdCriteria
                        index={index}
                        criteriaType={data?.criteria?.type}
                        thresholdTypeName="ignoreThresholds"
                        criteriaPercentageType={data?.criteria?.criteriaPercentageType}
                        replaceFn={props.replace.bind(null, index)}
                      />
                      <Button icon="trash" minimal iconProps={{ size: 14 }} onClick={() => props.remove(index)} />
                    </Container>
                  )
                })}
              </Container>
            )
          }}
        />
      </Container>
    </Container>
  )
}
