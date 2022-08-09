/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useEffect } from 'react'
import { Container, Text, Layout, Button, ButtonVariation, SelectOption } from '@harness/uicore'
import { Color } from '@harness/design-system'
import { cloneDeep } from 'lodash-es'
import { useFormikContext, FieldArray, ErrorMessage } from 'formik'
import { useStrings } from 'framework/strings'
import { AppDynamicsMonitoringSourceFieldNames as FieldName } from '@cv/pages/health-source/connectors/AppDynamics/AppDHealthSource.constants'
import type {
  AppDynamicsFomikFormInterface,
  MetricThresholdType,
  NonCustomFeildsInterface
} from '@cv/pages/health-source/connectors/AppDynamics/AppDHealthSource.types'
import ThresholdCriteria from '@cv/pages/health-source/common/MetricThresholds/Components/ThresholdCriteria'
import ThresholdGroup from '@cv/pages/health-source/common/MetricThresholds/Components/ThresholdGroup'
import ThresholdSelect from '@cv/pages/health-source/common/MetricThresholds/Components/ThresholdSelect'
import { getDefaultMetricTypeValue, getMetricItems, getMetricTypeItems } from './Components/AppDThresholdSelectUtils'
import { AppDMetricThresholdContext, NewDefaultVauesForIgnoreThreshold } from '../../AppDMetricThresholdConstants'
import css from '../AppDMetricThresholdContent.module.scss'

export default function AppDIgnoreThresholdTabContent(): JSX.Element {
  const { getString } = useStrings()

  const { values: formValues } = useFormikContext<AppDynamicsFomikFormInterface>()

  const { metricPacks, groupedCreatedMetrics, setNonCustomFeilds } = useContext(AppDMetricThresholdContext)

  const handleMetricTypeUpdate = (
    index: number,
    selectedValue: string,
    replaceFn: (value: MetricThresholdType) => void
  ): void => {
    const clonedIgnoreThreshold = [...formValues.ignoreThresholds]

    const updatedIgnoreThreshold = { ...clonedIgnoreThreshold[index] }

    updatedIgnoreThreshold.metricName = undefined
    updatedIgnoreThreshold.groupName = undefined
    updatedIgnoreThreshold.metricType = selectedValue

    clonedIgnoreThreshold[index] = updatedIgnoreThreshold

    replaceFn(updatedIgnoreThreshold)
  }

  useEffect(() => {
    setNonCustomFeilds((previousValues: NonCustomFeildsInterface) => ({
      ...previousValues,
      ignoreThresholds: formValues.ignoreThresholds
    }))
  }, [formValues.ignoreThresholds, setNonCustomFeilds])

  const handleTransactionUpdate = (
    index: number,
    selectedValue: string,
    replaceFn: (value: MetricThresholdType) => void
  ): void => {
    const clonedIgnoreThreshold = [...formValues.ignoreThresholds]

    const updatedIgnoreThreshold = { ...clonedIgnoreThreshold[index] }

    updatedIgnoreThreshold.metricName = undefined
    updatedIgnoreThreshold.groupName = selectedValue

    clonedIgnoreThreshold[index] = updatedIgnoreThreshold

    replaceFn(updatedIgnoreThreshold)
  }

  const handleAddThreshold = (addFn: (newValue: MetricThresholdType) => void): void => {
    const clonedDefaultValue = cloneDeep(NewDefaultVauesForIgnoreThreshold)
    const defaultValueForMetricType = getDefaultMetricTypeValue(formValues.metricData, metricPacks)
    const newIgnoreThresholdRow = { ...clonedDefaultValue, metricType: defaultValueForMetricType }
    addFn(newIgnoreThresholdRow)
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
                  <Text>{getString('cv.monitoringSources.appD.groupTransaction')}</Text>
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

                {props?.form?.values?.ignoreThresholds?.map((data: MetricThresholdType, index: number) => {
                  return (
                    <Container
                      key={index}
                      className={css.appDMetricThresholdContentIgnoreTableRow}
                      data-testid="ThresholdRow"
                    >
                      {/* ==== ⭐️ Metric Type ==== */}
                      <ThresholdSelect
                        items={getMetricTypeItems(metricPacks, formValues.metricData, groupedCreatedMetrics)}
                        key={`${data?.metricType}`}
                        name={`ignoreThresholds.${index}.${FieldName.METRIC_THRESHOLD_METRIC_TYPE}`}
                        onChange={({ value }: SelectOption) => {
                          handleMetricTypeUpdate(index, value as string, props.replace.bind(null, index))
                        }}
                      />
                      <ErrorMessage name={`ignoreThresholds.${index}.${FieldName.METRIC_THRESHOLD_METRIC_TYPE}`} />

                      {/* ==== ⭐️ Group ==== */}
                      <ThresholdGroup
                        placeholder={getString('cv.monitoringSources.appD.groupTransaction')}
                        index={index}
                        name={`ignoreThresholds.${index}.${FieldName.METRIC_THRESHOLD_GROUP_NAME}`}
                        handleTransactionUpdate={handleTransactionUpdate}
                        replaceFn={props.replace.bind(null, index)}
                        metricType={data?.metricType}
                      />

                      {/* ==== ⭐️ Metric ==== */}
                      <ThresholdSelect
                        disabled={!data?.metricType}
                        items={getMetricItems(
                          metricPacks,
                          data.metricType,
                          data.groupName as string,
                          groupedCreatedMetrics
                        )}
                        key={`${data?.metricType}-${data.groupName}`}
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
                {/* This is for debugging purpose */}
                {/* <pre>
                  <code>{JSON.stringify(props?.form?.values?.ignoreThresholds, null, 4)}</code>
                </pre> */}
              </Container>
            )
          }}
        />
      </Container>
    </Container>
  )
}
