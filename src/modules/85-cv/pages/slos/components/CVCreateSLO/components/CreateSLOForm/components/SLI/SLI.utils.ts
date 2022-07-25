/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IOptionProps } from '@blueprintjs/core'
import type { SelectOption } from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import { isEmpty } from 'lodash-es'
import type { UseStringsReturn, StringKeys } from 'framework/strings'
import type { HealthSource, MetricDTO, ResponseListMonitoredServiceWithHealthSources } from 'services/cv'
import { Comparators } from './SLI.types'
import type { SLOForm } from '../../CreateSLO.types'
import { SLIMetricEnum, SLITypeEnum } from './SLI.constants'

export function updateMonitoredServiceForUserJourney(
  formik: FormikProps<SLOForm>,
  monitoredServiceRef?: SelectOption
): void {
  const { values } = formik || {}
  formik.setValues({
    ...values,
    monitoredServiceRef: monitoredServiceRef?.value as string
  })
}

export function getMonitoredServicesOptions(
  monitoredServicesData: ResponseListMonitoredServiceWithHealthSources | null
): SelectOption[] {
  const monitoredServicesOptions: SelectOption[] = []
  monitoredServicesData?.data?.forEach(monitoredService => {
    const { identifier = '', name = '' } = monitoredService
    if (identifier && name) {
      monitoredServicesOptions.push({
        label: name,
        value: identifier
      })
    }
  })
  return monitoredServicesOptions
}

export function getHealthSourcesOptions(
  monitoredServicesData: ResponseListMonitoredServiceWithHealthSources | null,
  monitoredServiceRef?: string
): SelectOption[] {
  let healthSourceOptions: SelectOption[] = []
  if (monitoredServiceRef && !isEmpty(monitoredServicesData?.data)) {
    const healthSourcesForMonitoredService = monitoredServicesData?.data?.find(
      monitoredService => monitoredService?.identifier === monitoredServiceRef
    )
    healthSourceOptions = healthSourcesForMonitoredService?.healthSources?.map(healthSource => ({
      label: healthSource?.name,
      value: healthSource?.identifier
    })) as SelectOption[]
  }
  return healthSourceOptions
}

export const getSliTypeOptions = (getString: UseStringsReturn['getString']): IOptionProps[] => {
  return [
    { label: getString('cv.slos.slis.type.availability'), value: SLITypeEnum.AVAILABILITY },
    { label: getString('cv.slos.slis.type.latency'), value: SLITypeEnum.LATENCY }
  ]
}

export const getSliMetricOptions = (getString: UseStringsReturn['getString']): IOptionProps[] => {
  return [
    { label: getString('cv.slos.slis.metricOptions.thresholdBased'), value: SLIMetricEnum.THRESHOLD },
    { label: getString('cv.slos.slis.metricOptions.ratioBased'), value: SLIMetricEnum.RATIO }
  ]
}

// PickMetric

export const getEventTypeOptions = (): SelectOption[] => {
  return [{ label: 'Good', value: 'good' }]
}

export const getSLOMetricOptions = (SLOMetricList?: MetricDTO[]): SelectOption[] => {
  // TODO: Adding this for unblock the create flow. This should be removed, once we are able to cerate and use SLO metrics.
  const dummyOptions = [
    { label: 'Metric One', value: 'metric1' },
    { label: 'Metric Two', value: 'metric2' }
  ]

  return [
    ...(SLOMetricList?.map(metric => ({
      label: metric.metricName ?? '',
      value: metric.identifier ?? ''
    })) ?? []),
    ...dummyOptions
  ]
}

export const getComparatorSuffixLabelId = (comparator?: Comparators): StringKeys => {
  if (comparator === Comparators.LESS_EQUAL || comparator === Comparators.GREATER_EQUAL) {
    return 'cv.toObjectiveValue'
  }

  return 'cv.thanObjectiveValue'
}

export const getHealthSourceToEdit = (healthSources: HealthSource[], formikProps: any): HealthSource | undefined => {
  return healthSources?.find(healthSource => healthSource?.identifier === formikProps?.values?.healthSourceRef)
}
