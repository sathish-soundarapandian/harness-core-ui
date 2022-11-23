/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useCallback, useEffect } from 'react'
import { Container, Layout, Accordion } from '@harness/uicore'
import { SetupSourceCardHeader } from '@cv/components/CVSetupSourcesView/SetupSourceCardHeader/SetupSourceCardHeader'
import { useStrings } from 'framework/strings'
import { useGetRiskCategoryForCustomHealthMetric } from 'services/cv'
import SelectHealthSourceServices from '../../common/SelectHealthSourceServices/SelectHealthSourceServices'
import MapMetricsToServices from './components/MapMetricsToServices/MapMetricsToServices'
import QueryMapping from './components/QueryMapping/QueryMapping'
import MetricChartsValue from './components/MetricChartsValue/MetricChartsValue'
import { QueryType } from '../../common/HealthSourceQueryType/HealthSourceQueryType.types'
import type { MapCustomHealthToService } from './CustomHealthSource.types'
import type { CustomMappedMetric } from '../../common/CustomMetric/CustomMetric.types'
import css from './CustomHealthSource.module.scss'

interface CustomHealthSourceFormInterface {
  formValue: MapCustomHealthToService
  onValueChange: (value: any) => void
  onFieldChange: (field: string, value: any) => void
  mappedMetrics: Map<string, CustomMappedMetric>
  selectedMetric: string
  connectorIdentifier: string
}

export default function CustomHealthSourceForm(props: CustomHealthSourceFormInterface) {
  const { formValue, onFieldChange, onValueChange, mappedMetrics, selectedMetric, connectorIdentifier } = props
  const { getString } = useStrings()

  const riskProfileResponse = useGetRiskCategoryForCustomHealthMetric({})

  const [isQueryExecuted, setIsQueryExecuted] = useState(false)
  const [sampleDataLoading, setSampleDataLoading] = useState(false)
  const [recordsData, setrecordsData] = useState<Record<string, unknown> | undefined>()

  const onFetchRecordsSuccess = useCallback((data: Record<string, unknown> | undefined): void => {
    setrecordsData(data)
    setIsQueryExecuted(true)
  }, [])

  useEffect(() => {
    setrecordsData(undefined)
  }, [selectedMetric])

  const isSelectingJsonPathDisabled = !isQueryExecuted || sampleDataLoading || !recordsData

  return (
    <Container className={css.main}>
      <SetupSourceCardHeader
        mainHeading={getString('cv.monitoringSources.prometheus.querySpecificationsAndMappings')}
        subHeading={getString('cv.monitoringSources.prometheus.customizeQuery')}
      />
      <Layout.Horizontal className={css.content} spacing="xlarge">
        <Accordion activeId="metricToService" className={css.accordian}>
          <Accordion.Panel
            id="metricToService"
            summary={getString('cv.monitoringSources.mapMetricsToServices')}
            details={
              <MapMetricsToServices
                formValue={formValue}
                onChange={onFieldChange}
                mappedMetrics={mappedMetrics as any}
                selectedMetric={selectedMetric}
              />
            }
          />
          <Accordion.Panel
            id="querymapping"
            summary={getString('cv.customHealthSource.Querymapping.title')}
            details={
              <QueryMapping
                formValue={formValue}
                onFieldChange={onFieldChange}
                onValueChange={onValueChange}
                connectorIdentifier={connectorIdentifier}
                onFetchRecordsSuccess={onFetchRecordsSuccess}
                recordsData={recordsData}
                isQueryExecuted={isQueryExecuted}
                setLoading={setSampleDataLoading}
              />
            }
          />
          <Accordion.Panel
            id="metricChart"
            summary={getString('cv.healthSource.connectors.NewRelic.metricValueAndCharts')}
            details={
              <MetricChartsValue
                recordsData={recordsData}
                formikValues={formValue}
                formikSetFieldValue={onFieldChange}
                isQueryExecuted={isQueryExecuted}
                isSelectingJsonPathDisabled={isSelectingJsonPathDisabled}
              />
            }
          />
          <Accordion.Panel
            id="riskProfile"
            summary={getString('cv.monitoringSources.assign')}
            details={
              <SelectHealthSourceServices
                values={{
                  sli: !!formValue.sli,
                  healthScore: !!formValue.healthScore,
                  riskCategory: formValue?.riskCategory,
                  continuousVerification: !!formValue.continuousVerification
                }}
                hideServiceIdentifier
                riskProfileResponse={riskProfileResponse}
                hideCV={formValue.queryType === QueryType.SERVICE_BASED}
                hideSLIAndHealthScore={formValue.queryType === QueryType.HOST_BASED}
              />
            }
          />
        </Accordion>
      </Layout.Horizontal>
    </Container>
  )
}
