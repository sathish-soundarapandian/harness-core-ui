/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */
//xx
import { Accordion, FormInput, Layout, Utils, useToaster } from '@wings-software/uicore'
import React, { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { MapElkToServiceFieldNames } from '@cv/pages/health-source/connectors/ElkHealthSource/components/MapQueriesToHarnessService/constants'
import { useGetELKLogSampleData } from 'services/cv'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { QueryViewer } from '@cv/components/QueryViewer/QueryViewer'
import Card from '@cv/components/Card/Card'

import { ElkMetricNameAndHostIdentifier } from '../../ElkMetricNameAndHostIdentifier'
import type { MapQueriesToHarnessServiceLayoutProps } from './types'
import css from './MapQueriesToHarnessServiceLayout.module.scss'

export default function MapQueriesToHarnessServiceLayout(props: MapQueriesToHarnessServiceLayoutProps): JSX.Element {
  const { formikProps, connectorIdentifier, onChange, isConnectorRuntimeOrExpression, isTemplate, expressions } = props
  const [isQueryExecuted, setIsQueryExecuted] = useState(false)
  const [elkSampleData, setElkSampleData] = useState<any>()
  const [loading, setLoading] = useState<boolean>(false)
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { showError } = useToaster()
  const values = formikProps?.values
  const query = useMemo(() => (values?.query?.length ? values.query : ''), [values])

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

  const { mutate: getSampleData } = useGetELKLogSampleData({
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier,
      connectorIdentifier,
      tracingId: queryParams?.tracingId,
      index: formikProps?.values?.logIndexes
    }
  })

  const fetchElkRecords = useCallback(async () => {
    setLoading(true)
    await getSampleData({
      query
    })
      .then(response => {
        if (response.data?.length) {
          setElkSampleData(response.data)
        }
      })
      .catch(error => {
        showError(error)
      })
      .finally(() => {
        setLoading(false)
      })
    setIsQueryExecuted(true)
  }, [query])
  const postFetchingRecords = useCallback(() => {
    // resetting values of service once fetch records button is clicked.
    onChange(MapElkToServiceFieldNames.SERVICE_INSTANCE, '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
    //onChange(MapSplunkToServiceFieldNames.IS_STALE_RECORD, false)
  }, [])

  return (
    <Card>
      <>
        <Layout.Horizontal>
          <Accordion activeId="metricToService" className={css.accordian}>
            <Accordion.Panel
              id="metricToService"
              summary={getString('cv.monitoringSources.mapQueriesToServices')}
              details={
                <ElkMetricNameAndHostIdentifier
                  serviceInstance={values?.serviceInstance}
                  identifyTimeStamp={values?.identifyTimestamp}
                  messageIdentifier={values?.messageIdentifier}
                  sampleRecord={elkSampleData?.[0] || null}
                  isQueryExecuted={isQueryExecuted}
                  onChange={onChange}
                  loading={false}
                  isTemplate={isTemplate}
                  expressions={expressions}
                  isConnectorRuntimeOrExpression={isConnectorRuntimeOrExpression}
                  connectorIdentifier={connectorIdentifier}
                />
              }
            />
          </Accordion>
          <div className={css.queryViewContainer}>
            <QueryViewer
              isQueryExecuted={isQueryExecuted}
              className={css.validationContainer}
              records={elkSampleData}
              fetchRecords={fetchElkRecords}
              postFetchingRecords={postFetchingRecords}
              loading={loading}
              error={null}
              query={formikProps?.values?.logIndexes ? query : ''}
              queryNotExecutedMessage="Submit query to see records from ELK"
              // queryTextAreaProps={{
              //   onChangeCapture: () => {
              //     onChange(MapElkToServiceFieldNames.IS_STALE_RECORD, true)
              //   }
              // }}
              //staleRecordsWarning={staleRecordsWarningMessage}
              dataTooltipId={'splunkQuery'}
              isTemplate={isTemplate}
              expressions={expressions}
              isConnectorRuntimeOrExpression={isConnectorRuntimeOrExpression}
            />
          </div>
        </Layout.Horizontal>
      </>
    </Card>
  )
}
