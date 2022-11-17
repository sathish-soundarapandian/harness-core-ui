/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Container, FormInput, Layout, Text, Utils, Icon } from '@harness/uicore'
import { FontVariation } from '@harness/design-system'
import { QueryViewer } from '@cv/components/QueryViewer/QueryViewer'
import { Records } from '@cv/components/Records/Records'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { HealthSourceQueryType } from '@cv/pages/health-source/common/HealthSourceQueryType/HealthSourceQueryType'
import Button from '@rbac/components/Button/Button'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { HTTPRequestMethodOption } from '@connectors/components/CreateConnector/CustomHealthConnector/components/CustomHealthValidationPath/components/HTTPRequestMethod/HTTPRequestMethod'
import { useFetchSampleData } from 'services/cv'
import { useGetConnector } from 'services/cd-ng'
import { QueryType } from '@cv/pages/health-source/common/HealthSourceQueryType/HealthSourceQueryType.types'
import type { QueryMappingInterface } from './QueryMapping.types'
import { CustomHealthSourceFieldNames } from '../../CustomHealthSource.constants'
import { timeFormatOptions } from './QueryMapping.constants'
import { connectorParams, onFetchRecords } from './QueryMapping.utils'
import css from './QueryMapping.module.scss'

export default function QueryMapping({
  formValue,
  onValueChange,
  onFieldChange,
  connectorIdentifier,
  onFetchRecordsSuccess,
  isQueryExecuted,
  recordsData,
  setLoading
}: QueryMappingInterface): JSX.Element {
  const { getString } = useStrings()
  const sampleDataTracingId = useMemo(() => Utils.randomId(), [])
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps & { identifier: string }>()

  const connectorPayload = useMemo(
    () => connectorParams(connectorIdentifier, { projectIdentifier, orgIdentifier, accountId }),
    [connectorIdentifier, projectIdentifier, orgIdentifier, accountId]
  )
  const { data: connectorData, loading: connectorLoading, error: connectorError } = useGetConnector(connectorPayload)

  const {
    mutate: getSampleData,
    error: sampleDataError,
    loading: sampleDataLoading
  } = useFetchSampleData({
    queryParams: {
      accountId,
      connectorIdentifier,
      orgIdentifier,
      projectIdentifier,
      tracingId: sampleDataTracingId
    }
  })

  useEffect(() => {
    setLoading(sampleDataLoading)
  }, [sampleDataLoading])

  useEffect(() => {
    onFieldChange(CustomHealthSourceFieldNames.BASE_URL, connectorData?.data?.connector?.spec?.baseURL)
  }, [connectorData])

  const fetchRecords = () =>
    onFetchRecords(
      formValue?.pathURL,
      formValue?.endTime,
      formValue?.startTime,
      formValue?.requestMethod,
      formValue?.query,
      getSampleData,
      onFetchRecordsSuccess
    )

  return (
    <Container>
      <Text margin={{ bottom: 'medium' }}>{getString('cv.customHealthSource.Querymapping.label')}</Text>
      <Container margin={{ top: 'medium', bottom: 'medium' }} border={{ bottom: true }}>
        {onValueChange && (
          <HealthSourceQueryType
            onChange={val => {
              if (val === QueryType.HOST_BASED) {
                onValueChange({
                  ...formValue,
                  queryType: val,
                  [CustomHealthSourceFieldNames.SLI]: false,
                  [CustomHealthSourceFieldNames.HEALTH_SCORE]: false,
                  [CustomHealthSourceFieldNames.CONTINUOUS_VERIFICATION]: true
                })
              } else {
                onValueChange({
                  ...formValue,
                  queryType: val,
                  [CustomHealthSourceFieldNames.CONTINUOUS_VERIFICATION]: false
                })
              }
            }}
            value={formValue.queryType}
          />
        )}
      </Container>

      <Container padding={{ top: 'medium', bottom: 'medium' }}>
        {connectorError ? (
          <Text padding={{ bottom: 'medium' }} font={{ variation: FontVariation.FORM_MESSAGE_DANGER }}>
            {getErrorMessage(connectorError)}
          </Text>
        ) : connectorLoading ? (
          <Icon name="spinner" margin={{ bottom: 'medium' }} size={24} />
        ) : (
          <FormInput.Text
            label={getString('connectors.baseURL')}
            name={CustomHealthSourceFieldNames.BASE_URL}
            disabled
          />
        )}
      </Container>

      <HTTPRequestMethodOption value={formValue.requestMethod} />

      <FormInput.Text
        className={css.baseUrl}
        label={getString('common.path')}
        name={CustomHealthSourceFieldNames.PATH}
      />

      <Text color={'black'} font={{ size: 'medium', weight: 'bold' }} margin={{ bottom: 'small', top: 'medium' }}>
        {getString('cv.customHealthSource.Querymapping.startAndEndTimeTitle')}
      </Text>
      <hr className={css.sectionDivider} />
      <Layout.Vertical>
        <Layout.Horizontal spacing={'large'} className={css.parameterLayout}>
          <FormInput.Text
            className={css.widthHalf}
            name={'startTime.placeholder'}
            label={getString('cv.customHealthSource.Querymapping.startTimeLabel')}
          />
          <FormInput.Select
            className={css.widthHalf}
            items={timeFormatOptions}
            name="startTime.timestampFormat"
            label={getString('cv.unit')}
          />
        </Layout.Horizontal>
        <Layout.Horizontal spacing={'large'} className={css.parameterLayout}>
          <FormInput.Text
            className={css.widthHalf}
            name="endTime.placeholder"
            label={getString('cv.customHealthSource.Querymapping.endTimeLabel')}
          />
          <FormInput.Select
            className={css.widthHalf}
            items={timeFormatOptions}
            name={'endTime.timestampFormat'}
            label={getString('cv.unit')}
          />
        </Layout.Horizontal>
      </Layout.Vertical>
      <Container margin={{ top: 'medium', bottom: 'medium' }}>
        {formValue?.requestMethod === 'POST' ? (
          <QueryViewer
            queryLabel={getString('common.smtp.labelBody')}
            isQueryExecuted={isQueryExecuted}
            queryNotExecutedMessage={getString('cv.healthSource.connectors.NewRelic.submitQueryNoRecords')}
            records={recordsData ? [recordsData] : []}
            fetchRecords={fetchRecords}
            loading={sampleDataLoading}
            error={sampleDataError}
            query={formValue.query}
            fetchEntityName={getString('cv.response')}
            dataTooltipId={'customHealthSourceQuery'}
          />
        ) : (
          <>
            <Button
              intent="primary"
              text={getString('cv.monitoringSources.gcoLogs.fetchRecords')}
              onClick={fetchRecords}
              disabled={sampleDataLoading}
            />
            <Records
              fetchRecords={fetchRecords}
              loading={sampleDataLoading}
              data={[recordsData]}
              error={sampleDataError}
              query={''}
              isQueryExecuted={isQueryExecuted}
              queryNotExecutedMessage={getString('cv.customHealthSource.fetchRecordsButton')}
            />
          </>
        )}
      </Container>
    </Container>
  )
}
