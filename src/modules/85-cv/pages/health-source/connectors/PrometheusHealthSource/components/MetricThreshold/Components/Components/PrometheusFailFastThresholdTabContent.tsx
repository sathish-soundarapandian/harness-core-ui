/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useEffect } from 'react'
import cx from 'classnames'
import { Button, ButtonVariation, Container, FormInput, Layout, SelectOption, Text } from '@harness/uicore'
import { cloneDeep } from 'lodash-es'
import { Color } from '@harness/design-system'
import { FieldArray, useFormikContext } from 'formik'
import type { MetricThresholdSpec } from 'services/cv'
import { useStrings } from 'framework/strings'
import ThresholdSelect from '@cv/pages/health-source/common/MetricThresholds/Components/ThresholdSelect'
import ThresholdCriteria from '@cv/pages/health-source/common/MetricThresholds/Components/ThresholdCriteria'
import { getActionItems } from '@cv/pages/health-source/common/MetricThresholds/MetricThresholds.utils'
import type {
  MetricThresholdsState,
  PrometheusMetricThresholdType
} from '@cv/pages/health-source/connectors/PrometheusHealthSource/PrometheusHealthSource.types'
import { AppDynamicsMonitoringSourceFieldNames as FieldName } from '@cv/pages/health-source/connectors/AppDynamics/AppDHealthSource.constants'
import type { AppDynamicsFomikFormInterface } from '@cv/pages/health-source/connectors/AppDynamics/AppDHealthSource.types'

import { getMetricItems, getMetricTypeItems } from './Components/PrometheusThresholdSelectUtils'
import {
  FailFastActionValues,
  NewDefaultVauesForFailFastThreshold,
  PrometheusMetricThresholdContext
} from '../../PrometheusMetricThresholdConstants'
import css from '../PrometheusMetricThresholdContent.module.scss'

export default function PrometheusFailFastThresholdTabContent(): JSX.Element {
  const { getString } = useStrings()

  const { values: formValues } = useFormikContext<AppDynamicsFomikFormInterface>()

  const { groupedCreatedMetrics, setMetricThresholds } = useContext(PrometheusMetricThresholdContext)

  useEffect(() => {
    setMetricThresholds((oldValues: MetricThresholdsState) => ({
      ...oldValues,
      failFastThresholds: formValues.failFastThresholds
    }))
  }, [formValues.failFastThresholds, setMetricThresholds])

  const handleActionUpdate = (
    index: number,
    selectedValue: MetricThresholdSpec['action'],
    replaceFn: (value: PrometheusMetricThresholdType) => void
  ): void => {
    const clonedFailFastThresholds = [...formValues.failFastThresholds]

    const updatedFailFastThresholds = { ...clonedFailFastThresholds[index] }

    /* istanbul ignore next */
    if (typeof updatedFailFastThresholds.spec.spec === 'undefined') {
      updatedFailFastThresholds.spec.spec = {}
    }

    updatedFailFastThresholds.spec.spec.count = undefined
    updatedFailFastThresholds.spec.action = selectedValue

    clonedFailFastThresholds[index] = updatedFailFastThresholds

    replaceFn(updatedFailFastThresholds)
  }

  const handleAddThreshold = (addFn: (newRow: PrometheusMetricThresholdType) => void): void => {
    addFn(cloneDeep(NewDefaultVauesForFailFastThreshold) as PrometheusMetricThresholdType)
  }

  return (
    <Container margin={{ top: 'large' }}>
      <Text color={Color.BLACK}>{getString('cv.monitoringSources.appD.failFastThresholdHint')}</Text>

      <Container>
        <FieldArray
          name="failFastThresholds"
          render={props => {
            return (
              <Container style={{ minHeight: 300 }}>
                <Container
                  className={cx(
                    css.appDMetricThresholdContentIgnoreTableHeader,
                    css.appDMetricThresholdContentFailFastTableHeader
                  )}
                >
                  <Text>{getString('cv.monitoringSources.appD.metricType')}</Text>
                  <Text>{getString('cv.monitoringSources.metricLabel')}</Text>
                  <Text>{getString('action')}</Text>
                  <Text>{getString('instanceFieldOptions.instanceHolder')}</Text>
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

                {props?.form?.values?.failFastThresholds?.map((data: PrometheusMetricThresholdType, index: number) => {
                  return (
                    <Container
                      key={index}
                      className={cx(
                        css.appDMetricThresholdContentIgnoreTableRow,
                        css.appDMetricThresholdContentFailFastTableRow
                      )}
                      data-testid="ThresholdRow"
                    >
                      {/* ==== ⭐️ Metric Type ==== */}
                      <ThresholdSelect
                        disabled
                        items={getMetricTypeItems(groupedCreatedMetrics)}
                        key={`${data?.metricType}-${index}`}
                        name={`failFastThresholds.${index}.${FieldName.METRIC_THRESHOLD_METRIC_TYPE}`}
                      />

                      {/* ==== ⭐️ Metric ==== */}
                      <ThresholdSelect
                        items={getMetricItems(groupedCreatedMetrics)}
                        key={`${data?.metricName}`}
                        name={`failFastThresholds.${index}.${FieldName.METRIC_THRESHOLD_METRIC_NAME}`}
                      />

                      {/* ==== ⭐️ Action ==== */}

                      <ThresholdSelect
                        items={getActionItems(getString)}
                        name={`failFastThresholds.${index}.spec.${FieldName.METRIC_THRESHOLD_ACTION}`}
                        onChange={({ value }: SelectOption) => {
                          if (value === FailFastActionValues.FailImmediately) {
                            handleActionUpdate(
                              index,
                              value as MetricThresholdSpec['action'],
                              props.replace.bind(null, index)
                            )
                          }
                        }}
                      />

                      {/* ==== ⭐️ Count ==== */}
                      <FormInput.Text
                        inline
                        disabled={data?.spec?.action === FailFastActionValues.FailImmediately}
                        placeholder={data.spec.action === FailFastActionValues.FailImmediately ? getString('na') : ''}
                        key={data?.spec?.action}
                        className={css.appDMetricThresholdContentInput}
                        inputGroup={{ type: 'number', min: 0 }}
                        name={`failFastThresholds.${index}.spec.spec.${FieldName.METRIC_THRESHOLD_COUNT}`}
                      />

                      {/* ==== ⭐️ Criteria ==== */}
                      <ThresholdCriteria
                        criteriaType={data?.criteria?.type}
                        thresholdTypeName="failFastThresholds"
                        criteriaPercentageType={data?.criteria?.criteriaPercentageType}
                        index={index}
                        replaceFn={props.replace.bind(null, index)}
                      />
                      <Button icon="trash" minimal iconProps={{ size: 14 }} onClick={() => props.remove(index)} />
                    </Container>
                  )
                })}
                {/* For debugging purpose */}
                {/* <pre>
                  <code>{JSON.stringify(props?.form?.values?.failFastThresholds, null, 4)}</code>
                </pre> */}
              </Container>
            )
          }}
        />
      </Container>
    </Container>
  )
}
