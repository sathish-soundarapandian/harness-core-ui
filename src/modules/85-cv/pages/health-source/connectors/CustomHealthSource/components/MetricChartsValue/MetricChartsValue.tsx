/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useCallback, useState } from 'react'
import type { GetDataError } from 'restful-react'
import { useParams } from 'react-router-dom'
import { Container, FormInput } from '@harness/uicore'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { InputWithDynamicModalForJson } from '@cv/components/InputWithDynamicModalForJson/InputWithDynamicModalForJson'
import MetricLineChart from '@cv/pages/health-source/common/MetricLineChart/MetricLineChart'
import { QueryType } from '@cv/pages/health-source/common/HealthSourceQueryType/HealthSourceQueryType.types'
import Button from '@rbac/components/Button/Button'
import { useStrings } from 'framework/strings'
import { TimeSeriesSampleDTO, useFetchParsedSampleData } from 'services/cv'
import type { MetricChartsValueInterface } from './MetricChartsValue.types'
import { CustomHealthSourceFieldNames } from '../../CustomHealthSource.constants'
import { getOptionsForChart } from '../../../NewRelic/components/NewRelicCustomMetricForm/NewRelicCustomMetricForm.utils'
import css from '../QueryMapping/QueryMapping.module.scss'

export default function MetricChartsValue({
  formikValues,
  formikSetFieldValue,
  isQueryExecuted,
  recordsData,
  isSelectingJsonPathDisabled
}: MetricChartsValueInterface): JSX.Element {
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps & { identifier: string }>()

  const queryParamsForTimeSeriesData = useMemo(
    () => ({
      accountId,
      orgIdentifier,
      projectIdentifier
    }),

    [accountId, orgIdentifier, projectIdentifier]
  )
  const [customTimeSeriesData, setCustomTimeSeriesData] = useState<TimeSeriesSampleDTO[] | undefined>()
  const {
    mutate: fetchNewRelicTimeSeriesData,
    loading: timeSeriesDataLoading,
    error: timeseriesDataError
  } = useFetchParsedSampleData({
    queryParams: queryParamsForTimeSeriesData
  })

  const handleBuildChart = useCallback(() => {
    fetchNewRelicTimeSeriesData({
      groupName: formikValues?.groupName?.value as string,
      jsonResponse: JSON.stringify(recordsData),
      timestampFormat: formikValues?.timestampFormat,
      metricValueJSONPath: formikValues?.metricValue as string,
      timestampJSONPath: formikValues?.timestamp as string
    }).then(data => {
      setCustomTimeSeriesData(data.data)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParamsForTimeSeriesData, formikValues, recordsData])

  const options = useMemo(() => {
    return customTimeSeriesData ? getOptionsForChart(customTimeSeriesData) : []
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customTimeSeriesData])
  const sampleRecord = recordsData || null

  return (
    <Container className={css.widthHalf}>
      <InputWithDynamicModalForJson
        onChange={formikSetFieldValue}
        fieldValue={formikValues?.metricValue || ''}
        isQueryExecuted={isQueryExecuted}
        isDisabled={isSelectingJsonPathDisabled}
        sampleRecord={sampleRecord}
        inputName={CustomHealthSourceFieldNames.METRIC_VALUE}
        inputLabel={getString('cv.healthSource.connectors.NewRelic.metricFields.metricValueJsonPath.label')}
        recordsModalHeader={getString(
          'cv.healthSource.connectors.NewRelic.metricFields.metricValueJsonPath.recordsModalHeader'
        )}
        showExactJsonPath={true}
        dataTooltipId={'customhealthMetricValueJsonPath'}
      />
      <InputWithDynamicModalForJson
        onChange={formikSetFieldValue}
        fieldValue={formikValues?.timestamp || ''}
        isQueryExecuted={isQueryExecuted}
        isDisabled={isSelectingJsonPathDisabled}
        sampleRecord={sampleRecord}
        inputName={CustomHealthSourceFieldNames.TIMESTAMP_LOCATOR}
        inputLabel={getString('cv.healthSource.connectors.NewRelic.metricFields.timestampJsonPath.label')}
        noRecordInputLabel={'noRecordInputLabel'}
        recordsModalHeader={getString(
          'cv.healthSource.connectors.NewRelic.metricFields.timestampJsonPath.recordsModalHeader'
        )}
        showExactJsonPath={true}
        dataTooltipId={'customhealthTimestampJsonPath'}
      />
      {formikValues?.queryType === QueryType.HOST_BASED ? (
        <InputWithDynamicModalForJson
          onChange={formikSetFieldValue}
          fieldValue={formikValues?.serviceInstanceIdentifier || ''}
          isQueryExecuted={isQueryExecuted}
          isDisabled={isSelectingJsonPathDisabled}
          sampleRecord={sampleRecord}
          inputName={CustomHealthSourceFieldNames.SERVICE_INSTANCE}
          inputLabel={getString('cv.customHealthSource.ServiceInstance.pathLabel')}
          recordsModalHeader={getString('cv.customHealthSource.ServiceInstance.pathModalHeader')}
          showExactJsonPath={true}
          dataTooltipId={'customhealthServiceInstance'}
        />
      ) : null}
      <FormInput.Text
        label={getString('cv.healthSource.connectors.NewRelic.metricFields.timestampFormat')}
        name={CustomHealthSourceFieldNames.TIMESTAMP_FORMAT}
      />
      <Button intent="primary" text={getString('cv.healthSource.connectors.buildChart')} onClick={handleBuildChart} />
      <Container padding={{ top: 'small' }}>
        <MetricLineChart
          loading={timeSeriesDataLoading}
          error={timeseriesDataError as GetDataError<Error>}
          options={options}
        />
      </Container>
    </Container>
  )
}
