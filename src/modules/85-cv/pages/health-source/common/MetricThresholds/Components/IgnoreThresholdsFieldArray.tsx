import React from 'react'
import { Container, Text, Layout, Button, ButtonVariation, SelectOption } from '@harness/uicore'
import { cloneDeep } from 'lodash-es'
import { FieldArray, ErrorMessage } from 'formik'
import { AppDynamicsMonitoringSourceFieldNames as FieldName } from '@cv/pages/health-source/connectors/AppDynamics/AppDHealthSource.constants'
import { useStrings } from 'framework/strings'
import {
  getDefaultMetricTypeValue,
  getMetricItems,
  getMetricTypeItems
} from '@cv/pages/health-source/common/MetricThresholds/MetricThresholds.utils'
import type { MetricThresholdType } from '@cv/pages/health-source/connectors/AppDynamics/AppDHealthSource.types'
import ThresholdCriteria from '@cv/pages/health-source/common/MetricThresholds/Components/ThresholdCriteria'
import ThresholdGroup from '@cv/pages/health-source/common/MetricThresholds/Components/ThresholdGroup'
import ThresholdSelect from '@cv/pages/health-source/common/MetricThresholds/Components/ThresholdSelect'
import { NewDefaultVauesForIgnoreThreshold } from '@cv/pages/health-source/common/MetricThresholds/MetricThresholds.constants'
import type { IgnoreThresholdsFieldArrayInterface } from '../MetricThresholds.types'
import css from './MetricThreshold.module.scss'

export default function IgnoreThresholdsFieldArray<T>({
  formValues,
  metricPacks,
  groupedCreatedMetrics
}: IgnoreThresholdsFieldArrayInterface<T>): JSX.Element {
  const { getString } = useStrings()

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
    <FieldArray
      name="ignoreThresholds"
      render={props => {
        return (
          <Container style={{ minHeight: 300 }}>
            <Container className={css.metricThresholdContentIgnoreTableHeader}>
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
                <Container key={index} className={css.metricThresholdContentIgnoreTableRow} data-testid="ThresholdRow">
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
                    groupedCreatedMetrics={groupedCreatedMetrics}
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
  )
}
