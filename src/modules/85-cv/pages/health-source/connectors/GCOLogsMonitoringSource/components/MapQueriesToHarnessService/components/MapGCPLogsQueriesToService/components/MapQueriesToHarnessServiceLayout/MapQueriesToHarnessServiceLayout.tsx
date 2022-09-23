/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Accordion, Layout, Utils } from '@wings-software/uicore'
import React, { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { MapGCPLogsToServiceFieldNames } from '@cv/pages/health-source/connectors/GCOLogsMonitoringSource/components/MapQueriesToHarnessService/constants'
import { useGetStackdriverLogSampleData } from 'services/cv'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { QueryViewer } from '@cv/components/QueryViewer/QueryViewer'
import Card from '@cv/components/Card/Card'
import { MapGCPLogsQueriesToService } from '../../MapGCPLogsQueriesToService'
import type { MapQueriesToHarnessServiceLayoutProps } from './types'
import css from './MapQueriesToHarnessServiceLayout.module.scss'

export default function MapQueriesToHarnessServiceLayout(props: MapQueriesToHarnessServiceLayoutProps): JSX.Element {
  const { formikProps, connectorIdentifier, onChange, isTemplate, expressions, isConnectorRuntimeOrExpression } = props
  const [records, setRecords] = useState<Record<string, any>[]>([])
  const [isQueryExecuted, setIsQueryExecuted] = useState(false)
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const values = formikProps?.values

  const query = useMemo(() => (values?.query?.length ? values.query : ''), [values])
  const sampleRecord = useMemo(() => (records?.length ? records[0] : null), [records])
  const queryParams = useMemo(
    () => ({
      accountId,
      projectIdentifier,
      orgIdentifier,
      tracingId: Utils.randomId(),
      connectorIdentifier: connectorIdentifier as string
    }),
    [accountId, projectIdentifier, orgIdentifier, connectorIdentifier]
  )
  const {
    mutate: queryStackdriver,
    loading,
    error
  } = useGetStackdriverLogSampleData({
    queryParams
  })

  const fetchStackDriverRecords = useCallback(async () => {
    const recordsData = await queryStackdriver({ query }, { queryParams: { ...queryParams } })
    setRecords(recordsData?.data as Record<string, any>[])
    setIsQueryExecuted(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  const postFetchingRecords = useCallback(() => {
    // resetting values of service and message indentifier once fetch records button is clicked.
    onChange(MapGCPLogsToServiceFieldNames.MESSAGE_IDENTIFIER, '')
    onChange(MapGCPLogsToServiceFieldNames.SERVICE_INSTANCE, '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Card>
      <Layout.Horizontal spacing="xlarge">
        <Accordion activeId="metricToService" className={css.accordian}>
          <Accordion.Panel
            id="metricToService"
            summary={getString('cv.monitoringSources.mapQueriesToServices')}
            details={
              <MapGCPLogsQueriesToService
                serviceInstance={values?.serviceInstance}
                messageIdentifier={values?.messageIdentifier}
                sampleRecord={sampleRecord}
                isQueryExecuted={isQueryExecuted}
                onChange={onChange}
                loading={loading}
                isTemplate={isTemplate}
                expressions={expressions}
                isConnectorRuntimeOrExpression={isConnectorRuntimeOrExpression}
              />
            }
          />
        </Accordion>
        <QueryViewer
          isQueryExecuted={isQueryExecuted}
          className={css.validationContainer}
          records={records}
          fetchRecords={fetchStackDriverRecords}
          postFetchingRecords={postFetchingRecords}
          loading={loading}
          error={error}
          query={query}
          dataTooltipId={'gcoLogsQuery'}
          isTemplate={isTemplate}
          expressions={expressions}
          isConnectorRuntimeOrExpression={isConnectorRuntimeOrExpression}
        />
      </Layout.Horizontal>
    </Card>
  )
}
