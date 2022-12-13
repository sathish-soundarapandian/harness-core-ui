/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useContext, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useFormikContext } from 'formik'
import { HealthSourceRecordsRequest, useGetSampleRawRecord } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import Card from '@cv/components/Card/Card'
import { CommonQueryViewer } from '@cv/components/CommonQueryViewer/CommonQueryViewer'
import type { CommonCustomMetricFormikInterface } from '@cv/pages/health-source/connectors/CommonHealthSource/CommonHealthSource.types'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import type { CommonCustomMetricFormContainerProps } from './CommonCustomMetricFormContainer.types'

export default function CommonCustomMetricFormContainer(props: CommonCustomMetricFormContainerProps): JSX.Element {
  const { values } = useFormikContext<CommonCustomMetricFormikInterface>()
  const {
    sourceData: { product, sourceType }
  } = useContext(SetupSourceTabsContext)
  const { connectorIdentifier, isTemplate, expressions, isConnectorRuntimeOrExpression } = props
  const [records, setRecords] = useState<Record<string, any>[]>([])
  const [isQueryExecuted, setIsQueryExecuted] = useState(false)
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const providerType = `${sourceType?.toUpperCase()}_${product?.value}`

  const query = useMemo(() => (values?.query?.length ? values.query : ''), [values])
  // const sampleRecord = useMemo(() => (records?.length ? records[0] : null), [records])

  const {
    mutate: queryHealthSource,
    loading,
    error
  } = useGetSampleRawRecord({
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier
  })

  const handleFetchRecords = useCallback(async () => {
    const currentTime = new Date()
    const startTime = currentTime.setHours(currentTime.getHours() - 2)

    const fetchRecordsRequestBody = {
      connectorIdentifier,
      endTime: Date.now(),
      startTime,
      providerType: providerType as HealthSourceRecordsRequest['providerType'],
      query
    }

    const recordsData = await queryHealthSource(fetchRecordsRequestBody)
    setRecords(recordsData?.resource?.rawRecords as Record<string, any>[])
    setIsQueryExecuted(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectorIdentifier, providerType, query])

  return (
    <Card>
      <CommonQueryViewer
        isQueryExecuted={isQueryExecuted}
        records={records}
        fetchRecords={handleFetchRecords}
        loading={loading}
        error={error}
        query={query}
        dataTooltipId={'healthSourceQuery'}
        isTemplate={isTemplate}
        expressions={expressions}
        isConnectorRuntimeOrExpression={isConnectorRuntimeOrExpression}
      />
    </Card>
  )
}
