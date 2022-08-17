import React from 'react'
import cx from 'classnames'
import { Button, ButtonVariation, Container, FormInput, Layout, SelectOption, Text } from '@harness/uicore'
import { cloneDeep } from 'lodash-es'

import { FieldArray } from 'formik'
import { useStrings } from 'framework/strings'
import type { MetricThresholdSpec } from 'services/cv'
import ThresholdGroup from '@cv/pages/health-source/common/MetricThresholds/Components/ThresholdGroup'
import { AppDynamicsMonitoringSourceFieldNames as FieldName } from '@cv/pages/health-source/connectors/AppDynamics/AppDHealthSource.constants'
import {
  getActionItems,
  getDefaultMetricTypeValue,
  getMetricItems,
  getMetricTypeItems
} from '@cv/pages/health-source/common/MetricThresholds/MetricThresholds.utils'
import type { MetricThresholdType } from '@cv/pages/health-source/connectors/AppDynamics/AppDHealthSource.types'
import ThresholdSelect from '@cv/pages/health-source/common/MetricThresholds/Components/ThresholdSelect'
import ThresholdCriteria from '@cv/pages/health-source/common/MetricThresholds/Components/ThresholdCriteria'
import {
  FailFastActionValues,
  NewDefaultVauesForFailFastThreshold
} from '@cv/pages/health-source/common/MetricThresholds/MetricThresholds.constants'
import type { FailFasthresholdsFieldArrayInterface } from '../MetricThresholds.types'
import css from './MetricThreshold.module.scss'

export default function FailFastThresholdsFieldArray<T>({
  formValues,
  groupedCreatedMetrics,
  metricPacks
}: FailFasthresholdsFieldArrayInterface<T>): JSX.Element {
  const { getString } = useStrings()

  const handleMetricUpdate = (
    index: number,
    selectedValue: string,
    replaceFn: (updatedRow: MetricThresholdType) => void
  ): void => {
    const clonedFailFastThresholds = [...formValues.failFastThresholds]

    const updatedFailFastThresholds = { ...clonedFailFastThresholds[index] }

    updatedFailFastThresholds.metricName = undefined
    updatedFailFastThresholds.groupName = undefined
    updatedFailFastThresholds.metricType = selectedValue

    clonedFailFastThresholds[index] = updatedFailFastThresholds

    replaceFn(updatedFailFastThresholds)
  }

  const handleTransactionUpdate = (
    index: number,
    selectedValue: string,
    replaceFn: (updatedRow: MetricThresholdType) => void
  ): void => {
    const clonedFailFastThresholds = [...formValues.failFastThresholds]

    const updatedFailFastThresholds = { ...clonedFailFastThresholds[index] }

    updatedFailFastThresholds.metricName = undefined
    updatedFailFastThresholds.groupName = selectedValue

    clonedFailFastThresholds[index] = updatedFailFastThresholds

    replaceFn(updatedFailFastThresholds)
  }

  const handleActionUpdate = (
    index: number,
    selectedValue: MetricThresholdSpec['action'],
    replaceFn: (updatedRow: MetricThresholdType) => void
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

  const handleAddThreshold = (addFn: (addedRow: MetricThresholdType) => void): void => {
    const clonedDefaultValue = cloneDeep(NewDefaultVauesForFailFastThreshold)
    const defaultValueForMetricType = getDefaultMetricTypeValue(formValues.metricData, metricPacks)
    const newIgnoreThresholdRow = { ...clonedDefaultValue, metricType: defaultValueForMetricType }
    addFn(newIgnoreThresholdRow)
  }

  return (
    <FieldArray
      name="failFastThresholds"
      render={props => {
        return (
          <Container style={{ minHeight: 300 }}>
            <Container
              className={cx(css.metricThresholdContentIgnoreTableHeader, css.metricThresholdContentFailFastTableHeader)}
            >
              <Text>{getString('cv.monitoringSources.appD.metricType')}</Text>
              <Text>{getString('cv.monitoringSources.appD.groupTransaction')}</Text>
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

            {props?.form?.values?.failFastThresholds?.map((data: MetricThresholdType, index: number) => {
              return (
                <Container
                  key={index}
                  className={cx(css.metricThresholdContentIgnoreTableRow, css.metricThresholdContentFailFastTableRow)}
                  data-testid="ThresholdRow"
                >
                  {/* ==== ⭐️ Metric Type ==== */}
                  <ThresholdSelect
                    items={getMetricTypeItems(metricPacks, formValues.metricData, groupedCreatedMetrics)}
                    key={`${data?.metricType}`}
                    name={`failFastThresholds.${index}.${FieldName.METRIC_THRESHOLD_METRIC_TYPE}`}
                    onChange={({ value }: SelectOption) => {
                      handleMetricUpdate(index, value as string, props.replace.bind(null, index))
                    }}
                  />

                  {/* ==== ⭐️ Group ==== */}
                  <ThresholdGroup
                    placeholder={getString('cv.monitoringSources.appD.groupTransaction')}
                    index={index}
                    name={`failFastThresholds.${index}.${FieldName.METRIC_THRESHOLD_GROUP_NAME}`}
                    handleTransactionUpdate={handleTransactionUpdate}
                    replaceFn={props.replace.bind(null, index)}
                    metricType={data?.metricType}
                    groupedCreatedMetrics={groupedCreatedMetrics}
                  />

                  {/* ==== ⭐️ Metric ==== */}
                  <ThresholdSelect
                    disabled={!data?.metricType}
                    items={getMetricItems(metricPacks, data.metricType, data.groupName, groupedCreatedMetrics)}
                    key={`${data?.metricType}-${data.groupName}`}
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
                    // test covered for this line in AppDFailFastThresholdTabContent.test.tsx, so skipping here
                    /* istanbul ignore next */
                    disabled={data?.spec?.action === FailFastActionValues.FailImmediately}
                    placeholder={data.spec.action === FailFastActionValues.FailImmediately ? getString('na') : ''}
                    key={data?.spec?.action}
                    className={css.metricThresholdContentInput}
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
          </Container>
        )
      }}
    />
  )
}
